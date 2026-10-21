import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { PrintFormat } from "@/components/document-view/usePrintDocument";

interface ExportPanelProps {
  filename: string;
  onFilenameChange: (value: string) => void;
  format: PrintFormat;
  onFormatChange: (value: PrintFormat) => void;
  /** Date du dernier export de cette session, s'il a eu lieu */
  exportedAt: Date | null;
  editPath: string;
}

export function ExportPanel({
  filename,
  onFilenameChange,
  format,
  onFormatChange,
  exportedAt,
  editPath,
}: ExportPanelProps) {
  return (
    <div className="h-full space-y-6 overflow-y-auto p-6">
      {exportedAt && (
        <div className="rounded-lg border border-ink bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <CheckCircle2 size={16} />
            Document finalisé
          </p>
          <p className="mt-1 text-xs text-ink/80">
            Si le PDF n'a pas été enregistré, relancez simplement l'export. Vous pouvez toujours modifier le document.
          </p>
          <div className="mt-3 flex gap-3 text-xs font-medium">
            <Link to={editPath} className="text-ink underline hover:no-underline">
              Revenir à l'édition
            </Link>
            <Link to="/documents" className="text-ink underline hover:no-underline">
              Retour aux documents
            </Link>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Options d'export</h2>

        <div className="space-y-1.5">
          <label htmlFor="export-filename" className="text-xs font-medium text-gray-700">
            Nom du fichier
          </label>
          <div className="flex items-center rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-ink">
            <input
              id="export-filename"
              type="text"
              value={filename}
              onChange={(e) => onFilenameChange(e.target.value)}
              className="min-w-0 flex-1 rounded-md px-3 py-2 text-sm focus:outline-none"
            />
            <span className="pr-3 text-sm text-gray-400">.pdf</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-medium text-gray-700">Format de page</span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["auto", "Adapté au contenu", "Chaque page garde sa hauteur, sans découpe"],
                ["a4", "A4 standard", "Les pages longues sont découpées"],
              ] as const
            ).map(([value, label, hint]) => (
              <button
                key={value}
                onClick={() => onFormatChange(value)}
                className={`rounded-md border px-3 py-2 text-left transition-colors ${
                  format === value ? "border-doc bg-doc-tint" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className={`block text-xs font-medium ${format === value ? "text-doc-strong" : "text-gray-700"}`}>
                  {label}
                </span>
                <span className="block text-[11px] text-gray-500">{hint}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-xs font-semibold text-gray-800">Ce qui va se passer</h3>
        <p className="mt-1 text-xs text-gray-600">
          La fenêtre d'impression de votre navigateur va s'ouvrir. Elle ne fait pas partie de DocForge ; réglez-la ainsi
          :
        </p>
        <PrintDialogIllustration />
        <p className="mt-3 text-[11px] text-gray-500">
          Puis cliquez sur <span className="font-semibold">Enregistrer</span>. Les couleurs de fond sont incluses
          automatiquement, et le document sera marqué comme finalisé.
        </p>
      </section>
    </div>
  );
}

/** Maquette simplifiée de la boîte d'impression, réglages attendus mis en évidence */
function PrintDialogIllustration() {
  const row = (label: string, value: string, highlight: boolean, step?: number) => (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
        {step && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-doc text-[9px] font-bold text-white">
            {step}
          </span>
        )}
        {label}
      </span>
      <span
        className={`min-w-[150px] rounded border px-2 py-0.5 text-[11px] ${
          highlight
            ? "border-doc bg-doc-tint font-semibold text-doc-strong ring-2 ring-doc/30"
            : "border-gray-200 bg-white text-gray-400"
        }`}
      >
        {value}
      </span>
    </div>
  );
  return (
    <div
      className="mt-3 rounded-md border border-gray-300 bg-white p-3 shadow-sm"
      aria-label="Réglages à choisir dans la fenêtre d'impression"
    >
      <div className="mb-1 text-[11px] font-semibold text-gray-700">Imprimer</div>
      {row("Destination", "Enregistrer au format PDF", true, 1)}
      {row("Pages", "Toutes", false)}
      <div className="mt-1 border-t border-gray-100 pt-1 text-[10px] text-gray-400">Plus de paramètres ▾</div>
      {row("Marges", "Aucune", true, 2)}
      {row("Échelle", "Par défaut", false)}
    </div>
  );
}
