import { useState } from "react";
import { Download, CheckCircle } from "lucide-react";
import type { Template } from "@template-generator/shared/types/template";

interface ExportPanelProps {
  documentName: string;
  mergedTemplate: Template | null;
  onFinalize: () => Promise<void>;
}

export function ExportPanel({ documentName, mergedTemplate, onFinalize }: ExportPanelProps) {
  const [filename, setFilename] = useState(documentName);
  const [pageFormat, setPageFormat] = useState<"auto" | "a4">("auto");
  const [exporting, setExporting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalized, setFinalized] = useState(false);

  const handleExport = () => {
    if (!mergedTemplate) return;
    setExporting(true);

    const pages = window.document.querySelectorAll<HTMLElement>("[data-doc-page]");

    let styleContent: string;
    if (pageFormat === "a4") {
      styleContent = `@page { size: A4; margin: 0; }`;
    } else {
      let maxHeight = 0;
      pages.forEach((p) => {
        if (p.offsetHeight > maxHeight) maxHeight = p.offsetHeight;
      });
      const heightMM = Math.ceil(maxHeight * 0.2646) + 2;
      const widthStr = mergedTemplate.pageFormat.width;
      styleContent = `@page { size: ${widthStr} ${heightMM}mm; margin: 0; }`;
    }

    // Inject title for the PDF filename
    const prevTitle = window.document.title;
    window.document.title = filename || documentName;

    window.document.getElementById("print-page-size")?.remove();
    const styleEl = window.document.createElement("style");
    styleEl.id = "print-page-size";
    styleEl.textContent = styleContent;
    window.document.head.appendChild(styleEl);

    window.print();

    setTimeout(() => {
      window.document.getElementById("print-page-size")?.remove();
      window.document.title = prevTitle;
      setExporting(false);
    }, 1000);
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await onFinalize();
      setFinalized(true);
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Options d'export</h2>

        {/* Filename */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-medium text-gray-700">Nom du fichier</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="nom-du-document"
          />
        </div>

        {/* Page format */}
        <div className="space-y-1.5 mb-6">
          <label className="text-xs font-medium text-gray-700">Format de page</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPageFormat("auto")}
              className={`flex-1 py-2 text-xs font-medium rounded-md border transition-colors ${
                pageFormat === "auto"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Adapté au contenu
            </button>
            <button
              onClick={() => setPageFormat("a4")}
              className={`flex-1 py-2 text-xs font-medium rounded-md border transition-colors ${
                pageFormat === "a4"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              Forcer A4
            </button>
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={exporting || !mergedTemplate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={14} />
          {exporting ? "Génération..." : "Exporter en PDF"}
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Finalize */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Finaliser le document</h2>
        <p className="text-xs text-gray-500 mb-3">
          Marque le document comme finalisé. Vous pourrez toujours l'éditer ensuite.
        </p>
        {finalized ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={15} />
            Document finalisé
          </div>
        ) : (
          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="w-full px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {finalizing ? "En cours..." : "Marquer comme finalisé"}
          </button>
        )}
      </div>
    </div>
  );
}
