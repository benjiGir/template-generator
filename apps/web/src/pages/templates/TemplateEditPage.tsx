import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useEditorStore } from "@/store/editor-store";
import { useTemplateSave } from "@/hooks/useTemplateSave";
import { useExportPdf } from "@/hooks/useExportPdf";
import { EditorLayout } from "@/layouts/EditorLayout";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { buildWorkflowSteps, useTemplateWorkflow } from "./hooks/useTemplateWorkflow";

const CURRENT_STEP = 2;

export function TemplateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goToStep } = useTemplateWorkflow();
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const template = useEditorStore((s) => s.template);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { save, saving, isDirty } = useTemplateSave();
  const { exportPdf } = useExportPdf();

  useEffect(() => {
    if (!id) return;
    if (template?.id === id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.templates
      .get(id)
      .then((t) => {
        loadTemplate(t);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [id, loadTemplate, template?.id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Chargement du template...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-red-500">{error ?? "Template introuvable"}</p>
        <button
          onClick={() => navigate("/templates")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour aux templates
        </button>
      </div>
    );
  }

  const hasComponents = template.pages.some((p) => p.children.length > 0);
  const steps = buildWorkflowSteps(CURRENT_STEP);

  const footerActions = (
    <>
      <button
        onClick={save}
        disabled={!isDirty || saving}
        className="px-3 py-1.5 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </button>
      <button
        onClick={exportPdf}
        className="px-3 py-1.5 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 transition-colors"
        title="Exporter en PDF"
      >
        Export PDF
      </button>
    </>
  );

  return (
    <WorkflowLayout
      title="Atelier Templates"
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={hasComponents}
      footerActions={footerActions}
      onPrevious={() => navigate(`/templates/${id}/theme`)}
      onNext={() => navigate(`/templates/${id}/publish`)}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key && id) goToStep(key, id);
      }}
    >
      <EditorLayout />
    </WorkflowLayout>
  );
}
