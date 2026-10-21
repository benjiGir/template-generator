import { create } from "zustand";
import { isFilled, mergeDocumentData, withNodeDefaults } from "@template-generator/shared/utils/fields";
import type { Document } from "@template-generator/shared/types/document";
import type { Template, EditableField } from "@template-generator/shared/types/template";

interface DocumentState {
  document: Document | null;
  templateSnapshot: Template | null;
  editableFields: EditableField[];
  data: Record<string, unknown>;
  fillMode: "form" | "inline";
  /** Incrémenté à chaque saisie ; comparé à savedRevision pour savoir s'il reste à sauvegarder */
  revision: number;
  savedRevision: number;

  loadDocument: (doc: Document) => void;
  /** Met à jour les métadonnées venues du serveur (statut, progression) sans toucher à la saisie */
  applyServerState: (doc: Document) => void;
  updateField: (fieldKey: string, value: unknown) => void;
  setFillMode: (mode: "form" | "inline") => void;
  markSaved: (revision: number) => void;
  getMergedTemplate: () => Template | null;
  reset: () => void;
}

const EMPTY = {
  document: null,
  templateSnapshot: null,
  editableFields: [],
  data: {},
  revision: 0,
  savedRevision: 0,
};

const FILL_MODE_KEY = "docforge-fill-mode";

/** Préférence de remplissage mémorisée dans ce navigateur (absente en navigation privée : formulaire) */
function storedFillMode(): "form" | "inline" {
  try {
    return localStorage.getItem(FILL_MODE_KEY) === "inline" ? "inline" : "form";
  } catch {
    return "form";
  }
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  ...EMPTY,
  fillMode: storedFillMode(),

  loadDocument: (doc) => {
    const snapshot = doc.templateSnapshot;
    set({
      document: doc,
      templateSnapshot: snapshot,
      // Documents antérieurs : la valeur par défaut est relue dans le snapshot
      editableFields: withNodeDefaults(snapshot?.editableFields ?? [], snapshot?.pages ?? []).toSorted(
        (a, b) => a.order - b.order,
      ),
      data: doc.data ?? {},
      revision: 0,
      savedRevision: 0,
    });
  },

  applyServerState: (doc) => set((s) => (s.document?.id === doc.id ? { document: { ...doc, data: s.data } } : s)),

  // Un champ vidé est retiré : le document reprend le contenu du template
  updateField: (fieldKey, value) =>
    set((s) => {
      const data = { ...s.data };
      if (isFilled(value)) data[fieldKey] = value;
      else delete data[fieldKey];
      return { data, revision: s.revision + 1 };
    }),

  setFillMode: (mode) => {
    try {
      localStorage.setItem(FILL_MODE_KEY, mode);
    } catch {
      // stockage indisponible : la préférence ne vaut que pour cette session
    }
    set({ fillMode: mode });
  },

  markSaved: (revision) => set((s) => ({ savedRevision: Math.max(s.savedRevision, revision) })),

  getMergedTemplate: () => {
    const { templateSnapshot, data } = get();
    if (!templateSnapshot) return null;
    return mergeDocumentData(templateSnapshot, data);
  },

  reset: () => set(EMPTY),
}));
