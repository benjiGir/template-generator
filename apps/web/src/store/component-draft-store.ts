import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ComponentCategory } from "@template-generator/shared/types/component";
import type { ComponentPreset } from "@template-generator/shared/types/document";

interface ComponentDraftState {
  baseType: string | null;
  props: Record<string, unknown>;
  /** Preset modifié, ou null pour une création */
  editingId: string | null;
  label: string;
  description: string;
  category: ComponentCategory;
  /** Des changements non sauvegardés existent */
  dirty: boolean;
  setBaseType: (type: string, defaultProps: Record<string, unknown>, category: ComponentCategory, label: string) => void;
  updateProp: (key: string, value: unknown) => void;
  resetProps: (defaultProps: Record<string, unknown>) => void;
  setMeta: (meta: Partial<Pick<ComponentDraftState, "label" | "description" | "category">>) => void;
  loadPreset: (preset: ComponentPreset) => void;
  reset: () => void;
}

const EMPTY = {
  baseType:    null,
  props:       {},
  editingId:   null,
  label:       "",
  description: "",
  category:    "content" as ComponentCategory,
  dirty:       false,
};

/** Conservé dans sessionStorage : un rafraîchissement ne perd pas le preset en cours */
export const useComponentDraftStore = create<ComponentDraftState>()(
  persist(
    (set) => ({
      ...EMPTY,

      setBaseType: (type, defaultProps, category, label) =>
        set({ baseType: type, props: { ...defaultProps }, category, label, dirty: true }),

      updateProp: (key, value) =>
        set((s) => ({ props: { ...s.props, [key]: value }, dirty: true })),

      resetProps: (defaultProps) => set({ props: { ...defaultProps }, dirty: true }),

      setMeta: (meta) => set({ ...meta, dirty: true }),

      loadPreset: (preset) =>
        set({
          editingId:   preset.id,
          baseType:    preset.baseType,
          props:       { ...preset.defaultProps },
          label:       preset.label,
          description: preset.description ?? "",
          category:    preset.category ?? "content",
          dirty:       false,
        }),

      reset: () => set(EMPTY),
    }),
    { name: "docforge-preset-draft", storage: createJSONStorage(() => sessionStorage) }
  )
);
