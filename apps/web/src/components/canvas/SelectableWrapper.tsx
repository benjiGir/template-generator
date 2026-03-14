import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useEditorStore } from "@/store/editor-store";
import { get } from "@template-generator/component-registry/registry";
import type { CanvasDragData } from "@/hooks/useDragAndDrop";

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
  const isSelected = selectedNodeId === nodeId;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const definition = get(nodeType);
    const richtextProp = definition?.schema.find(
      (p) => p.type === "richtext" || p.type === "textarea"
    );
    if (richtextProp) startInlineEdit(nodeId, richtextProp.key);
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `canvas-${nodeId}`,
    data: { source: "canvas", nodeId, pageIndex } satisfies CanvasDragData,
  });

  return (
    <div
      ref={setNodeRef}
      className="group/node"
      style={{
        position: "relative",
        opacity: isDragging ? 0.35 : 1,
        outline: isSelected ? "2px solid #2563EB" : "2px solid transparent",
        outlineOffset: 1,
        borderRadius: 2,
        cursor: "default",
        transition: "outline-color 0.1s",
      }}
      onClick={(e) => { e.stopPropagation(); selectNode(nodeId); }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Poignée de déplacement */}
      <div
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover/node:opacity-100"
        style={{
          position: "absolute",
          top: 2,
          right: 2,
          zIndex: 50,
          backgroundColor: isSelected ? "#2563EB" : "rgba(0,0,0,0.45)",
          color: "white",
          border: "none",
          borderRadius: 3,
          width: 18,
          height: 18,
          cursor: "grab",
          fontSize: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          transition: "opacity 0.1s",
          userSelect: "none",
          touchAction: "none",
        }}
        title={`Déplacer : ${nodeType}`}
      >
        ⠿
      </div>

      {/* Badge type quand sélectionné */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: -20,
            left: 0,
            backgroundColor: "#2563EB",
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 6px",
            borderRadius: "3px 3px 0 0",
            whiteSpace: "nowrap",
            zIndex: 100,
            pointerEvents: "none",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {nodeType}
        </div>
      )}

      {children}
    </div>
  );
}
