import { create } from "zustand";

interface WorkflowState {
  currentStep: number;
  totalSteps: number;
  stepsValidation: boolean[];
  setStep: (step: number) => void;
  validateStep: (step: number) => void;
  invalidateStep: (step: number) => void;
  canGoNext: () => boolean;
  reset: () => void;
}

const DEFAULT_STATE = {
  currentStep: 0,
  totalSteps: 0,
  stepsValidation: [] as boolean[],
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  ...DEFAULT_STATE,

  setStep: (step) => set({ currentStep: step }),

  validateStep: (step) =>
    set((s) => {
      const next = [...s.stepsValidation];
      next[step] = true;
      return { stepsValidation: next };
    }),

  invalidateStep: (step) =>
    set((s) => {
      const next = [...s.stepsValidation];
      next[step] = false;
      return { stepsValidation: next };
    }),

  canGoNext: () => {
    const { currentStep, stepsValidation } = get();
    return stepsValidation[currentStep] ?? false;
  },

  reset: () => set(DEFAULT_STATE),
}));
