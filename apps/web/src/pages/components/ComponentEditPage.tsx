import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "@template-generator/component-registry/registry";
import { ComponentRenderer } from "@template-generator/component-registry/renderer";
import { DEFAULT_THEME } from "@template-generator/shared/types/template";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { PropField } from "@/components/inspector/PropField";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { buildComponentWorkflowSteps, useComponentWorkflow } from "./hooks/useComponentWorkflow";
import type { PropSchema } from "@template-generator/shared/types/component";

const CURRENT_STEP = 1;

export function ComponentEditPage() {
  const navigate = useNavigate();
  const { goToStep } = useComponentWorkflow();
  const baseType = useComponentDraftStore((s) => s.baseType);
  const props = useComponentDraftStore((s) => s.props);
  const updateProp = useComponentDraftStore((s) => s.updateProp);
  const setBaseType = useComponentDraftStore((s) => s.setBaseType);

  const steps = buildComponentWorkflowSteps(CURRENT_STEP);

  if (!baseType) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-gray-500">Aucun composant sélectionné.</p>
        <button onClick={() => navigate("/components/new")} className="text-sm text-blue-600 hover:underline">
          ← Choisir un composant
        </button>
      </div>
    );
  }

  const def = get(baseType);
  if (!def) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-sm text-red-500">Composant introuvable : {baseType}</p>
      </div>
    );
  }

  // Build the preview node
  const previewNode = {
    id:       "preview",
    type:     baseType,
    props:    props,
    children: [],
  };

  // Group and filter props by condition
  const visibleSchema = def.schema.filter((s) => {
    if (!s.condition) return true;
    return props[s.condition.prop] === s.condition.value;
  });

  const groupMap = new Map<string, PropSchema[]>();
  for (const s of visibleSchema) {
    const g = s.group ?? "Général";
    if (!groupMap.has(g)) groupMap.set(g, []);
    groupMap.get(g)!.push(s);
  }

  const handleReset = () => {
    setBaseType(baseType, def.defaultProps);
  };

  return (
    <WorkflowLayout
      title="Bibliothèque Composants"
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={true}
      onPrevious={() => navigate("/components/new")}
      onNext={() => navigate("/components/new/save")}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key) goToStep(key);
      }}
    >
      <div className="h-full flex overflow-hidden">
        {/* Left: prop panel */}
        <div className="w-[350px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{def.label}</p>
              <p className="text-xs text-gray-400">{def.description}</p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Réinitialiser
            </button>
          </div>

          <div className="p-4">
            {def.schema.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                Ce composant n'a pas de propriétés éditables.
              </p>
            ) : groupMap.size === 1 && groupMap.has("Général") ? (
              <div className="space-y-4">
                {(groupMap.get("Général") ?? []).map((s) => (
                  <PropField
                    key={s.key}
                    schema={s}
                    value={props[s.key]}
                    onChange={(v) => updateProp(s.key, v)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <GroupedProps groupMap={groupMap} props={props} onUpdate={updateProp} />
              </div>
            )}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 flex items-start justify-center p-8">
          <div className="w-full max-w-2xl">
            <p className="text-xs text-gray-400 text-center mb-4">Aperçu</p>
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

function GroupedProps({
  groupMap,
  props,
  onUpdate,
}: {
  groupMap: Map<string, PropSchema[]>;
  props: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (g: string) => setCollapsed((c) => ({ ...c, [g]: !c[g] }));

  return (
    <>
      {Array.from(groupMap.entries()).map(([group, fields]) => {
        const isOpen = collapsed[group] !== true;
        return (
          <div key={group} className="border border-gray-100 rounded overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(group)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span>{group}</span>
              <span className="text-gray-400 text-[10px]">{isOpen ? "▾" : "▸"}</span>
            </button>
            {isOpen && (
              <div className="p-3 space-y-3 bg-white">
                {fields.map((s) => (
                  <PropField
                    key={s.key}
                    schema={s}
                    value={props[s.key]}
                    onChange={(v) => onUpdate(s.key, v)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
