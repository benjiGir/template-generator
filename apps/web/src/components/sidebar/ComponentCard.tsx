import { useDraggable } from "@dnd-kit/core";
import type { RegisteredComponent } from "@template-generator/component-registry/registry";
import type { LibraryDragData } from "@/hooks/useDragAndDrop";

interface Props {
  definition: RegisteredComponent;
}

export function ComponentCard({ definition }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${definition.type}`,
    data: { source: "library", componentType: definition.type } satisfies LibraryDragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-start gap-2 px-3 py-2.5 rounded cursor-grab active:cursor-grabbing hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
      style={{ opacity: isDragging ? 0.4 : 1, touchAction: "none" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-tight">{definition.label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-tight truncate">{definition.description}</p>
      </div>
    </div>
  );
}
