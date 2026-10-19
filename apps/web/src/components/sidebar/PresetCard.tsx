import { useDraggable } from "@dnd-kit/core";
import { get } from "@template-generator/component-registry/registry";
import type { ComponentPreset } from "@template-generator/shared/types/document";
import type { PresetDragData } from "@/hooks/useDragAndDrop";

interface Props {
  preset: ComponentPreset;
}

/** Preset dans la bibliothèque de l'éditeur ; il se gère (modifier, supprimer) depuis l'espace Bibliothèque */
export function PresetCard({ preset }: Props) {
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
      className="flex items-start gap-2 rounded border border-transparent px-3 py-2.5 transition-all hover:border-blue-200 hover:bg-blue-50 cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.4 : 1, touchAction: "none" }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold leading-tight text-gray-800">{preset.label}</p>
        <p className="mt-0.5 truncate text-xs leading-tight text-gray-400">{get(preset.baseType)?.label ?? preset.baseType}</p>
      </div>
    </div>
  );
}
