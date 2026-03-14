import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useDocumentStore } from "@/store/document-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { ComponentRenderer } from "@template-generator/component-registry/renderer";
import { buildDocumentWorkflowSteps, useDocumentWorkflow } from "./hooks/useDocumentWorkflow";

const CURRENT_STEP = 2;

export function DocumentPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goToStep } = useDocumentWorkflow();

  const loadDocument = useDocumentStore((s) => s.loadDocument);
  const document = useDocumentStore((s) => s.document);
  const editableFields = useDocumentStore((s) => s.editableFields);
  const getCompletionPercent = useDocumentStore((s) => s.getCompletionPercent);
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);
  const data = useDocumentStore((s) => s.data);

  const { data: fetchedDoc, isLoading, isError } = useQuery({
    queryKey: queryKeys.documents.detail(id!),
    queryFn: () => api.documents.get(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (fetchedDoc) loadDocument(fetchedDoc);
  }, [fetchedDoc, loadDocument]);

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
  const completion = getCompletionPercent();

  const missingRequired = editableFields.filter((f) => {
    if (!f.required) return false;
    const val = data[`${f.nodeId}.${f.propKey}`];
    return val === undefined || val === null || val === "";
  });

  const infoBar = (
    <div className="shrink-0 flex items-center gap-4 px-5 py-2 bg-white border-b border-gray-200 text-xs">
      <span className="text-gray-500">
        Complétion : <span className="font-semibold text-gray-900">{completion}%</span>
      </span>
      {missingRequired.length > 0 && (
        <button
          onClick={() => navigate(`/documents/${id}/fill`)}
          className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700"
        >
          <AlertTriangle size={12} />
          {missingRequired.length} champ{missingRequired.length > 1 ? "s" : ""} requis manquant
          {missingRequired.length > 1 ? "s" : ""} — cliquez pour corriger
        </button>
      )}
    </div>
  );

  return (
    <WorkflowLayout
      title={document.name}
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={true}
      onPrevious={() => navigate(`/documents/${id}/fill`)}
      onNext={() => navigate(`/documents/${id}/export`)}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key) goToStep(key, id);
      }}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {infoBar}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <p className="text-xs text-gray-400 text-center mb-4">Aperçu lecture seule</p>
          {mergedTemplate?.pages.map((page) => (
            <div
              key={page.id}
              data-doc-page
              className="mx-auto bg-white shadow-md mb-6 overflow-hidden"
              style={{
                width:           mergedTemplate.pageFormat.width,
                minHeight:       mergedTemplate.pageFormat.height,
                padding:         mergedTemplate.pageFormat.padding,
                fontFamily:      mergedTemplate.theme.typography.fontFamily,
                fontSize:        mergedTemplate.theme.typography.baseFontSize,
                color:           mergedTemplate.theme.colors.text,
                backgroundColor: mergedTemplate.theme.colors.background,
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
          ))}
        </div>
      </div>
    </WorkflowLayout>
  );
}
