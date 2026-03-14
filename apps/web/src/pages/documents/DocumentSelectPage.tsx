import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { buildDocumentWorkflowSteps } from "./hooks/useDocumentWorkflow";
import type { TemplateSummary } from "@/api/client";

const CURRENT_STEP = 0;

export function DocumentSelectPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TemplateSummary | null>(null);
  const [creating, setCreating] = useState(false);

  const steps = buildDocumentWorkflowSteps(CURRENT_STEP);

  useEffect(() => {
    api.templates.list({ published: true }).then((list) => {
      setTemplates(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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

        {loading && <p className="text-sm text-gray-400">Chargement...</p>}

        {!loading && templates.length === 0 && (
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
                className={`text-left p-4 rounded-lg border-2 transition-all bg-white ${
                  selected?.id === t.id
                    ? "border-blue-500 shadow-sm"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <h3 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h3>
                {t.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  {fieldCount} champ{fieldCount !== 1 ? "s" : ""} à remplir
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </WorkflowLayout>
  );
}
