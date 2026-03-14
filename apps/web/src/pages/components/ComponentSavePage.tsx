import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "@template-generator/component-registry/registry";
import { ComponentRenderer } from "@template-generator/component-registry/renderer";
import { DEFAULT_THEME } from "@template-generator/shared/types/template";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { usePresetsStore } from "@/store/presets-store";
import { buildComponentWorkflowSteps, useComponentWorkflow } from "./hooks/useComponentWorkflow";
import type { ComponentCategory } from "@template-generator/shared/types/component";

const CURRENT_STEP = 2;

const CATEGORY_OPTIONS: { value: ComponentCategory; label: string }[] = [
  { value: "layout",     label: "Mise en page" },
  { value: "content",    label: "Contenu" },
  { value: "data",       label: "Données" },
  { value: "decoration", label: "Décoration" },
];

export function ComponentSavePage() {
  const navigate = useNavigate();
  const { goToStep } = useComponentWorkflow();
  const baseType = useComponentDraftStore((s) => s.baseType);
  const props = useComponentDraftStore((s) => s.props);
  const reset = useComponentDraftStore((s) => s.reset);
  const createPreset = usePresetsStore((s) => s.createPreset);

  const def = baseType ? get(baseType) : null;
  const [label, setLabel] = useState(def ? `${def.label} preset` : "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComponentCategory>(def?.category ?? "content");
  const [saving, setSaving] = useState(false);

  const steps = buildComponentWorkflowSteps(CURRENT_STEP);

  if (!baseType || !def) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-gray-500">Aucun composant en cours de création.</p>
        <button onClick={() => navigate("/components/new")} className="text-sm text-blue-600 hover:underline">
          ← Recommencer
        </button>
      </div>
    );
  }

  const previewNode = { id: "preview", type: baseType, props, children: [] };

  const handleSave = async () => {
    if (!label.trim()) return;
    setSaving(true);
    try {
      await createPreset({
        baseType,
        label: label.trim(),
        description: description.trim() || undefined,
        defaultProps: props,
        category,
      });
      reset();
      navigate("/components");
    } catch (e) {
      console.error("Erreur sauvegarde preset:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <WorkflowLayout
      title="Bibliothèque Composants"
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={label.trim().length > 0 && !saving}
      nextLabel="Sauvegarder"
      onPrevious={() => navigate("/components/new/edit")}
      onNext={handleSave}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key) goToStep(key);
      }}
    >
      <div className="h-full flex overflow-hidden bg-gray-50">
        {/* Left: form */}
        <div className="w-[400px] shrink-0 overflow-y-auto bg-white border-r border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Nommer et sauvegarder</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nom du preset <span className="text-red-400">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: KPI Card Verte"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Description optionnelle…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComponentCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Composant de base : <span className="font-medium text-gray-600">{def.label}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 flex items-start justify-center p-8">
          <div className="w-full max-w-2xl">
            <p className="text-xs text-gray-400 text-center mb-4">Aperçu final</p>
            <div
              className="bg-white shadow-md rounded-lg p-6 overflow-hidden"
              style={{
                fontFamily: DEFAULT_THEME.typography.fontFamily,
                fontSize:   DEFAULT_THEME.typography.baseFontSize,
                color:      DEFAULT_THEME.colors.text,
              }}
            >
              <ComponentRenderer node={previewNode} theme={DEFAULT_THEME} />
            </div>
          </div>
        </div>
      </div>
    </WorkflowLayout>
  );
}
