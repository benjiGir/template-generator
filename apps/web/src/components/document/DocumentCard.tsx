import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, FileDown, FileText, Trash2 } from "lucide-react";
import type { DocumentSummary } from "@/api/client";
import { DocumentThumbnail } from "@/components/document-view/DocumentView";
import { DocumentStatusBadge } from "@/components/ui/StatusBadge";
import { mergeDocumentData } from "@template-generator/shared/utils/fields";
import type { Template } from "@template-generator/shared/types/template";

/** Première page du document avec ses données : la miniature montre le vrai contenu */
function previewOf(doc: DocumentSummary): Pick<Template, "theme" | "pageFormat" | "pages"> | null {
  const p = doc.preview;
  if (!p?.theme || !p.pageFormat || !p.pages?.length) return null;
  return mergeDocumentData({ ...p, editableFields: p.editableFields ?? [] } as Template, doc.data ?? {});
}

interface Props {
  doc: DocumentSummary;
  onDuplicate?: (doc: DocumentSummary) => void;
  onDelete?: (doc: DocumentSummary) => void;
  compact?: boolean;
}

export function DocumentCard({ doc, onDuplicate, onDelete, compact = false }: Props) {
  const navigate = useNavigate();
  const preview = useMemo(() => previewOf(doc), [doc]);
  const thumbWidth = compact ? 260 : 300;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-md">
      <button onClick={() => navigate(`/documents/${doc.id}`)} className="block text-left" aria-label={`Ouvrir ${doc.name}`}>
        <div className="flex justify-center overflow-hidden border-b border-gray-100 bg-slate-100 px-5 pt-4">
          {preview ? (
            <div className="overflow-hidden rounded-t shadow-sm">
              <DocumentThumbnail template={preview} width={thumbWidth - 40} cropHeight={compact ? 110 : 150} />
            </div>
          ) : (
            <div className="flex w-full items-center justify-center bg-white" style={{ height: compact ? 110 : 150 }}>
              <FileText size={28} className="text-gray-200" />
            </div>
          )}
        </div>
        <div className="px-4 pb-2 pt-3">
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{doc.name}</h3>
            <DocumentStatusBadge document={doc} />
          </div>
          {doc.templateName && <p className="mt-0.5 truncate text-xs text-gray-500">{doc.templateName}</p>}
          {doc.status === "draft" ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${doc.completionPercent}%` }} />
              </div>
              <span className="shrink-0 text-[11px] text-gray-500">{doc.completionPercent}% rempli</span>
            </div>
          ) : null}
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between px-4 pb-3">
        <span className="text-[11px] text-gray-400">
          {new Date(doc.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        {!compact && (
          <div className="flex items-center gap-0.5">
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(doc)}
                title="Dupliquer pour une nouvelle édition"
                className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-gray-500 hover:bg-blue-50 hover:text-blue-700"
              >
                <Copy size={13} />
                Dupliquer
              </button>
            )}
            <Link
              to={`/documents/${doc.id}/export`}
              title="Exporter en PDF"
              aria-label={`Exporter ${doc.name}`}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <FileDown size={14} />
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(doc)}
                title="Supprimer"
                aria-label={`Supprimer ${doc.name}`}
                className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
