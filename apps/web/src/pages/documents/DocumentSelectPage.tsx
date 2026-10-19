import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { DOCUMENT_WORKFLOW } from "@/workflow/definitions";
import type { TemplateSummary } from "@/api/client";

export function DocumentSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<TemplateSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: queryKeys.templates.list({ published: true }),
    queryFn: () => api.templates.list({ published: true }),
  });

  // Le serveur crée le document à partir de la version publiée ; on remplace l'URL pour ne pas recréer au retour
  const handleNext = async () => {
    if (!selected) return;
    setError(null);
    try {
      const doc = await api.documents.create({ templateId: selected.id });
      navigate(DOCUMENT_WORKFLOW.steps[1]!.path(doc.id), { replace: true });
    } catch (e) {
      console.error("Erreur création document:", e);
      setError("La création du document a échoué. Réessayez.");
    }
  };

  return (
    <WorkflowLayout
      workflow={DOCUMENT_WORKFLOW}
      current="select"
      title="Nouveau document"
      guard={selected ? { ok: true } : { ok: false, reason: "Choisissez un template" }}
      onNext={handleNext}
      nextLabel="Commencer le remplissage"
    >
      <div className="h-full overflow-y-auto bg-gray-50 p-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Choisissez un template</h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {isLoading && <p className="text-sm text-gray-400">Chargement...</p>}

        {!isLoading && templates.length === 0 && (
          <div className="mx-auto max-w-md py-16 text-center">
            <p className="text-sm font-medium text-gray-700">Aucun template n'est encore publié</p>
            <p className="mt-1 text-sm text-gray-500">
              Un document part toujours d'un template publié. Le concepteur des templates doit en publier un
              depuis l'Atelier pour qu'il apparaisse ici.
            </p>
            <button onClick={() => navigate("/templates")} className="mt-3 text-sm text-blue-600 hover:underline">
              Ouvrir l'Atelier
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
