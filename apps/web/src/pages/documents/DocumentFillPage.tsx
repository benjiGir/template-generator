import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { useDocumentStore } from "@/store/document-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { FormFillMode } from "@/components/document/FormFillMode";
import { InlineFillMode } from "@/components/document/InlineFillMode";
import { FillModeToggle } from "@/components/document/FillModeToggle";
import { buildDocumentWorkflowSteps, useDocumentWorkflow } from "./hooks/useDocumentWorkflow";

const CURRENT_STEP = 1;

export function DocumentFillPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goToStep } = useDocumentWorkflow();

  const loadDocument = useDocumentStore((s) => s.loadDocument);
  const document = useDocumentStore((s) => s.document);
  const save = useDocumentStore((s) => s.save);
  const isDirty = useDocumentStore((s) => s.isDirty);
  const fillMode = useDocumentStore((s) => s.fillMode);
  const getCompletionPercent = useDocumentStore((s) => s.getCompletionPercent);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (document?.id === id) {
      setLoading(false);
      return;
    }
    api.documents
      .get(id)
      .then((doc) => {
        loadDocument(doc);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [id, document?.id, loadDocument]);

  const steps = buildDocumentWorkflowSteps(CURRENT_STEP);
  const completion = document ? getCompletionPercent() : 0;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-red-500">{error ?? "Document introuvable"}</p>
        <button onClick={() => navigate("/documents")} className="text-sm text-blue-600 hover:underline">
          ← Retour aux documents
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try { await save(); } finally { setSaving(false); }
  };

  const footerActions = (
    <>
      <span className="text-xs text-gray-400 mr-2">{completion}% rempli</span>
      <button
        onClick={handleSave}
        disabled={!isDirty || saving}
        className="px-3 py-1.5 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </>
  );

  return (
    <WorkflowLayout
      title={document.name}
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={true}
      footerActions={footerActions}
      onPrevious={() => navigate("/documents/new")}
      onNext={async () => {
        if (isDirty) await handleSave();
        navigate(`/documents/${id}/preview`);
      }}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key) goToStep(key, id);
      }}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Mode toggle */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-2 bg-white border-b border-gray-200">
          <FillModeToggle />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {fillMode === "form" ? <FormFillMode /> : <InlineFillMode />}
        </div>
      </div>
    </WorkflowLayout>
  );
}
