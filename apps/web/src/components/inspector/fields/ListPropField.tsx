import { useState, type CSSProperties } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";

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

  const style: CSSProperties = {
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
        className="text-rule-strong hover:text-ink-subtle cursor-grab active:cursor-grabbing px-0.5 text-sm leading-none"
        tabIndex={-1}
      >
        ⠿
      </button>
      <Input value={value} onChange={(e) => onUpdate(e.target.value)} className="flex-1" />
      <IconButton label="Supprimer l'élément" icon={<X size={12} />} tone="danger" size="sm" onClick={onRemove} />
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
        <label className="text-xs font-medium text-ink-muted">{label}</label>
        <Button variant="link" tone="tpl" onClick={bulkMode ? applyBulk : openBulk} className="text-[10px]">
          {bulkMode ? "Appliquer" : "Édition groupée"}
        </Button>
      </div>

      {bulkMode ? (
        <div>
          <Textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            autoFocus
            aria-label={`${label}, un élément par ligne`}
            placeholder="Un élément par ligne…"
            className="resize-none font-mono"
          />
          <Button variant="ghost" size="sm" block onClick={() => setBulkMode(false)} className="mt-1">
            Annuler
          </Button>
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
          <Button variant="dashed" tone="tpl" size="sm" block onClick={add} className="mt-2">
            + Ajouter
          </Button>
        </>
      )}
    </div>
  );
}
