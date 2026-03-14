import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Copy, Upload, Sparkles } from "lucide-react";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { api } from "@/api/client";
import { useTemplatesStore } from "@/store/templates-store";
import { DEFAULT_NEW_TEMPLATE } from "@/store/editor-store";
import { buildWorkflowSteps, useTemplateWorkflow } from "./hooks/useTemplateWorkflow";
import type { TemplateSummary } from "@/api/client";

const CURRENT_STEP = 0;

type Mode = "blank" | "model" | "import" | "ai";

export function TemplateStartPage() {
  const navigate = useNavigate();
  const { goToStep } = useTemplateWorkflow();
  const { templates, fetchTemplates } = useTemplatesStore();
  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const steps = buildWorkflowSteps(CURRENT_STEP);

  const handleModeSelect = (m: Mode) => {
    setMode(m);
    setSelectedTemplateId(null);
    if (m === "model") fetchTemplates();
  };

  const handleNext = async () => {
    if (!mode) return;
    setLoading(true);
    try {
      if (mode === "blank") {
        const created = await api.templates.create({
          ...DEFAULT_NEW_TEMPLATE,
          published: false,
          editableFields: [],
          tags: [],
        });
        navigate(`/templates/${created.id}/theme`);
      } else if (mode === "model" && selectedTemplateId) {
        const source = await api.templates.get(selectedTemplateId);
        const created = await api.templates.create({
          name:           `${source.name} (copie)`,
          description:    source.description,
          theme:          source.theme,
          pageFormat:     source.pageFormat,
          pages:          source.pages,
          published:      false,
          editableFields: [],
          tags:           [],
        });
        navigate(`/templates/${created.id}/theme`);
      }
    } catch (e) {
      console.error("Erreur création template:", e);
    } finally {
      setLoading(false);
    }
  };

  const canGoNext =
    mode === "blank" ||
    (mode === "model" && selectedTemplateId !== null);

  return (
    <WorkflowLayout
      title="Atelier Templates"
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={canGoNext && !loading}
      onPrevious={() => navigate("/templates")}
      onNext={handleNext}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key && canGoNext) goToStep(key, "");
      }}
    >
      <div className="h-full overflow-y-auto bg-gray-50 p-8">
        {/* Mode selection */}
        <h2 className="text-base font-semibold text-gray-900 mb-4">Choisissez un point de départ</h2>
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

        {/* Template grid for "from model" */}
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
  icon,
  label,
  description,
  active,
  disabled,
  badge,
  onClick,
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
  template,
  selected,
  onClick,
}: {
  template: TemplateSummary;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-3 rounded-lg border-2 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <p className="text-sm font-semibold text-gray-900 truncate">{template.name}</p>
      {template.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
      )}
      <p className="text-xs text-gray-400 mt-2">
        {new Date(template.updatedAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        })}
      </p>
    </button>
  );
}
