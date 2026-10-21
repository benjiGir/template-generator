import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { get } from "@template-generator/component-registry/registry";
import { findNode } from "@template-generator/shared/utils/tree";
import type { ComponentNode } from "@template-generator/shared/types/template";
import type { PropSchema, PropValue } from "@template-generator/shared/types/component";
import { PropField } from "./PropField";
import { TemplateSettings } from "./TemplateSettings";
import { PageSettings } from "./PageSettings";
import { SavePresetDialog } from "./SavePresetDialog";
import { ThemePanel } from "./ThemePanel";
import { useSavePreset } from "@/api/hooks/presets";
import { Button } from "@/components/ui/Button";

/** Types de props qui portent du contenu ; le reste règle l'apparence */
const CONTENT_TYPES = new Set(["text", "textarea", "richtext", "list", "emoji", "image", "icon"]);

function isContentProp(p: PropSchema): boolean {
  if (p.group === "Contenu") return true;
  if (p.group === "Style") return false;
  return CONTENT_TYPES.has(p.type);
}

/** Réglages de style regroupés et repliables : on n'ouvre que ce dont on a besoin */
function StyleSections({
  schema,
  node,
  onUpdate,
}: {
  schema: readonly PropSchema[];
  node: ComponentNode;
  onUpdate: (key: string, value: PropValue) => void;
}) {
  const groups = new Map<string, PropSchema[]>();
  for (const p of schema) {
    const g = p.group && p.group !== "Style" ? p.group : "Apparence";
    const group = groups.get(g);
    if (group) group.push(p);
    else groups.set(g, [p]);
  }
  const [open, setOpen] = useState<Record<string, boolean>>({ Apparence: true });

  return (
    <div className="space-y-2">
      {Array.from(groups.entries()).map(([group, fields]) => {
        const isOpen = open[group] ?? false;
        return (
          <section key={group} className="rounded border border-wash">
            <button
              type="button"
              onClick={() => setOpen((o) => ({ ...o, [group]: !isOpen }))}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between bg-paper px-3 py-2 text-xs font-semibold text-ink-muted hover:bg-wash"
            >
              <span className="flex items-center gap-1.5">
                {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                {group}
              </span>
              <span className="font-normal text-ink-faint">{fields.length}</span>
            </button>
            {isOpen && (
              <div className="space-y-3 p-3">
                {fields.map((s) => (
                  <PropField key={s.key} schema={s} value={node.props[s.key]} onChange={(v) => onUpdate(s.key, v)} />
                ))}
              </div>
            )}
          </section>
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
  const createPresetMutation = useSavePreset();

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

  const handleSavePreset = (label: string) => {
    if (!selectedNode) return;
    createPresetMutation.mutate(
      { baseType: selectedNode.type, label, defaultProps: selectedNode.props },
      { onSuccess: () => setShowPresetDialog(false) },
    );
  };

  const showNoSelection = selectedNodeId === null && template;

  const [propTab, setPropTab] = useState<"content" | "style">("content");
  const inlineEditingNodeId = useEditorStore((s) => s.inlineEditingNodeId);
  const inlineEditingPropKey = useEditorStore((s) => s.inlineEditingPropKey);

  // Réglages du composant : contenu d'un côté, style de l'autre ; conditions d'affichage appliquées
  const renderSchema = (schema: readonly PropSchema[], node: ComponentNode) => {
    const visible = schema.filter((s) => !s.condition || node.props[s.condition.prop] === s.condition.value);
    const content = visible.filter(isContentProp);
    const style = visible.filter((p) => !isContentProp(p));
    const tab = content.length === 0 ? "style" : style.length === 0 ? "content" : propTab;
    const onUpdate = (key: string, val: PropValue) => updateNodeProps(node.id, { [key]: val });

    return (
      <>
        {content.length > 0 && style.length > 0 && (
          <div className="mb-4 flex gap-1 rounded-lg bg-wash p-0.5" role="tablist">
            {(
              [
                ["content", "Contenu", content.length],
                ["style", "Style", style.length],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setPropTab(key)}
                className={`flex-1 rounded-md py-1 text-xs font-medium ${tab === key ? "bg-white text-ink shadow-sm" : "text-ink-subtle hover:text-ink"}`}
              >
                {label} <span className="text-ink-faint">{count}</span>
              </button>
            ))}
          </div>
        )}
        {tab === "content" ? (
          <div className="space-y-3">
            <p className="rounded bg-tpl-tint px-2 py-1.5 text-[11px] text-tpl-strong">
              Astuce : double-cliquez sur le texte dans le document pour l'éditer sur place.
            </p>
            {content.map((s) => {
              const editingInline = inlineEditingNodeId === node.id && inlineEditingPropKey === s.key;
              return (
                <div
                  key={s.key}
                  className={editingInline ? "-mx-2 rounded-md bg-warn-tint px-2 py-1 ring-1 ring-warn-rule" : ""}
                >
                  {editingInline && (
                    <p className="mb-1 text-[10px] font-medium text-warn-strong">En cours d'édition dans le document</p>
                  )}
                  <PropField schema={s} value={node.props[s.key]} onChange={(v) => onUpdate(s.key, v)} />
                </div>
              );
            })}
          </div>
        ) : (
          <StyleSections schema={style} node={node} onUpdate={onUpdate} />
        )}
      </>
    );
  };

  return (
    <>
      <div className="h-full flex flex-col border-l border-rule bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-rule shrink-0">
          <h2 className="text-xs font-semibold text-ink-subtle uppercase tracking-wider">Inspecteur</h2>
          {selectedNode && definition && <p className="text-sm font-semibold text-ink mt-0.5">{definition.label}</p>}
          {!selectedNode && <p className="text-xs text-ink-faint mt-0.5">{template?.name ?? "Aucun template"}</p>}

          {/* Tabs — affichés quand aucun composant n'est sélectionné */}
          {showNoSelection && (
            <div className="flex gap-1 mt-2.5">
              <button
                onClick={() => setActiveTab("props")}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  activeTab === "props" ? "bg-ink text-white" : "text-ink-subtle hover:text-ink-soft border border-rule"
                }`}
              >
                Page
              </button>
              <button
                onClick={() => setActiveTab("theme")}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  activeTab === "theme" ? "bg-ink text-white" : "text-ink-subtle hover:text-ink-soft border border-rule"
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
                <p className="text-xs text-ink-faint text-center">Ce composant n'a pas de propriétés éditables.</p>
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
                <TemplateSettings onOpenTheme={() => setActiveTab("theme")} />
              </>
            )
          ) : null}

          {!selectedNode && !template && (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-xs text-ink-faint text-center">Cliquez sur un composant pour l'éditer</p>
            </div>
          )}
        </div>

        {/* Footer — actions sur le nœud sélectionné */}
        {selectedNode && (
          <div className="shrink-0 border-t border-wash p-3 space-y-2">
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleDuplicate}>
                Dupliquer
              </Button>
              <Button tone="danger" size="sm" className="flex-1" onClick={handleDelete}>
                Supprimer
              </Button>
            </div>
            <Button variant="dashed" tone="preset" size="sm" block onClick={() => setShowPresetDialog(true)}>
              Sauvegarder comme preset
            </Button>
          </div>
        )}
      </div>

      {showPresetDialog && <SavePresetDialog onSave={handleSavePreset} onCancel={() => setShowPresetDialog(false)} />}
    </>
  );
}
