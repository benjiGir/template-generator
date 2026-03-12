import { useExportPdf } from "@/hooks/useExportPdf";

export function ExportButton() {
  const { exportPdf } = useExportPdf();

  return (
    <button
      onClick={exportPdf}
      className="px-3 py-1.5 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 transition-colors"
      title="Exporter en PDF (Ctrl+P → Enregistrer en PDF)"
    >
      Export PDF
    </button>
  );
}
