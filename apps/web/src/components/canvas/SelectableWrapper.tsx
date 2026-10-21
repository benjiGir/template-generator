import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { get } from "@template-generator/component-registry/registry";
import { useDropTarget, type CanvasDragData } from "@/hooks/useDragAndDrop";

/** Prop éditée au double-clic : le texte principal du composant */
export function primaryTextProp(nodeType: string): { key: string; type: string } | null {
  const definition = get(nodeType);
  // Un conteneur s'édite dans le panneau : son texte est entouré de composants enfants
  if (!definition || definition.acceptsChildren) return null;
  const rich = definition.schema.find((p) => p.type === "richtext" || p.type === "textarea");
  const text = definition.schema.find((p) => p.type === "text");
  const prop = rich ?? text;
  return prop ? { key: prop.key, type: prop.type } : null;
}

interface Props {
  nodeId: string;
  nodeType: string;
  pageIndex: number;
  children: ReactNode;
}

export function SelectableWrapper({ nodeId, nodeType, pageIndex, children }: Props) {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const startInlineEdit = useEditorStore((s) => s.startInlineEdit);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const removeNode = useEditorStore((s) => s.removeNode);
  const isSelected = selectedNodeId === nodeId;
  const isHovered = useEditorStore((s) => s.hoveredNodeId === nodeId);
  const hoverNode = useEditorStore((s) => s.hoverNode);
  const label = get(nodeType)?.label ?? nodeType;

  // Pendant un glisser-déposer, le conteneur qui recevra le composant est encadré et nommé
  const { drop, check } = useDropTarget();
  const isDropTarget = drop?.parentId === nodeId;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prop = primaryTextProp(nodeType);
    if (prop) startInlineEdit(nodeId, prop.key);
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `canvas-${nodeId}`,
    data: { source: "canvas", nodeId, pageIndex } satisfies CanvasDragData,
  });

  const outline = isDropTarget
    ? `2px dashed ${check.ok ? "#2448C8" : "#9E1B32"}`
    : isSelected
      ? "2px solid #2448C8"
      : "2px solid transparent";

  return (
    <div
      ref={setNodeRef}
      onMouseOver={(e) => {
        e.stopPropagation();
        if (!isHovered) hoverNode(nodeId);
      }}
      style={{
        position: "relative",
        opacity: isDragging ? 0.35 : 1,
        outline,
        outlineOffset: 1,
        borderRadius: 2,
        cursor: "default",
        transition: "outline-color 0.1s",
        backgroundColor: isDropTarget && check.ok ? "rgba(37,99,235,0.04)" : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectNode(nodeId);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Poignée de déplacement (survol) */}
      {!isSelected && isHovered && (
        <div
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            zIndex: 50,
            backgroundColor: "rgba(15,23,42,0.6)",
            color: "white",
            borderRadius: 4,
            width: 20,
            height: 20,
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "none",
          }}
          title={`Déplacer : ${label}`}
          aria-label={`Déplacer ${label}`}
        >
          <GripVertical size={12} />
        </div>
      )}

      {isDropTarget && (
        <div style={chipStyle(check.ok ? "#2448C8" : "#9E1B32")}>
          {check.ok ? `Déposer dans « ${label} »` : check.reason}
        </div>
      )}

      {/* Sélection : nom du composant et actions rapides (hors document, jamais imprimées) */}
      {isSelected && !isDropTarget && (
        <div
          style={{
            ...chipStyle("#2448C8"),
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: "0 2px 0 0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            {...listeners}
            {...attributes}
            title="Déplacer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 6px",
              cursor: "grab",
              touchAction: "none",
            }}
          >
            <GripVertical size={11} />
            {label}
          </span>
          <button
            type="button"
            title="Dupliquer"
            aria-label={`Dupliquer ${label}`}
            onClick={() => duplicateNode(pageIndex, nodeId)}
            style={chipButton}
          >
            <Copy size={11} />
          </button>
          <button
            type="button"
            title="Supprimer (Ctrl+Z pour annuler)"
            aria-label={`Supprimer ${label}`}
            onClick={() => {
              removeNode(pageIndex, nodeId);
              selectNode(null);
            }}
            style={chipButton}
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}

      {children}
    </div>
  );
}

function chipStyle(color: string): React.CSSProperties {
  return {
    position: "absolute",
    top: -22,
    left: -1,
    backgroundColor: color,
    color: "#fff",
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: "4px 4px 0 0",
    whiteSpace: "nowrap",
    zIndex: 100,
    pointerEvents: "none",
    fontFamily: "system-ui, sans-serif",
    lineHeight: "16px",
  };
}

const chipButton: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 18,
  height: 18,
  borderRadius: 3,
  border: "none",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  cursor: "pointer",
};
