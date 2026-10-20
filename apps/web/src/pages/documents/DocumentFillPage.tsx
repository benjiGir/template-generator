import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDocumentStore } from "@/store/document-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { DocumentTitle } from "@/components/document/DocumentTitle";
import { FormFillMode, FOCUS_PARAM } from "@/components/document/FormFillMode";
import { InlineFillMode } from "@/components/document/InlineFillMode";
import { FillModeToggle } from "@/components/document/FillModeToggle";
import { DOCUMENT_WORKFLOW } from "@/workflow/definitions";

export function DocumentFillPage() {
  const document = useDocumentStore((s) => s.document)!;
  const fillMode = useDocumentStore((s) => s.fillMode);
  const setFillMode = useDocumentStore((s) => s.setFillMode);
  const [searchParams] = useSearchParams();

  // Un lien vers un champ précis s'ouvre dans le formulaire
  useEffect(() => {
    if (searchParams.has(FOCUS_PARAM)) setFillMode("form");
  }, [searchParams, setFillMode]);

  return (
    <WorkflowLayout
      workflow={DOCUMENT_WORKFLOW}
      current="fill"
      entityId={document.id}
      title={<DocumentTitle />}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-3 border-b border-rule bg-paper px-5">
          <FillModeToggle />
        </div>
        <div className="flex-1 overflow-hidden">
          {fillMode === "form" ? <FormFillMode /> : <InlineFillMode />}
        </div>
      </div>
    </WorkflowLayout>
  );
}
