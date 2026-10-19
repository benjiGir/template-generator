import { useDocumentStore } from "@/store/document-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { FormFillMode } from "@/components/document/FormFillMode";
import { InlineFillMode } from "@/components/document/InlineFillMode";
import { FillModeToggle } from "@/components/document/FillModeToggle";
import { DOCUMENT_WORKFLOW } from "@/workflow/definitions";
import { computeCompletion } from "@template-generator/shared/utils/fields";

export function DocumentFillPage() {
  const document = useDocumentStore((s) => s.document)!;
  const fillMode = useDocumentStore((s) => s.fillMode);
  const editableFields = useDocumentStore((s) => s.editableFields);
  const data = useDocumentStore((s) => s.data);

  const completion = computeCompletion(editableFields, data);

  return (
    <WorkflowLayout
      workflow={DOCUMENT_WORKFLOW}
      current="fill"
      entityId={document.id}
      title={document.name}
      secondaryActions={
        <span className="text-xs text-gray-500">
          {completion.filled}/{completion.total} champs remplis
          {completion.missingRequired.length > 0 && (
            <span className="text-amber-700"> · {completion.missingRequired.length} obligatoire{completion.missingRequired.length > 1 ? "s" : ""} vide{completion.missingRequired.length > 1 ? "s" : ""}</span>
          )}
        </span>
      }
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-5 py-2">
          <FillModeToggle />
        </div>
        <div className="flex-1 overflow-hidden">
          {fillMode === "form" ? <FormFillMode /> : <InlineFillMode />}
        </div>
      </div>
    </WorkflowLayout>
  );
}
