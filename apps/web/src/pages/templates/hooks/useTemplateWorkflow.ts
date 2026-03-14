import { useParams, useNavigate } from "react-router-dom";

export const TEMPLATE_WORKFLOW_STEPS = [
  { key: "start",   label: "Point de départ" },
  { key: "theme",   label: "Thème" },
  { key: "build",   label: "Construire" },
  { key: "publish", label: "Publier" },
] as const;

export function buildWorkflowSteps(currentStep: number) {
  return TEMPLATE_WORKFLOW_STEPS.map((s, index) => ({
    key:        s.key,
    label:      s.label,
    isComplete: index < currentStep,
    isActive:   index === currentStep,
  }));
}

export function useTemplateWorkflow() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  function goToStep(stepKey: string, templateId: string) {
    switch (stepKey) {
      case "start":   navigate("/templates/new"); break;
      case "theme":   navigate(`/templates/${templateId}/theme`); break;
      case "build":   navigate(`/templates/${templateId}/edit`); break;
      case "publish": navigate(`/templates/${templateId}/publish`); break;
    }
  }

  return { id, navigate, goToStep };
}
