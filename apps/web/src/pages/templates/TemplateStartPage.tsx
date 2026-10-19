import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Copy, Upload, Sparkles, LayoutTemplate } from "lucide-react";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { newTemplateDraft } from "@/store/editor-store";
import { TEMPLATE_WORKFLOW } from "@/workflow/definitions";
import type { TemplateSummary } from "@/api/client";

type Mode = "blank" | "model" | "import" | "ai";

export function TemplateStartPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: queryKeys.templates.list(),
    queryFn: () => api.templates.list(),
    enabled: mode === "model",
  });

  const handleModeSelect = (m: Mode) => {
    setMode(m);
    setSelectedTemplateId(null);
  };

  // Le template est créé ici ; on remplace l'URL pour que « retour » ne relance pas une création
  const handleNext = async () => {
    setError(null);
    try {
      const created =
        mode === "model" && selectedTemplateId
          ? await api.templates.duplicate(selectedTemplateId)
          : await api.templates.create(newTemplateDraft());
      navigate(TEMPLATE_WORKFLOW.steps[1]!.path(created.id), { replace: true });
    } catch (e) {
      console.error("Erreur création template:", e);
      setError("La création du template a échoué. Réessayez.");
    }
  };

  const guard =
    mode === null
      ? { ok: false, reason: "Choisissez un point de départ" }
      : mode === "model" && !selectedTemplateId
      ? { ok: false, reason: "Sélectionnez le template à dupliquer" }
      : { ok: true };

  return (
    <WorkflowLayout
      workflow={TEMPLATE_WORKFLOW}
      current="start"
      title="Nouveau template"
      guard={guard}
      onNext={handleNext}
      nextLabel="Créer le template"
    >
      <div className="h-full overflow-y-auto bg-gray-50 p-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Choisissez un point de départ</h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-4 gap-3 max-w-4xl mb-8">
          <ModeCard
            icon={<FileText size={22} />}
            label="Vierge"
            description="Commencer avec une page blanche"
            active={mode === "blank"}
            onClick={() => handleModeSelect("blank")}
          />
          <ModeCard
            icon={<Copy size={22} />}
            label="Depuis un modèle"
            description="Dupliquer un template existant"
            active={mode === "model"}
            onClick={() => handleModeSelect("model")}
          />
          <ModeCard
            icon={<Upload size={22} />}
            label="Importer"
            description="Importer un fichier DOCX"
            active={mode === "import"}
            disabled
            badge="Bientôt"
            onClick={() => {}}
          />
          <ModeCard
            icon={<Sparkles size={22} />}
            label="Générer avec l'IA"
            description="Créer un template via l'IA"
            active={mode === "ai"}
            disabled
            badge="Bientôt"
            onClick={() => {}}
          />
        </div>

        {mode === "model" && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sélectionnez un template</h3>
            {templates.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun template disponible.</p>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-w-4xl">
                {templates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    selected={selectedTemplateId === t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </WorkflowLayout>
  );
}

function ModeCard({
  icon, label, description, active, disabled, badge, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  active: boolean;
  disabled?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative text-left p-4 rounded-lg border-2 transition-all ${
        active
          ? "border-blue-500 bg-blue-50"
          : disabled
          ? "border-gray-200 bg-white opacity-50 cursor-not-allowed"
          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer"
      }`}
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
      <div className={`mb-2 ${active ? "text-blue-600" : "text-gray-500"}`}>{icon}</div>
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </button>
  );
}

function TemplateCard({
  template, selected, onClick,
}: {
  template: TemplateSummary;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg border-2 transition-all overflow-hidden ${
        selected ? "border-blue-500" : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <div className={`w-full aspect-[210/297] flex items-center justify-center ${selected ? "bg-blue-50" : "bg-gray-50"}`}>
        <LayoutTemplate size={28} className={selected ? "text-blue-200" : "text-gray-200"} />
      </div>
      <div className="p-2.5 bg-white">
        <p className="text-xs font-semibold text-gray-900 truncate">{template.name}</p>
        <p className="text-[10px] text-gray-400 mt-1">
          {new Date(template.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
      </div>
    </button>
  );
}
