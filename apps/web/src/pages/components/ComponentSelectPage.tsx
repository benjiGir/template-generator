import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAll } from "@template-generator/component-registry/registry";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { buildComponentWorkflowSteps, useComponentWorkflow } from "./hooks/useComponentWorkflow";
import type { ComponentCategory } from "@template-generator/shared/types/component";

const CURRENT_STEP = 0;

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  layout:     "Mise en page",
  content:    "Contenu",
  data:       "Données",
  decoration: "Décoration",
};

const CATEGORY_ORDER: ComponentCategory[] = ["layout", "content", "data", "decoration"];

export function ComponentSelectPage() {
  const navigate = useNavigate();
  const { goToStep } = useComponentWorkflow();
  const setBaseType = useComponentDraftStore((s) => s.setBaseType);
  const currentBaseType = useComponentDraftStore((s) => s.baseType);

  const [selected, setSelected] = useState<string | null>(currentBaseType);
  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | "all">("all");

  const steps = buildComponentWorkflowSteps(CURRENT_STEP);
  const allComponents = getAll();

  const filtered = categoryFilter === "all"
    ? allComponents
    : allComponents.filter((c) => c.category === categoryFilter);

  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof allComponents>>((acc, cat) => {
    const items = filtered.filter((c) => c.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const handleNext = () => {
    if (!selected) return;
    const def = allComponents.find((c) => c.type === selected);
    if (!def) return;
    setBaseType(selected, def.defaultProps);
    navigate("/components/new/edit");
  };

  return (
    <WorkflowLayout
      title="Bibliothèque Composants"
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={selected !== null}
      onPrevious={() => navigate("/components")}
      onNext={handleNext}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key) goToStep(key);
      }}
    >
      <div className="h-full flex flex-col overflow-hidden bg-gray-50">
        {/* Category filter */}
        <div className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200">
          <span className="text-xs font-medium text-gray-500 mr-1">Filtrer :</span>
          {(["all", ...CATEGORY_ORDER] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat === "all" ? "Tous" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Components grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(grouped).map(([cat, components]) => (
            <div key={cat} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[cat as ComponentCategory]}
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {components.map((def) => (
                  <button
                    key={def.type}
                    onClick={() => setSelected(def.type)}
                    className={`text-left p-3 rounded-lg border-2 transition-all bg-white ${
                      selected === def.type
                        ? "border-blue-500 shadow-sm"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-xl mb-1">{def.icon}</div>
                    <p className="text-xs font-semibold text-gray-900">{def.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{def.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkflowLayout>
  );
}
