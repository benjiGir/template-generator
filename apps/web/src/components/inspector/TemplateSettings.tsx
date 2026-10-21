import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/Button";

const FORMAT_FIELDS = [
  { key: "width", label: "Largeur", hint: "ex. 210mm (A4)" },
  { key: "height", label: "Hauteur minimale", hint: "La page s'allonge si le contenu dépasse" },
  { key: "padding", label: "Marges intérieures", hint: "haut droite bas gauche, ex. 28px 36px" },
] as const;

/**
 * Réglages du template sans composant sélectionné : le format de page.
 * Le nom se modifie dans l'en-tête, les couleurs et la typographie dans l'onglet Thème.
 */
export function TemplateSettings({ onOpenTheme }: { onOpenTheme?: () => void }) {
  const pageFormat = useEditorStore((s) => s.template?.pageFormat);
  const updatePageFormat = useEditorStore((s) => s.updatePageFormat);

  if (!pageFormat) return null;

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Format de page</p>
        {FORMAT_FIELDS.map(({ key, label, hint }) => (
          <div key={key} className="space-y-1">
            <label htmlFor={`format-${key}`} className="text-xs text-ink-muted">
              {label}
            </label>
            <input
              id={`format-${key}`}
              type="text"
              key={pageFormat[key]}
              defaultValue={pageFormat[key]}
              onBlur={(e) => e.target.value !== pageFormat[key] && updatePageFormat({ [key]: e.target.value })}
              className="w-full rounded border border-rule px-2.5 py-1.5 font-mono text-xs focus:border-focus focus:outline-none"
            />
            <p className="text-[10px] text-ink-faint">{hint}</p>
          </div>
        ))}
      </div>
      {onOpenTheme && (
        <p className="text-[11px] text-ink-subtle">
          Couleurs, typographie et espacements :{" "}
          <Button variant="link" tone="tpl" onClick={onOpenTheme}>
            onglet Thème
          </Button>
        </p>
      )}
    </div>
  );
}
