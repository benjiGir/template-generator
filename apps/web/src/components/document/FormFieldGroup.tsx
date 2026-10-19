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
    <section className="rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-t-lg bg-gray-50 px-4 py-2.5 hover:bg-gray-100"
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {group}
        </span>
        <span className={`text-[11px] ${filled === fields.length ? "text-emerald-600" : "text-gray-400"}`}>
          {filled}/{fields.length}
        </span>
      </button>
      {open && <div className="px-4 py-3">{list}</div>}
    </section>
  );
}
