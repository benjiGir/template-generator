import { useState } from "react";
import { PropField } from "@/components/inspector/PropField";
import { isFilled } from "@template-generator/shared/utils/fields";
import type { EditableField } from "@template-generator/shared/types/template";

interface Props {
  field: EditableField;
  value: unknown;
  onChange: (value: unknown) => void;
  onFocus?: () => void;
  active?: boolean;
}

/** Types pour lesquels le contenu du template est montré en grisé plutôt que comme valeur */
const PLACEHOLDER_TYPES = new Set(["text", "textarea", "richtext", "list"]);

function defaultAsText(value: unknown): string {
  if (Array.isArray(value)) return value.filter(Boolean).join(" · ");
  return typeof value === "string" ? value : "";
}

/**
 * Un champ du formulaire du Studio.
 * Tant que rien n'est saisi, le document affiche le contenu du template : on le montre en grisé.
 * Vider un champ revient à ce contenu par défaut.
 */
export function FormField({ field, value, onChange, onFocus, active }: Props) {
  const [resetKey, setResetKey] = useState(0);
  const usesPlaceholder = PLACEHOLDER_TYPES.has(field.type);
  const defaultText = defaultAsText(field.defaultValue);
  const filled = isFilled(value);

  const schema = {
    key:          field.propKey,
    label:        field.label,
    type:         field.type,
    defaultValue: usesPlaceholder ? (field.type === "list" ? [] : "") : field.defaultValue,
    placeholder:  usesPlaceholder && defaultText ? defaultText : undefined,
    required:     field.required,
    group:        field.group,
  };

  const startFromDefault = () => {
    onChange(field.defaultValue);
    setResetKey((k) => k + 1);
  };

  return (
    <div
      id={`field-${field.nodeId}.${field.propKey}`}
      onFocusCapture={onFocus}
      onMouseDown={onFocus}
      className={`relative -mx-2 rounded-md px-2 py-1.5 transition-colors ${active ? "bg-blue-50/70 ring-1 ring-blue-200" : ""}`}
    >
      <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
        {field.required && !filled && <span className="text-[10px] font-medium text-amber-700">obligatoire</span>}
        {field.required && filled && <span className="text-[10px] font-medium text-emerald-600">✓</span>}
      </div>
      <PropField key={resetKey} schema={schema} value={value} onChange={onChange} />
      {usesPlaceholder && !filled && defaultText && (
        <p className="mt-1 text-[11px] text-gray-400">
          Vide : le document garde le contenu du template.{" "}
          {(field.type === "textarea" || field.type === "richtext" || field.type === "list") && (
            <button type="button" onClick={startFromDefault} className="text-blue-600 hover:underline">
              Partir de ce contenu
            </button>
          )}
        </p>
      )}
    </div>
  );
}
