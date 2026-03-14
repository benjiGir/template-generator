import { useState } from "react";
import { FormField } from "./FormField";
import type { EditableField } from "@template-generator/shared/types/template";

interface Props {
  group: string;
  fields: EditableField[];
  data: Record<string, unknown>;
  onUpdate: (fieldKey: string, value: unknown) => void;
}

export function FormFieldGroup({ group, fields, data, onUpdate }: Props) {
  const [open, setOpen] = useState(true);
  const filled = fields.filter((f) => {
    const val = data[`${f.nodeId}.${f.propKey}`];
    return val !== undefined && val !== null && val !== "";
  }).length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-700">{group}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">{filled}/{fields.length}</span>
          <span className="text-gray-400 text-[10px]">{open ? "▾" : "▸"}</span>
        </div>
      </button>
      {open && (
        <div className="p-4 space-y-4 bg-white">
          {fields.map((field) => (
            <FormField
              key={`${field.nodeId}.${field.propKey}`}
              field={field}
              value={data[`${field.nodeId}.${field.propKey}`]}
              onChange={(v) => onUpdate(`${field.nodeId}.${field.propKey}`, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
