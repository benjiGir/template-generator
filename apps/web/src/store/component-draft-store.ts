import { create } from "zustand";
import type { ComponentCategory } from "@template-generator/shared/types/component";
import type { ComponentPreset } from "@template-generator/shared/types/document";

interface ComponentDraftState {
  baseType: string | null;
  props: Record<string, unknown>;
  editingId: string | null;
  editingLabel: string;
  editingDescription: string;
  editingCategory: ComponentCategory;
  setBaseType: (type: string, defaultProps: Record<string, unknown>) => void;
  updateProp: (key: string, value: unknown) => void;
  loadPreset: (preset: ComponentPreset) => void;
  reset: () => void;
}

export const useComponentDraftStore = create<ComponentDraftState>((set) => ({
  baseType: null,
  props: {},
  editingId: null,
  editingLabel: "",
  editingDescription: "",
  editingCategory: "content",

  setBaseType: (type, defaultProps) =>
    set({ baseType: type, props: { ...defaultProps } }),

  updateProp: (key, value) =>
    set((s) => ({ props: { ...s.props, [key]: value } })),

  loadPreset: (preset) =>
    set({
      editingId: preset.id,
      baseType: preset.baseType,
      props: { ...preset.defaultProps },
      editingLabel: preset.label,
      editingDescription: preset.description ?? "",
      editingCategory: (preset.category as ComponentCategory) ?? "content",
    }),

  reset: () =>
    set({
      baseType: null,
      props: {},
      editingId: null,
      editingLabel: "",
      editingDescription: "",
      editingCategory: "content",
    }),
}));

export type { ComponentCategory };
