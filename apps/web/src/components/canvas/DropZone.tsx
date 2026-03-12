import { useDroppable, useDndContext } from "@dnd-kit/core";
import type { DropZoneData } from "@/hooks/useDragAndDrop";

interface Props {
  pageIndex: number;
  parentId: string | null;
  index: number;
  direction?: "vertical" | "horizontal";
}

export function DropZone({ pageIndex, parentId, index, direction = "vertical" }: Props) {
  const id = `dropzone-${pageIndex}-${parentId ?? "root"}-${index}`;
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "dropzone", pageIndex, parentId, index } satisfies DropZoneData,
  });

  // Afficher la zone seulement quand un drag est en cours
  const { active } = useDndContext();
  const isDragging = active !== null;

  if (direction === "horizontal") {
    return (
      <div
        ref={setNodeRef}
        style={{
          width: isDragging ? (isOver ? 32 : 8) : 0,
          alignSelf: "stretch",
          flexShrink: 0,
          backgroundColor: isOver ? "#2563EB" : isDragging ? "#BFDBFE" : "transparent",
          borderRadius: 2,
          transition: "all 0.15s ease",
          minHeight: 20,
        }}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        width: "100%",
        height: isDragging ? (isOver ? 28 : 6) : 0,
        position: "relative",
        flexShrink: 0,
        transition: "height 0.15s ease",
        display: "flex",
        alignItems: "center",
      }}
    >
      {isOver && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "#2563EB",
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
}
