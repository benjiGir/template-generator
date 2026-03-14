import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useDocumentStore } from "@/store/document-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { ExportPanel } from "@/components/document/ExportPanel";
import { ComponentRenderer } from "@template-generator/component-registry/renderer";
import { buildDocumentWorkflowSteps, useDocumentWorkflow } from "./hooks/useDocumentWorkflow";

const CURRENT_STEP = 3;

/** Converts CSS dimension strings (mm, cm, in, px) to pixels */
function dimToPx(value: string): number {
  if (value.endsWith("mm")) return parseFloat(value) * 3.7795275591;
  if (value.endsWith("cm")) return parseFloat(value) * 37.795275591;
  if (value.endsWith("in")) return parseFloat(value) * 96;
  if (value.endsWith("px")) return parseFloat(value);
  return parseFloat(value) || 794;
}

export function DocumentExportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goToStep } = useDocumentWorkflow();
  const queryClient = useQueryClient();

  const loadDocument = useDocumentStore((s) => s.loadDocument);
  const document = useDocumentStore((s) => s.document);
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);

  const { data: fetchedDoc, isLoading, isError } = useQuery({
    queryKey: queryKeys.documents.detail(id!),
    queryFn: () => api.documents.get(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (fetchedDoc) loadDocument(fetchedDoc);
  }, [fetchedDoc, loadDocument]);

  const finalizeMutation = useMutation({
    mutationFn: () => api.documents.finalize(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(id!) });
    },
  });

  const steps = buildDocumentWorkflowSteps(CURRENT_STEP);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-red-500">Document introuvable</p>
        <button onClick={() => navigate("/documents")} className="text-sm text-blue-600 hover:underline">
          ← Retour aux documents
        </button>
      </div>
    );
  }

  const mergedTemplate = getMergedTemplate();

  return (
    <WorkflowLayout
      title={document.name}
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={false}
      nextLabel="Terminer"
      onPrevious={() => navigate(`/documents/${id}/preview`)}
      onNext={() => navigate("/documents")}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key) goToStep(key, id);
      }}
    >
      <div className="h-full flex overflow-hidden">
        {/* Left: export options */}
        <div className="w-[350px] shrink-0 border-r border-gray-200 bg-white overflow-hidden">
          <ExportPanel
            documentName={document.name}
            mergedTemplate={mergedTemplate}
            onFinalize={async () => { await finalizeMutation.mutateAsync(); }}
          />
        </div>

        {/* Right: scaled preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6 flex flex-col items-center">
          <p className="text-xs text-gray-400 mb-4">Aperçu du document</p>
          {mergedTemplate?.pages.map((page) => {
            const scaleTarget = 480;
            const pageWidthPx  = dimToPx(mergedTemplate.pageFormat.width);
            const pageHeightPx = dimToPx(mergedTemplate.pageFormat.height);
            const scale = scaleTarget / pageWidthPx;

            return (
              <div
                key={page.id}
                className="mb-6"
                style={{
                  width:    scaleTarget,
                  height:   pageHeightPx * scale,
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                }}
              >
                <div
                  style={{
                    width:           mergedTemplate.pageFormat.width,
                    minHeight:       mergedTemplate.pageFormat.height,
                    padding:         mergedTemplate.pageFormat.padding,
                    fontFamily:      mergedTemplate.theme.typography.fontFamily,
                    fontSize:        mergedTemplate.theme.typography.baseFontSize,
                    color:           mergedTemplate.theme.colors.text,
                    backgroundColor: mergedTemplate.theme.colors.background,
                    transform:       `scale(${scale})`,
                    transformOrigin: "top left",
                    pointerEvents:   "none",
                    userSelect:      "none",
                  }}
                >
                  {page.children.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-300 text-sm">Page vide</div>
                  ) : (
                    page.children.map((node) => (
                      <ComponentRenderer key={node.id} node={node} theme={mergedTemplate.theme} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WorkflowLayout>
  );
}
