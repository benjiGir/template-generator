import { FileDown } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { EditorLayout } from "@/layouts/EditorLayout";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { usePrintDocument } from "@/components/document-view/usePrintDocument";
import { TEMPLATE_WORKFLOW } from "@/workflow/definitions";

export function TemplateBuildPage() {
  const template = useEditorStore((s) => s.template)!;
  const { print, printNode, printing } = usePrintDocument();

  const hasComponents = template.pages.some((p) => p.children.length > 0);

  return (
    <WorkflowLayout
      workflow={TEMPLATE_WORKFLOW}
      current="build"
      entityId={template.id}
      title={template.name}
      compact
      guard={hasComponents ? { ok: true } : { ok: false, reason: "Ajoutez au moins un composant" }}
      secondaryActions={
        <button
          onClick={() => print({ template, format: "auto", title: template.name })}
          disabled={printing}
          title="Imprimer le template avec son contenu par défaut"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          <FileDown size={14} />
          Aperçu PDF
        </button>
      }
    >
      <EditorLayout />
      {printNode}
    </WorkflowLayout>
  );
}
