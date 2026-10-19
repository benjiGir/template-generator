import { useEditorStore } from "@/store/editor-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { ThemePanel } from "@/components/inspector/ThemePanel";
import { DocumentView } from "@/components/document-view/DocumentView";
import { TEMPLATE_WORKFLOW } from "@/workflow/definitions";

export function TemplateThemePage() {
  const template = useEditorStore((s) => s.template)!;

  return (
    <WorkflowLayout
      workflow={TEMPLATE_WORKFLOW}
      current="theme"
      entityId={template.id}
      title={template.name}
    >
      <div className="flex h-full overflow-hidden">
        <aside className="w-[380px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Identité visuelle</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Facultatif : le thème par défaut fonctionne. Chaque réglage s'applique à tout le document.
            </p>
          </div>
          <ThemePanel />
        </aside>

        <div className="flex-1 overflow-y-auto bg-slate-200/70 p-8">
          {template.pages.every((p) => p.children.length === 0) ? (
            <p className="mt-16 text-center text-sm text-gray-500">
              Le template est encore vide : l'aperçu du thème apparaîtra dès l'étape « Construire ».
            </p>
          ) : (
            <DocumentView template={template} />
          )}
        </div>
      </div>
    </WorkflowLayout>
  );
}
