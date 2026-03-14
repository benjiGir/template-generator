import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useEditorStore } from "@/store/editor-store";
import { EditorLayout } from "@/layouts/EditorLayout";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";

const WORKFLOW_STEPS = [
  { key: "start", label: "Point de départ" },
  { key: "theme", label: "Thème" },
  { key: "build", label: "Construire" },
  { key: "publish", label: "Publier" },
];

const CURRENT_STEP = 2;

export function TemplateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.templates
      .get(id)
      .then((template) => {
        loadTemplate(template);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [id, loadTemplate]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Chargement du template...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={() => navigate("/templates")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour aux templates
        </button>
      </div>
    );
  }

  const steps = WORKFLOW_STEPS.map((s, index) => ({
    ...s,
    isComplete: index < CURRENT_STEP,
    isActive: index === CURRENT_STEP,
  }));

  return (
    <WorkflowLayout
      title="Atelier Templates"
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={true}
      onPrevious={() => navigate(`/templates/${id}/theme`)}
      onNext={() => navigate(`/templates/${id}/publish`)}
      onStepClick={(stepIndex) => {
        const stepKey = WORKFLOW_STEPS[stepIndex]?.key;
        if (!stepKey) return;
        if (stepKey === "build") {
          navigate(`/templates/${id}/edit`);
        } else {
          navigate(`/templates/${id}/${stepKey}`);
        }
      }}
    >
      <EditorLayout />
    </WorkflowLayout>
  );
}
