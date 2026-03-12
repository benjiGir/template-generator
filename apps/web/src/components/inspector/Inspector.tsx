import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { usePresetsStore } from "@/store/presets-store";
import { get } from "@template-generator/component-registry/registry";
import { findNode } from "@template-generator/shared/utils/tree";
import type { ComponentNode } from "@template-generator/shared/types/template";
import { PropField } from "./PropField";
import { TemplateSettings } from "./TemplateSettings";
import { PageSettings } from "./PageSettings";
import { SavePresetDialog } from "./SavePresetDialog";
import { ThemePanel } from "./ThemePanel";

export function Inspector() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedPageIndex = useEditorStore((s) => s.selectedPageIndex);
  const template = useEditorStore((s) => s.template);
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps);
  const removeNode = useEditorStore((s) => s.removeNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const selectNode = useEditorStore((s) => s.selectNode);
  const createPreset = usePresetsStore((s) => s.createPreset);

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
    await createPreset({
      baseType: selectedNode.type,
      label,
      defaultProps: selectedNode.props,
    });
    setShowPresetDialog(false);
  };

  const showNoSelection = selectedNodeId === null && template;

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
            <div className="p-4 space-y-4">
              {definition.schema.length === 0 ? (
                <p className="text-xs text-gray-400 text-center">
                  Ce composant n'a pas de propriétés éditables.
                </p>
              ) : (
                definition.schema.map((propSchema) => (
                  <PropField
                    key={propSchema.key}
                    schema={propSchema}
                    value={selectedNode!.props[propSchema.key]}
                    onChange={(value) =>
                      updateNodeProps(selectedNode!.id, { [propSchema.key]: value })
                    }
                  />
                ))
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
