import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileDown } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useDocumentStore } from "@/store/document-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { DocumentTitle } from "@/components/document/DocumentTitle";
import { ExportPanel } from "@/components/document/ExportPanel";
import { PreviewPane } from "@/components/document-view/PreviewPane";
import { usePrintDocument, type PrintFormat } from "@/components/document-view/usePrintDocument";
import { useWorkflowSession } from "@/workflow/session";
import { DOCUMENT_WORKFLOW } from "@/workflow/definitions";

export function DocumentExportPage() {
  const queryClient = useQueryClient();
  const session = useWorkflowSession();
  const document = useDocumentStore((s) => s.document)!;
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);
  const applyServerState = useDocumentStore((s) => s.applyServerState);
  const { print, printNode } = usePrintDocument();

  const [filename, setFilename] = useState(document.name);
  const [format, setFormat] = useState<PrintFormat>("auto");
  const [exportedAt, setExportedAt] = useState<Date | null>(null);

  const mergedTemplate = getMergedTemplate()!;

  const handleExport = async () => {
    await session?.flush();
    await print({ template: mergedTemplate, format, title: filename.trim() || document.name });
    const updated = await api.documents.markExported(document.id);
    applyServerState(updated);
    setExportedAt(new Date());
    queryClient.setQueryData(queryKeys.documents.detail(updated.id), updated);
    void queryClient.invalidateQueries({ queryKey: queryKeys.documents.list() });
  };

  return (
    <WorkflowLayout
      workflow={DOCUMENT_WORKFLOW}
      current="export"
      entityId={document.id}
      title={<DocumentTitle />}
      finalAction={{ label: exportedAt ? "Exporter à nouveau" : "Exporter en PDF", icon: <FileDown size={15} />, onClick: handleExport }}
    >
      <div className="flex h-full overflow-hidden">
        <aside className="w-[380px] shrink-0 overflow-hidden border-r border-gray-200 bg-white">
          <ExportPanel
            filename={filename}
            onFilenameChange={setFilename}
            format={format}
            onFormatChange={setFormat}
            exportedAt={exportedAt}
            editPath={DOCUMENT_WORKFLOW.steps[1]!.path(document.id)}
          />
        </aside>
        <div className="min-w-0 flex-1">
          <PreviewPane template={mergedTemplate} />
        </div>
      </div>
      {printNode}
    </WorkflowLayout>
  );
}
