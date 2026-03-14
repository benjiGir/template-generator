import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { get } from "@template-generator/component-registry/registry";
import { useDocumentStore } from "@/store/document-store";
import { FormField } from "./FormField";
import type { ComponentNode, Theme } from "@template-generator/shared/types/template";
import type { EditableField } from "@template-generator/shared/types/template";

// ── Helpers ─────────────────────────────────────────────────────────────────

function resolveThemeVars(props: Record<string, unknown>, theme: Theme): Record<string, unknown> {
  const resolved = { ...props };
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string" && value.startsWith("theme.")) {
      const path = value.slice(6) as keyof typeof theme.colors;
      resolved[key] = theme.colors[path] ?? value;
    }
  }
  return resolved;
}

function scrollToNode(nodeId: string) {
  document
    .querySelector(`[data-inline-node="${nodeId}"]`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ── Inline renderer ──────────────────────────────────────────────────────────

interface RendererProps {
  nodes: ComponentNode[];
  theme: Theme;
  editableMap: Map<string, EditableField[]>;
  data: Record<string, unknown>;
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
}

function InlineNodeRenderer({ nodes, theme, editableMap, data, selectedNodeId, onSelect }: RendererProps) {
  return (
    <>
      {nodes.map((node) => {
        const def = get(node.type);
        if (!def) return null;

        const nodeFields = editableMap.get(node.id) ?? [];
        const isEditable = nodeFields.length > 0;
        const isSelected = selectedNodeId === node.id;

        const mergedProps: Record<string, unknown> = {
          ...def.defaultProps,
          ...resolveThemeVars(node.props, theme),
          theme,
        };
        for (const field of nodeFields) {
          const key = `${field.nodeId}.${field.propKey}`;
          if (key in data) mergedProps[field.propKey] = data[key];
        }

        const Component = def.render;

        const rendered =
          def.acceptsChildren && node.children?.length ? (
            <Component {...mergedProps}>
              <InlineNodeRenderer
                nodes={node.children}
                theme={theme}
                editableMap={editableMap}
                data={data}
                selectedNodeId={selectedNodeId}
                onSelect={onSelect}
              />
            </Component>
          ) : (
            <Component {...mergedProps} />
          );

        if (!isEditable) return <div key={node.id}>{rendered}</div>;

        return (
          <div
            key={node.id}
            data-inline-node={node.id}
            onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
            style={{
              outline: isSelected
                ? "2px solid #3B82F6"
                : undefined,
              outlineOffset: 2,
              borderRadius: 4,
              cursor: "pointer",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.outline = "1px dashed #93C5FD";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.outline = "";
            }}
          >
            {rendered}
          </div>
        );
      })}
    </>
  );
}

// ── Completion panel ─────────────────────────────────────────────────────────

function CompletionPanel({
  editableFields,
  data,
  selectedNodeId,
  onSelectNode,
}: {
  editableFields: EditableField[];
  data: Record<string, unknown>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}) {
  const total = editableFields.length;
  const filled = editableFields.filter((f) => {
    const val = data[`${f.nodeId}.${f.propKey}`];
    return val !== undefined && val !== null && val !== "";
  }).length;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 100;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-gray-700">Progression</span>
          <span className="text-xs font-bold text-gray-900">{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Field list */}
      <div className="flex-1 overflow-y-auto">
        {editableFields.map((field) => {
          const key = `${field.nodeId}.${field.propKey}`;
          const val = data[key];
          const isFilled = val !== undefined && val !== null && val !== "";
          const isActive = selectedNodeId === field.nodeId;
          return (
            <button
              key={key}
              onClick={() => {
                onSelectNode(field.nodeId);
                scrollToNode(field.nodeId);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors border-b border-gray-50 ${
                isActive ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div
                className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                  isFilled ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                {isFilled && <Check size={9} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{field.label}</p>
                <p className="text-[10px] text-gray-400 truncate">
                  {field.type}
                  {field.required && " · requis"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function InlineFillMode() {
  const editableFields = useDocumentStore((s) => s.editableFields);
  const data = useDocumentStore((s) => s.data);
  const updateField = useDocumentStore((s) => s.updateField);
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const mergedTemplate = getMergedTemplate();

  // Build a map of nodeId → EditableField[]
  const editableMap = new Map<string, EditableField[]>();
  for (const field of editableFields) {
    if (!editableMap.has(field.nodeId)) editableMap.set(field.nodeId, []);
    editableMap.get(field.nodeId)!.push(field);
  }

  const selectedNodeFields = selectedNodeId ? (editableMap.get(selectedNodeId) ?? []) : [];

  const handleSelect = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  if (!mergedTemplate) return null;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Canvas */}
      <div
        className="flex-1 overflow-y-auto bg-gray-100 p-6"
        onClick={() => setSelectedNodeId(null)}
      >
        <p className="text-xs text-gray-400 text-center mb-3">
          Cliquez sur une zone en surbrillance pour l'éditer
        </p>
        {mergedTemplate.pages.map((page) => (
          <div
            key={page.id}
            data-doc-page
            className="mx-auto bg-white shadow-md mb-6 overflow-hidden"
            style={{
              width:           mergedTemplate.pageFormat.width,
              minHeight:       mergedTemplate.pageFormat.height,
              padding:         mergedTemplate.pageFormat.padding,
              fontFamily:      mergedTemplate.theme.typography.fontFamily,
              fontSize:        mergedTemplate.theme.typography.baseFontSize,
              color:           mergedTemplate.theme.colors.text,
              backgroundColor: mergedTemplate.theme.colors.background,
            }}
          >
            <InlineNodeRenderer
              nodes={page.children}
              theme={mergedTemplate.theme}
              editableMap={editableMap}
              data={data}
              selectedNodeId={selectedNodeId}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div className="w-[260px] shrink-0 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
        {selectedNodeId && selectedNodeFields.length > 0 ? (
          <>
            <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-gray-700">Éditer</span>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedNodeFields.map((field) => (
                <FormField
                  key={`${field.nodeId}.${field.propKey}`}
                  field={field}
                  value={data[`${field.nodeId}.${field.propKey}`]}
                  onChange={(v) => updateField(`${field.nodeId}.${field.propKey}`, v)}
                />
              ))}
            </div>
          </>
        ) : (
          <CompletionPanel
            editableFields={editableFields}
            data={data}
            selectedNodeId={selectedNodeId}
            onSelectNode={(nodeId) => {
              setSelectedNodeId(nodeId);
              scrollToNode(nodeId);
            }}
          />
        )}
      </div>
    </div>
  );
}
