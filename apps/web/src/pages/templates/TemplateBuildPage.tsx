import { FileDown } from "lucide-react";
import { useLoadedTemplate } from "@/store/editor-store";
import { EditorLayout } from "@/layouts/EditorLayout";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { TemplateTitle } from "@/components/inspector/TemplateTitle";
import { usePrintDocument } from "@/components/document-view/usePrintDocument";
import { TEMPLATE_WORKFLOW } from "@/workflow/definitions";
import { Button } from "@/components/ui/Button";

export function TemplateBuildPage() {
  const template = useLoadedTemplate();
  const { print, printNode, printing } = usePrintDocument();

  const hasComponents = template.pages.some((p) => p.children.length > 0);

  return (
    <WorkflowLayout
      workflow={TEMPLATE_WORKFLOW}
      current="build"
      entityId={template.id}
      title={<TemplateTitle />}
      compact
      guard={hasComponents ? { ok: true } : { ok: false, reason: "Ajoutez au moins un composant" }}
      secondaryActions={
        <Button
          variant="ghost"
          size="sm"
          icon={<FileDown size={14} />}
          pending={printing}
          title="Imprimer le template avec son contenu par défaut"
          onClick={() => print({ template, format: "auto", title: template.name })}
        >
          Aperçu PDF
        </Button>
      }
    >
      <EditorLayout />
      {printNode}
    </WorkflowLayout>
  );
}
