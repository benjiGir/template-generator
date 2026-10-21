import { useEffect } from "react";
import { Loader2, X } from "lucide-react";
import type { Template } from "@template-generator/shared/types/template";
import { PreviewPane } from "./PreviewPane";
import { KIND_STYLES, type ObjectKind } from "@/components/ui/ObjectIdentity";

interface Props {
  title: string;
  subtitle?: string;
  /** null pendant le chargement */
  template: Pick<Template, "theme" | "pageFormat" | "pages"> | null;
  actionLabel: string;
  onAction: () => void;
  pending?: boolean;
  onClose: () => void;
  /** Ce que l'action crée : un document (Studio) ou une copie de template (Atelier) */
  kind?: ObjectKind;
}

/** Aperçu en grand d'un template, avant de le choisir comme base */
export function TemplatePreviewDialog({
  title,
  subtitle,
  template,
  actionLabel,
  onAction,
  pending = false,
  onClose,
  kind = "doc",
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[900] flex bg-slate-900/50 p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Aperçu de ${title}`}
        className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 border-b border-gray-200 px-5 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <button
            onClick={onAction}
            disabled={pending}
            className={`flex items-center gap-1.5 rounded-sm px-4 py-1.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60 ${KIND_STYLES[kind].bg}`}
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            {actionLabel}
          </button>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          {template ? (
            <PreviewPane template={template} framed />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" /> Chargement…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
