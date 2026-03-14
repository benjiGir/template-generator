import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useEditorStore } from "@/store/editor-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { ThemePanel } from "@/components/inspector/ThemePanel";
import { ComponentRenderer } from "@template-generator/component-registry/renderer";
import { buildWorkflowSteps, useTemplateWorkflow } from "./hooks/useTemplateWorkflow";

const CURRENT_STEP = 1;

export function TemplateThemePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goToStep } = useTemplateWorkflow();
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const template = useEditorStore((s) => s.template);

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
        <p className="text-sm text-gray-400">Chargement...</p>
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

  return (
    <WorkflowLayout
      title="Atelier Templates"
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={true}
      onPrevious={() => navigate("/templates/new")}
      onNext={() => navigate(`/templates/${id}/edit`)}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key && id) goToStep(key, id);
      }}
    >
      <div className="h-full flex overflow-hidden">
        <div className="w-[380px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Thème</h2>
            <p className="text-xs text-gray-500 mt-0.5">Configurez l'identité visuelle de votre template</p>
          </div>
          <ThemePanel />
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="text-xs text-gray-500 text-center mb-4">Aperçu en temps réel</div>
          {template.pages.map((page) => (
            <div
              key={page.id}
              className="mx-auto bg-white shadow-md mb-6 overflow-hidden"
              style={{
                width: template.pageFormat.width,
                minHeight: template.pageFormat.height,
                padding: template.pageFormat.padding,
                fontFamily: template.theme.typography.fontFamily,
                fontSize: template.theme.typography.baseFontSize,
                color: template.theme.colors.text,
                backgroundColor: template.theme.colors.background,
              }}
            >
              {page.children.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-300 text-sm">Page vide</div>
              ) : (
                page.children.map((node) => (
                  <ComponentRenderer key={node.id} node={node} theme={template.theme} />
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </WorkflowLayout>
  );
}
