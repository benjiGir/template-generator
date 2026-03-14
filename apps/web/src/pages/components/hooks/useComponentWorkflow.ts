import { useNavigate } from "react-router-dom";

export const COMPONENT_WORKFLOW_STEPS = [
  { key: "select", label: "Composant de base" },
  { key: "edit",   label: "Configurer" },
  { key: "save",   label: "Sauvegarder" },
] as const;

export function buildComponentWorkflowSteps(currentStep: number) {
  return COMPONENT_WORKFLOW_STEPS.map((s, index) => ({
    key:        s.key,
    label:      s.label,
    isComplete: index < currentStep,
    isActive:   index === currentStep,
  }));
}

export function useComponentWorkflow() {
  const navigate = useNavigate();

  function goToStep(stepKey: string) {
    switch (stepKey) {
      case "select": navigate("/components/new"); break;
      case "edit":   navigate("/components/new/edit"); break;
      case "save":   navigate("/components/new/save"); break;
    }
  }

  return { navigate, goToStep };
}
