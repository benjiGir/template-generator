import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ItemProps {
  id: string;
  value: string;
  onUpdate: (v: string) => void;
  onRemove: () => void;
}

function SortableItem({ id, value, onUpdate, onRemove }: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1.5">
      <button
        type="button"
        {...listeners}
        {...attributes}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing px-0.5 text-sm leading-none"
        tabIndex={-1}
      >
        ⠿
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-white"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 text-sm leading-none px-1"
        title="Supprimer"
      >
        ×
      </button>
    </div>
  );
}

interface Props {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}

export function ListPropField({ label, value, onChange }: Props) {
  const items = value ?? [];
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Stable ids for dnd — use index-based keys as stable ids since items can be dupes
  const ids = items.map((_, i) => String(i));

  const update = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...items, ""]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  const openBulk = () => {
    setBulkText(items.join("\n"));
    setBulkMode(true);
  };

  const applyBulk = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    onChange(lines);
    setBulkMode(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <button
          type="button"
          onClick={bulkMode ? applyBulk : openBulk}
          className="text-[10px] text-blue-500 hover:text-blue-700 transition-colors"
        >
          {bulkMode ? "Appliquer" : "Édition groupée"}
        </button>
      </div>

      {bulkMode ? (
        <div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            autoFocus
            placeholder="Un élément par ligne…"
            className="w-full px-2.5 py-1.5 text-xs border border-blue-300 rounded focus:outline-none focus:border-blue-500 bg-white resize-none font-mono"
          />
          <button
            type="button"
            onClick={() => setBulkMode(false)}
            className="mt-1 w-full py-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Annuler
          </button>
        </div>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {items.map((item, i) => (
                  <SortableItem
                    key={i}
                    id={String(i)}
                    value={item}
                    onUpdate={(v) => update(i, v)}
                    onRemove={() => remove(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={add}
            className="mt-2 w-full py-1 text-xs text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50 transition-colors"
          >
            + Ajouter
          </button>
        </>
      )}
    </div>
  );
}
