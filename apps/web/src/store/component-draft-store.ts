import { create } from "zustand";
import type { ComponentCategory } from "@template-generator/shared/types/component";

interface ComponentDraftState {
  baseType: string | null;
  props: Record<string, unknown>;
  setBaseType: (type: string, defaultProps: Record<string, unknown>) => void;
  updateProp: (key: string, value: unknown) => void;
  reset: () => void;
}

export const useComponentDraftStore = create<ComponentDraftState>((set) => ({
  baseType: null,
  props: {},

  setBaseType: (type, defaultProps) =>
    set({ baseType: type, props: { ...defaultProps } }),

  updateProp: (key, value) =>
    set((s) => ({ props: { ...s.props, [key]: value } })),

  reset: () => set({ baseType: null, props: {} }),
}));

export type { ComponentCategory };
