import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { DocumentView } from "@/components/document-view/DocumentView";
import { DOCUMENT_WORKFLOW } from "@/workflow/definitions";
import { computeCompletion } from "@template-generator/shared/utils/fields";

export function DocumentPreviewPage() {
  const document = useDocumentStore((s) => s.document)!;
  const editableFields = useDocumentStore((s) => s.editableFields);
  const data = useDocumentStore((s) => s.data);
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);

  const mergedTemplate = getMergedTemplate();
  const { missingRequired } = computeCompletion(editableFields, data);
  const fillPath = DOCUMENT_WORKFLOW.steps[1]!.path(document.id);

  return (
    <WorkflowLayout workflow={DOCUMENT_WORKFLOW} current="preview" entityId={document.id} title={document.name}>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-5 py-2 text-xs">
          {missingRequired.length > 0 ? (
            <span className="flex items-center gap-1.5 text-amber-700">
              <AlertTriangle size={13} />
              {missingRequired.length} champ{missingRequired.length > 1 ? "s" : ""} obligatoire{missingRequired.length > 1 ? "s" : ""} vide{missingRequired.length > 1 ? "s" : ""} :
              {missingRequired.map((f) => (
                <Link key={`${f.nodeId}.${f.propKey}`} to={fillPath} className="font-medium underline hover:no-underline">
                  {f.label}
                </Link>
              ))}
              <span className="text-gray-400">— vous pouvez quand même exporter.</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 size={13} />
              Tous les champs obligatoires sont remplis. Le document s'affiche exactement comme dans le PDF.
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-200/70 p-8">
          {mergedTemplate && <DocumentView template={mergedTemplate} />}
        </div>
      </div>
    </WorkflowLayout>
  );
}
