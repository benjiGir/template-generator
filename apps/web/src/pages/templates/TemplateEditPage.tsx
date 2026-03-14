import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
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

  const { save, saving, isDirty } = useTemplateSave();
  const { exportPdf } = useExportPdf();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.templates.detail(id!),
    queryFn: () => api.templates.get(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data && data.id !== template?.id) loadTemplate(data);
  }, [data, template?.id, loadTemplate]);

  const steps = buildWorkflowSteps(CURRENT_STEP);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Chargement du template...</p>
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-red-500">Template introuvable</p>
        <button onClick={() => navigate("/templates")} className="text-sm text-blue-600 hover:underline">
          ← Retour aux templates
        </button>
      </div>
    );
  }

  const hasComponents = template.pages.some((p) => p.children.length > 0);

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
