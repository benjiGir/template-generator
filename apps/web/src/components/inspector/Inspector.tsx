import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditorStore } from "@/store/editor-store";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@template-generator/component-registry/registry";
import { findNode } from "@template-generator/shared/utils/tree";
import type { ComponentNode } from "@template-generator/shared/types/template";
import type { PropSchema } from "@template-generator/shared/types/component";
import { PropField } from "./PropField";
import { TemplateSettings } from "./TemplateSettings";
import { PageSettings } from "./PageSettings";
import { SavePresetDialog } from "./SavePresetDialog";
import { ThemePanel } from "./ThemePanel";

interface GroupedFieldsProps {
  groupMap: Map<string, PropSchema[]>;
  node: ComponentNode;
  onUpdate: (key: string, value: unknown) => void;
}

function GroupedFields({ groupMap, node, onUpdate }: GroupedFieldsProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (g: string) => setCollapsed((c) => ({ ...c, [g]: !c[g] }));

  if (groupMap.size === 1 && groupMap.has("Général")) {
    // No grouping needed — render flat
    const fields = groupMap.get("Général")!;
    return (
      <div className="space-y-4">
        {fields.map((s) => (
          <PropField
            key={s.key}
            schema={s}
            value={node.props[s.key]}
            onChange={(v) => onUpdate(s.key, v)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
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
                    value={node.props[s.key]}
                    onChange={(v) => onUpdate(s.key, v)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Inspector() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedPageIndex = useEditorStore((s) => s.selectedPageIndex);
  const template = useEditorStore((s) => s.template);
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps);
  const removeNode = useEditorStore((s) => s.removeNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const selectNode = useEditorStore((s) => s.selectNode);
  const queryClient = useQueryClient();
  const createPresetMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.presets.create>[0]) => api.presets.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.presets.list() }),
  });

  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"props" | "theme">("props");

  // Recherche récursive du nœud sélectionné et de sa page
  let selectedNode: ComponentNode | null = null;
  let nodePageIndex = selectedPageIndex;

  if (selectedNodeId && template) {
    for (let i = 0; i < template.pages.length; i++) {
      const page = template.pages[i];
      if (!page) continue;
      const found = findNode(page.children, selectedNodeId);
      if (found) {
        selectedNode = found;
        nodePageIndex = i;
        break;
      }
    }
  }

  const definition = selectedNode ? get(selectedNode.type) : null;

  const handleDelete = () => {
    if (!selectedNodeId) return;
    removeNode(nodePageIndex, selectedNodeId);
    selectNode(null);
  };

  const handleDuplicate = () => {
    if (!selectedNodeId) return;
    duplicateNode(nodePageIndex, selectedNodeId);
  };

  const handleSavePreset = async (label: string) => {
    if (!selectedNode) return;
    await createPresetMutation.mutateAsync({
      baseType: selectedNode.type,
      label,
      defaultProps: selectedNode.props,
    });
    setShowPresetDialog(false);
  };

  const showNoSelection = selectedNodeId === null && template;

  // Groups + conditions rendering
  const renderSchema = (schema: PropSchema[], node: ComponentNode) => {
    const props = node.props;

    // Filter by condition
    const visible = schema.filter((s) => {
      if (!s.condition) return true;
      return props[s.condition.prop] === s.condition.value;
    });

    // Group by group name
    const groupMap = new Map<string, PropSchema[]>();
    for (const s of visible) {
      const g = s.group ?? "Général";
      if (!groupMap.has(g)) groupMap.set(g, []);
      groupMap.get(g)!.push(s);
    }

    return <GroupedFields groupMap={groupMap} node={node} onUpdate={(key, val) => updateNodeProps(node.id, { [key]: val })} />;
  };

  return (
    <>
      <div className="h-full flex flex-col border-l border-gray-200 bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 shrink-0">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Inspecteur
          </h2>
          {selectedNode && definition && (
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{definition.label}</p>
          )}
          {!selectedNode && (
            <p className="text-xs text-gray-400 mt-0.5">
              {template?.name ?? "Aucun template"}
            </p>
          )}

          {/* Tabs — affichés quand aucun composant n'est sélectionné */}
          {showNoSelection && (
            <div className="flex gap-1 mt-2.5">
              <button
                onClick={() => setActiveTab("props")}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  activeTab === "props"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700 border border-gray-200"
                }`}
              >
                Propriétés
              </button>
              <button
                onClick={() => setActiveTab("theme")}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  activeTab === "theme"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700 border border-gray-200"
                }`}
              >
                Thème
              </button>
            </div>
          )}
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          {selectedNode && definition ? (
            <div className="p-4">
              {definition.schema.length === 0 ? (
                <p className="text-xs text-gray-400 text-center">
                  Ce composant n'a pas de propriétés éditables.
                </p>
              ) : (
                renderSchema(definition.schema, selectedNode)
              )}
            </div>
          ) : showNoSelection ? (
            activeTab === "theme" ? (
              <ThemePanel />
            ) : (
              <>
                <PageSettings />
                <TemplateSettings />
              </>
            )
          ) : null}

          {!selectedNode && !template && (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-xs text-gray-400 text-center">
                Cliquez sur un composant pour l'éditer
              </p>
            </div>
          )}
        </div>

        {/* Footer — actions sur le nœud sélectionné */}
        {selectedNode && (
          <div className="shrink-0 border-t border-gray-100 p-3 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleDuplicate}
                className="flex-1 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                Dupliquer
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <button
              onClick={() => setShowPresetDialog(true)}
              className="w-full py-1.5 text-xs font-medium text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50 transition-colors"
            >
              Sauvegarder comme preset
            </button>
          </div>
        )}
      </div>

      {showPresetDialog && (
        <SavePresetDialog
          onSave={handleSavePreset}
          onCancel={() => setShowPresetDialog(false)}
        />
      )}
    </>
  );
}
