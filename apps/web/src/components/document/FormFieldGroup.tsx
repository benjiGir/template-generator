import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FormField } from "./FormField";
import { fieldKey, isFilled } from "@template-generator/shared/utils/fields";
import type { EditableField } from "@template-generator/shared/types/template";

interface Props {
  group: string | null;
  fields: EditableField[];
  data: Record<string, unknown>;
  onUpdate: (fieldKey: string, value: unknown) => void;
  activeKey: string | null;
  onFocusField: (field: EditableField) => void;
}

export function FormFieldGroup({ group, fields, data, onUpdate, activeKey, onFocusField }: Props) {
  const [open, setOpen] = useState(true);
  const filled = fields.filter((f) => isFilled(data[fieldKey(f)])).length;
  const containsActive = fields.some((f) => fieldKey(f) === activeKey);

  // Un champ ciblé depuis l'aperçu ou la relecture rouvre son groupe
  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  const list = (
    <div className="space-y-2">
      {fields.map((field) => (
        <FormField
          key={fieldKey(field)}
          field={field}
          value={data[fieldKey(field)]}
          onChange={(v) => onUpdate(fieldKey(field), v)}
          onFocus={() => onFocusField(field)}
          active={fieldKey(field) === activeKey}
        />
      ))}
    </div>
  );

  if (group === null) return list;

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between border-b border-ink pb-1.5 text-left"
      >
        <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink">
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {group}
        </span>
        <span className="font-mono text-[11px] text-gray-700">
          {filled}/{fields.length}
          {filled === fields.length ? " ✓" : ""}
        </span>
      </button>
      {open && <div className="pt-3">{list}</div>}
    </section>
  );
}
