import { create } from "zustand";
import { mergeDocumentData } from "@template-generator/shared/utils/fields";
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
  document:         null,
  templateSnapshot: null,
  editableFields:   [],
  data:             {},
  revision:         0,
  savedRevision:    0,
};

export const useDocumentStore = create<DocumentState>((set, get) => ({
  ...EMPTY,
  fillMode: "form",

  loadDocument: (doc) => {
    const snapshot = doc.templateSnapshot;
    set({
      document:         doc,
      templateSnapshot: snapshot,
      editableFields:   [...(snapshot?.editableFields ?? [])].sort((a, b) => a.order - b.order),
      data:             doc.data ?? {},
      revision:         0,
      savedRevision:    0,
    });
  },

  applyServerState: (doc) =>
    set((s) => (s.document?.id === doc.id ? { document: { ...doc, data: s.data } } : s)),

  updateField: (fieldKey, value) =>
    set((s) => ({ data: { ...s.data, [fieldKey]: value }, revision: s.revision + 1 })),

  setFillMode: (mode) => set({ fillMode: mode }),

  markSaved: (revision) => set((s) => ({ savedRevision: Math.max(s.savedRevision, revision) })),

  getMergedTemplate: () => {
    const { templateSnapshot, data } = get();
    if (!templateSnapshot) return null;
    return mergeDocumentData(templateSnapshot, data);
  },

  reset: () => set(EMPTY),
}));
