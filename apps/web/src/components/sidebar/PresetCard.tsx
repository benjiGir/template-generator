import { useDraggable } from "@dnd-kit/core";
import type { ComponentPreset } from "@template-generator/shared/types/document";
import type { PresetDragData } from "@/hooks/useDragAndDrop";
import { usePresetsStore } from "@/store/presets-store";

interface Props {
  preset: ComponentPreset;
}

export function PresetCard({ preset }: Props) {
  const deletePreset = usePresetsStore((s) => s.deletePreset);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `preset-${preset.id}`,
    data: {
      source: "preset",
      presetId: preset.id,
      baseType: preset.baseType,
      defaultProps: preset.defaultProps,
    } satisfies PresetDragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-start gap-2 px-3 py-2.5 rounded cursor-grab active:cursor-grabbing hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
      style={{ opacity: isDragging ? 0.4 : 1, touchAction: "none" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-tight">{preset.label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-tight truncate">{preset.baseType}</p>
      </div>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs transition-opacity shrink-0 mt-0.5"
        title="Supprimer"
      >
        ✕
      </button>
    </div>
  );
}
