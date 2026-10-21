import { useState } from "react";
import { useParams } from "react-router-dom";
import { get } from "@template-generator/component-registry/registry";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { PropField } from "@/components/inspector/PropField";
import { PresetPreviewPane } from "./PresetPreviewPane";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { PRESET_WORKFLOW, PRESET_PATHS } from "@/workflow/definitions";
import { NotFoundState } from "@/workflow/EntityState";
import type { PropSchema, PropValue, PropValues } from "@template-generator/shared/types/component";

export function ComponentEditPage() {
  const { presetId } = useParams<{ presetId: string }>();
  const baseType = useComponentDraftStore((s) => s.baseType);
  const props = useComponentDraftStore((s) => s.props);
  const updateProp = useComponentDraftStore((s) => s.updateProp);
  const resetProps = useComponentDraftStore((s) => s.resetProps);
  const editingLabel = useComponentDraftStore((s) => s.label);

  if (!baseType) {
    return (
      <NotFoundState
        message="Aucun composant choisi."
        backTo={PRESET_PATHS.select()}
        backLabel="Choisir un composant"
      />
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

  // Group and filter props by condition
  const visibleSchema = def.schema.filter((s) => {
    if (!s.condition) return true;
    return props[s.condition.prop] === s.condition.value;
  });

  const groupMap = new Map<string, PropSchema[]>();
  for (const s of visibleSchema) {
    const g = s.group ?? "Général";
    const group = groupMap.get(g);
    if (group) group.push(s);
    else groupMap.set(g, [s]);
  }

  const handleReset = () => {
    resetProps(def.defaultProps);
  };

  return (
    <WorkflowLayout
      workflow={PRESET_WORKFLOW}
      current="configure"
      entityId={presetId}
      firstNavigableStep={presetId === "new" ? 0 : 1}
      title={presetId === "new" ? `Nouveau preset — ${def.label}` : editingLabel}
    >
      <div className="h-full flex overflow-hidden">
        {/* Left: prop panel */}
        <div className="w-[350px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{def.label}</p>
              <p className="text-xs text-gray-400">{def.description}</p>
            </div>
            <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 underline">
              Réinitialiser
            </button>
          </div>

          <div className="p-4">
            {def.schema.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Ce composant n'a pas de propriétés éditables.</p>
            ) : groupMap.size === 1 && groupMap.has("Général") ? (
              <div className="space-y-4">
                {(groupMap.get("Général") ?? []).map((s) => (
                  <PropField key={s.key} schema={s} value={props[s.key]} onChange={(v) => updateProp(s.key, v)} />
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
        <div className="min-w-0 flex-1">
          <PresetPreviewPane type={baseType} props={props} />
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
  props: PropValues;
  onUpdate: (key: string, value: PropValue) => void;
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
                  <PropField key={s.key} schema={s} value={props[s.key]} onChange={(v) => onUpdate(s.key, v)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
