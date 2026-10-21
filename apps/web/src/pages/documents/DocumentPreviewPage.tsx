import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useDocumentStore, useLoadedDocument } from "@/store/document-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { DocumentTitle } from "@/components/document/DocumentTitle";
import { FOCUS_PARAM } from "@/components/document/FormFillMode";
import { PreviewPane } from "@/components/document-view/PreviewPane";
import { DOCUMENT_WORKFLOW, DOCUMENT_PATHS } from "@/workflow/definitions";
import { computeCompletion, fieldKey } from "@template-generator/shared/utils/fields";

/** Relecture : le document tel qu'il sortira en PDF, sans aucun outil d'édition */
export function DocumentPreviewPage() {
  const document = useLoadedDocument();
  const editableFields = useDocumentStore((s) => s.editableFields);
  const data = useDocumentStore((s) => s.data);
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);
  const [hovered, setHovered] = useState<string | null>(null);

  const mergedTemplate = getMergedTemplate();
  const { missingRequired } = computeCompletion(editableFields, data);
  const fillPath = DOCUMENT_PATHS.fill(document.id);

  return (
    <WorkflowLayout workflow={DOCUMENT_WORKFLOW} current="preview" entityId={document.id} title={<DocumentTitle />}>
      <div className="flex h-full flex-col overflow-hidden">
        <div
          className={`flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b px-5 py-2 text-xs ${
            missingRequired.length > 0 ? "border-amber-200 bg-amber-50" : "border-rule bg-white"
          }`}
        >
          {missingRequired.length > 0 ? (
            <>
              <span className="flex items-center gap-1.5 font-medium text-amber-800">
                <AlertTriangle size={13} />
                {missingRequired.length} champ{missingRequired.length > 1 ? "s" : ""} obligatoire
                {missingRequired.length > 1 ? "s" : ""} vide{missingRequired.length > 1 ? "s" : ""} :
              </span>
              {missingRequired.map((f) => (
                <Link
                  key={fieldKey(f)}
                  to={`${fillPath}?${FOCUS_PARAM}=${encodeURIComponent(fieldKey(f))}`}
                  onMouseEnter={() => setHovered(f.nodeId)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(f.nodeId)}
                  onBlur={() => setHovered(null)}
                  className="rounded bg-white px-1.5 py-0.5 font-medium text-amber-900 ring-1 ring-amber-200 hover:ring-amber-400"
                >
                  {f.label}
                </Link>
              ))}
              <span className="text-amber-700/80">Vous pouvez tout de même exporter.</span>
            </>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <CheckCircle2 size={13} />
              Tout est rempli. Voici exactement le document qui sera exporté.
            </span>
          )}
        </div>
        <div className="min-h-0 flex-1">
          {mergedTemplate && (
            <PreviewPane template={mergedTemplate} highlightNodeId={hovered} highlightTone="warning" framed />
          )}
        </div>
      </div>
    </WorkflowLayout>
  );
}
