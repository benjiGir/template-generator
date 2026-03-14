import { PropField } from "@/components/inspector/PropField";
import type { EditableField } from "@template-generator/shared/types/template";

interface Props {
  field: EditableField;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function FormField({ field, value, onChange }: Props) {
  const schema = {
    key:          field.propKey,
    label:        field.label,
    type:         field.type,
    defaultValue: field.defaultValue,
    required:     field.required,
    group:        field.group,
  };

  return (
    <div className="relative">
      {field.required && (
        <span className="absolute -top-0.5 right-0 text-[10px] text-red-400 font-medium">
          requis
        </span>
      )}
      <PropField schema={schema} value={value} onChange={onChange} />
    </div>
  );
}
