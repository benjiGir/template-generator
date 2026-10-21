import { Loader2, X } from "lucide-react";
import type { Template } from "@template-generator/shared/types/template";
import { PreviewPane } from "./PreviewPane";
import type { ObjectKind } from "@/components/ui/ObjectIdentity";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

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
  return (
    <Dialog placement="fill" label={`Aperçu de ${title}`} onClose={onClose} className="max-w-5xl">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-4 border-b border-rule px-5 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
            {subtitle && <p className="text-xs text-ink-subtle">{subtitle}</p>}
          </div>
          <Button variant="primary" tone={kind} pending={pending} onClick={onAction}>
            {actionLabel}
          </Button>
          <IconButton label="Fermer" icon={<X size={18} />} onClick={onClose} />
        </div>
        <div className="min-h-0 flex-1">
          {template ? (
            <PreviewPane template={template} framed />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-ink-faint">
              <Loader2 size={16} className="animate-spin" /> Chargement…
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
