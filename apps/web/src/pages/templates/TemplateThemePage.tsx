import { useLoadedTemplate } from "@/store/editor-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { TemplateTitle } from "@/components/inspector/TemplateTitle";
import { ThemePanel } from "@/components/inspector/ThemePanel";
import { PreviewPane } from "@/components/document-view/PreviewPane";
import { SAMPLE_PAGE } from "@/components/document-view/samplePage";
import { TEMPLATE_WORKFLOW } from "@/workflow/definitions";

export function TemplateThemePage() {
  const template = useLoadedTemplate();
  const isEmpty = template.pages.every((p) => p.children.length === 0);

  return (
    <WorkflowLayout workflow={TEMPLATE_WORKFLOW} current="theme" entityId={template.id} title={<TemplateTitle />}>
      <div className="flex h-full overflow-hidden">
        <aside className="w-[400px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Identité visuelle</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Facultatif : le thème par défaut fonctionne. Chaque réglage s'applique à tout le document.
            </p>
          </div>
          <ThemePanel />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {isEmpty && (
            <p className="shrink-0 border-b border-blue-100 bg-blue-50 px-4 py-2 text-xs text-blue-800">
              Le template est encore vide : le thème s'applique ici à une page d'exemple, qui ne fait pas partie du
              template.
            </p>
          )}
          <div className="min-h-0 flex-1">
            <PreviewPane template={isEmpty ? { ...template, pages: [SAMPLE_PAGE] } : template} />
          </div>
        </div>
      </div>
    </WorkflowLayout>
  );
}
