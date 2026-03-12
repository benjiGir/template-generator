import { DragOverlay as DndDragOverlay } from "@dnd-kit/core";
import { get } from "@template-generator/component-registry/registry";
import type { DragData } from "@/hooks/useDragAndDrop";

interface Props {
  activeDragData: DragData | null;
}

export function DragOverlay({ activeDragData }: Props) {
  return (
    <DndDragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
      {activeDragData ? (
        <div
          style={{
            backgroundColor: "white",
            border: "2px solid #2563EB",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#1D4ED8",
            boxShadow: "0 8px 24px rgba(37,99,235,0.2)",
            fontFamily: "system-ui, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {activeDragData.source === "library"
            ? (get(activeDragData.componentType)?.label ?? activeDragData.componentType)
            : activeDragData.source === "preset"
            ? `${get(activeDragData.baseType)?.label ?? activeDragData.baseType} (preset)`
            : `Déplacer`}
        </div>
      ) : null}
    </DndDragOverlay>
  );
}
