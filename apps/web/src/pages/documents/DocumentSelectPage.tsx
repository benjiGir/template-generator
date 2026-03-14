import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { buildDocumentWorkflowSteps } from "./hooks/useDocumentWorkflow";
import type { TemplateSummary } from "@/api/client";

const CURRENT_STEP = 0;

export function DocumentSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<TemplateSummary | null>(null);
  const [creating, setCreating] = useState(false);

  const steps = buildDocumentWorkflowSteps(CURRENT_STEP);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: queryKeys.templates.list({ published: true }),
    queryFn: () => api.templates.list({ published: true }),
  });

  const handleNext = async () => {
    if (!selected || creating) return;
    setCreating(true);
    try {
      const fullTemplate = await api.templates.get(selected.id);
      const doc = await api.documents.create({
        templateId:       selected.id,
        name:             `${selected.name} — ${new Date().toLocaleDateString("fr-FR")}`,
        data:             {},
        templateSnapshot: fullTemplate,
      });
      navigate(`/documents/${doc.id}/fill`);
    } catch (e) {
      console.error("Erreur création document:", e);
      setCreating(false);
    }
  };

  return (
    <WorkflowLayout
      title="Studio de Publication"
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={selected !== null && !creating}
      onPrevious={() => navigate("/documents")}
      onNext={handleNext}
      onStepClick={() => {}}
    >
      <div className="h-full overflow-y-auto bg-gray-50 p-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Choisissez un template</h2>

        {isLoading && <p className="text-sm text-gray-400">Chargement...</p>}

        {!isLoading && templates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-3">Aucun template publié disponible.</p>
            <button
              onClick={() => navigate("/templates")}
              className="text-sm text-blue-600 hover:underline"
            >
              → Publier un template dans l'Atelier
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 max-w-4xl">
          {templates.map((t) => {
            const fieldCount = t.editableFields?.length ?? 0;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`text-left rounded-lg border-2 transition-all bg-white overflow-hidden ${
                  selected?.id === t.id
                    ? "border-blue-500 shadow-sm"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <div className={`w-full aspect-[210/297] flex items-center justify-center ${
                  selected?.id === t.id ? "bg-blue-50" : "bg-gray-50"
                }`}>
                  <LayoutTemplate size={36} className={selected?.id === t.id ? "text-blue-200" : "text-gray-200"} />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h3>
                  {t.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {fieldCount} champ{fieldCount !== 1 ? "s" : ""} à remplir
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </WorkflowLayout>
  );
}
