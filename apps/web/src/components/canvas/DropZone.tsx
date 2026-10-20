import { useDroppable, useDndContext } from "@dnd-kit/core";
import { useDropTarget, type DropZoneData } from "@/hooks/useDragAndDrop";

interface Props {
  pageIndex: number;
  parentId: string | null;
  index: number;
  direction?: "vertical" | "horizontal";
}

const BLUE = "#2448C8";
const RED = "#9E1B32";

/** Point d'insertion entre deux composants ; visible seulement pendant un glisser-déposer */
export function DropZone({ pageIndex, parentId, index, direction = "vertical" }: Props) {
  const id = `dropzone-${pageIndex}-${parentId ?? "root"}-${index}`;
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "dropzone", pageIndex, parentId, index } satisfies DropZoneData,
  });
  const { active } = useDndContext();
  const { check } = useDropTarget();
  const isDragging = active !== null;
  const color = isOver && !check.ok ? RED : BLUE;

  if (direction === "horizontal") {
    return (
      <div
        ref={setNodeRef}
        style={{
          width: isDragging ? (isOver ? 28 : 10) : 0,
          alignSelf: "stretch",
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          transition: "width 0.12s ease",
          minHeight: 20,
        }}
      >
        {isDragging && (
          <div style={{ width: isOver ? 4 : 2, borderRadius: 2, backgroundColor: isOver ? color : "#C9D3F6" }} />
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        width: "100%",
        height: isDragging ? (isOver ? 30 : 10) : 0,
        position: "relative",
        flexShrink: 0,
        transition: "height 0.12s ease",
        display: "flex",
        alignItems: "center",
      }}
    >
      {isDragging && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: isOver ? 3 : 1,
            backgroundColor: isOver ? color : "#C9D3F6",
            borderRadius: 2,
          }}
        />
      )}
      {isOver && (
        <span
          style={{
            position: "relative",
            margin: "0 auto",
            padding: "1px 8px",
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
            color: "#fff",
            backgroundColor: color,
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {check.ok ? "Insérer ici" : check.reason}
        </span>
      )}
    </div>
  );
}
