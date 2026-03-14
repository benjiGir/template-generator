import { useNavigate } from "react-router-dom";

export const DOCUMENT_WORKFLOW_STEPS = [
  { key: "select",  label: "Choisir un template" },
  { key: "fill",    label: "Remplir" },
  { key: "preview", label: "Prévisualiser" },
  { key: "export",  label: "Exporter" },
] as const;

export function buildDocumentWorkflowSteps(currentStep: number) {
  return DOCUMENT_WORKFLOW_STEPS.map((s, index) => ({
    key:        s.key,
    label:      s.label,
    isComplete: index < currentStep,
    isActive:   index === currentStep,
  }));
}

export function useDocumentWorkflow() {
  const navigate = useNavigate();

  function goToStep(stepKey: string, docId?: string) {
    switch (stepKey) {
      case "select":  navigate("/documents/new"); break;
      case "fill":    if (docId) navigate(`/documents/${docId}/fill`); break;
      case "preview": if (docId) navigate(`/documents/${docId}/preview`); break;
      case "export":  if (docId) navigate(`/documents/${docId}/export`); break;
    }
  }

  return { navigate, goToStep };
}
