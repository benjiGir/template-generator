import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, FileDown, FileText, Trash2 } from "lucide-react";
import type { DocumentSummary } from "@/api/client";
import { DocumentThumbnail } from "@/components/document-view/DocumentView";
import { DocumentStatusBadge } from "@/components/ui/StatusBadge";
import { TemplateRef } from "@/components/ui/ObjectIdentity";
import { SegmentedProgress } from "@/components/ui/SegmentedProgress";
import { mergeDocumentData } from "@template-generator/shared/utils/fields";
import type { PagePreview } from "@template-generator/shared/types/template";
import { Button, IconButton } from "@/components/ui/Button";

/** Première page du document avec ses données : la miniature montre le vrai contenu */
export function documentPreview(doc: DocumentSummary): PagePreview | null {
  const p = doc.preview;
  // Snapshots anciens ou incomplets : pas de miniature plutôt qu'une page cassée
  if (!p?.theme || !p.pageFormat || !p.pages?.length) return null;
  return mergeDocumentData({ ...p, editableFields: p.editableFields ?? [] }, doc.data ?? {});
}

interface Props {
  doc: DocumentSummary;
  onDuplicate?: (doc: DocumentSummary) => void;
  onDelete?: (doc: DocumentSummary) => void;
  compact?: boolean;
}

export function DocumentCard({ doc, onDuplicate, onDelete, compact = false }: Props) {
  const navigate = useNavigate();
  const preview = useMemo(() => documentPreview(doc), [doc]);
  const thumbWidth = compact ? 260 : 300;

  return (
    <div className="group flex flex-col overflow-hidden border border-rule bg-white transition-colors hover:border-ink">
      <button
        onClick={() => navigate(`/documents/${doc.id}`)}
        className="block text-left"
        aria-label={`Ouvrir ${doc.name}`}
      >
        <div className="flex justify-center overflow-hidden border-b border-rule bg-table px-5 pt-4">
          {preview ? (
            <div className="overflow-hidden border border-b-0 border-rule-strong shadow-[3px_0_0_var(--color-doc)]">
              <DocumentThumbnail template={preview} width={thumbWidth - 40} cropHeight={compact ? 110 : 150} />
            </div>
          ) : (
            <div className="flex w-full items-center justify-center bg-white" style={{ height: compact ? 110 : 150 }}>
              <FileText size={28} className="text-rule" />
            </div>
          )}
        </div>
        <div className="px-4 pb-2 pt-3">
          <h3 className="truncate text-sm font-semibold text-ink">{doc.name}</h3>
          {doc.templateName && (
            <div className="mt-0.5 flex">
              <TemplateRef name={doc.templateName} />
            </div>
          )}
          <div className="mt-1.5">
            <DocumentStatusBadge document={doc} />
          </div>
          {doc.status === "draft" ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1">
                <SegmentedProgress filled={doc.completionPercent} total={100} height={6} />
              </div>
              <span className="shrink-0 font-mono text-[11px] text-ink-soft">{doc.completionPercent} %</span>
            </div>
          ) : null}
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between px-4 pb-3">
        <span className="text-[11px] text-ink-faint">
          {new Date(doc.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        {!compact && (
          <div className="flex items-center gap-0.5">
            {onDuplicate && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy size={13} />}
                title="Dupliquer pour une nouvelle édition"
                onClick={() => onDuplicate(doc)}
              >
                Dupliquer
              </Button>
            )}
            <Link
              to={`/documents/${doc.id}/export`}
              title="Exporter en PDF"
              aria-label={`Exporter ${doc.name}`}
              className="rounded p-1.5 text-ink-faint hover:bg-wash hover:text-ink-soft"
            >
              <FileDown size={14} />
            </Link>
            {onDelete && (
              <IconButton
                label={`Supprimer ${doc.name}`}
                title="Supprimer"
                icon={<Trash2 size={14} />}
                tone="danger"
                onClick={() => onDelete(doc)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
