import { create } from "zustand";
import { api } from "@/api/client";
import { findNode } from "@template-generator/shared/utils/tree";
import type { Document } from "@template-generator/shared/types/document";
import type { Template, EditableField } from "@template-generator/shared/types/template";

function mergeDocumentData(
  snapshot: Template,
  editableFields: EditableField[],
  data: Record<string, unknown>,
): Template {
  const merged = JSON.parse(JSON.stringify(snapshot)) as Template;

  for (const field of editableFields) {
    const key = `${field.nodeId}.${field.propKey}`;
    if (!(key in data)) continue;
    for (const page of merged.pages) {
      const node = findNode(page.children, field.nodeId);
      if (node) {
        node.props[field.propKey] = data[key];
        break;
      }
    }
  }

  return merged;
}

interface DocumentState {
  document: Document | null;
  templateSnapshot: Template | null;
  editableFields: EditableField[];
  data: Record<string, unknown>;
  fillMode: "form" | "inline";
  isDirty: boolean;

  loadDocument: (doc: Document) => void;
  updateField: (fieldKey: string, value: unknown) => void;
  setFillMode: (mode: "form" | "inline") => void;
  getCompletionPercent: () => number;
  getMergedTemplate: () => Template | null;
  save: () => Promise<void>;
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  document:         null,
  templateSnapshot: null,
  editableFields:   [],
  data:             {},
  fillMode:         "form",
  isDirty:          false,

  loadDocument: (doc) => {
    const snapshot = doc.templateSnapshot as Template;
    const fields = (snapshot?.editableFields ?? []) as EditableField[];
    set({
      document:         doc,
      templateSnapshot: snapshot,
      editableFields:   fields,
      data:             (doc.data ?? {}) as Record<string, unknown>,
      isDirty:          false,
    });
  },

  updateField: (fieldKey, value) =>
    set((s) => ({ data: { ...s.data, [fieldKey]: value }, isDirty: true })),

  setFillMode: (mode) => set({ fillMode: mode }),

  getCompletionPercent: () => {
    const { editableFields, data } = get();
    if (editableFields.length === 0) return 100;
    const filled = editableFields.filter((f) => {
      const val = data[`${f.nodeId}.${f.propKey}`];
      return val !== undefined && val !== null && val !== "";
    }).length;
    return Math.round((filled / editableFields.length) * 100);
  },

  getMergedTemplate: () => {
    const { templateSnapshot, editableFields, data } = get();
    if (!templateSnapshot) return null;
    return mergeDocumentData(templateSnapshot, editableFields, data);
  },

  save: async () => {
    const { document, data } = get();
    if (!document) return;
    await api.documents.updateData(document.id, data);
    set({ isDirty: false });
  },

  reset: () =>
    set({
      document:         null,
      templateSnapshot: null,
      editableFields:   [],
      data:             {},
      isDirty:          false,
      fillMode:         "form",
    }),
}));
