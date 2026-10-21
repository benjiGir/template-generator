import { useState } from "react";
import { FileDown } from "lucide-react";
import { useDocumentStore, useLoadedDocument } from "@/store/document-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { DocumentTitle } from "@/components/document/DocumentTitle";
import { ExportPanel } from "@/components/document/ExportPanel";
import { PreviewPane } from "@/components/document-view/PreviewPane";
import { usePrintDocument, type PrintFormat } from "@/components/document-view/usePrintDocument";
import { useWorkflowSession } from "@/workflow/session";
import { DOCUMENT_WORKFLOW, DOCUMENT_PATHS } from "@/workflow/definitions";
import { useMarkDocumentExported } from "@/api/hooks/documents";

export function DocumentExportPage() {
  const markExported = useMarkDocumentExported();
  const session = useWorkflowSession();
  const document = useLoadedDocument();
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);
  const applyServerState = useDocumentStore((s) => s.applyServerState);
  const { print, printNode } = usePrintDocument();

  const [filename, setFilename] = useState(document.name);
  const [format, setFormat] = useState<PrintFormat>("auto");
  const [exportedAt, setExportedAt] = useState<Date | null>(null);

  const mergedTemplate = getMergedTemplate();
  if (!mergedTemplate) throw new Error("Snapshot du document absent : il ne peut pas être exporté");

  const handleExport = async () => {
    await session?.flush();
    await print({ template: mergedTemplate, format, title: filename.trim() || document.name });
    const updated = await markExported.mutateAsync(document.id);
    applyServerState(updated);
    setExportedAt(new Date());
  };

  return (
    <WorkflowLayout
      workflow={DOCUMENT_WORKFLOW}
      current="export"
      entityId={document.id}
      title={<DocumentTitle />}
      finalAction={{
        label: exportedAt ? "Exporter à nouveau" : "Exporter en PDF",
        icon: <FileDown size={15} />,
        onClick: handleExport,
      }}
    >
      <div className="flex h-full overflow-hidden">
        <aside className="w-[380px] shrink-0 overflow-hidden border-r border-gray-200 bg-white">
          <ExportPanel
            filename={filename}
            onFilenameChange={setFilename}
            format={format}
            onFormatChange={setFormat}
            exportedAt={exportedAt}
            editPath={DOCUMENT_PATHS.fill(document.id)}
          />
        </aside>
        <div className="min-w-0 flex-1">
          <PreviewPane template={mergedTemplate} framed />
        </div>
      </div>
      {printNode}
    </WorkflowLayout>
  );
}
