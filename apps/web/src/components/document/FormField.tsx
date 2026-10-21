import { useState } from "react";
import { PropField } from "@/components/inspector/PropField";
import { isFilled } from "@template-generator/shared/utils/fields";
import type { EditableField } from "@template-generator/shared/types/template";
import type { PropValue } from "@template-generator/shared/types/component";
import { Button } from "@/components/ui/Button";

interface Props {
  field: EditableField;
  /** Absente tant que rien n'est saisi */
  value: PropValue | undefined;
  onChange: (value: PropValue) => void;
  onFocus?: () => void;
  active?: boolean;
}

/** Types pour lesquels le contenu du template est montré en grisé plutôt que comme valeur */
const PLACEHOLDER_TYPES = new Set(["text", "textarea", "richtext", "list"]);

/** Texte lisible du contenu par défaut (le Markdown du texte enrichi est retiré) */
function defaultAsText(value: PropValue): string {
  if (Array.isArray(value)) return value.filter(Boolean).join(" · ");
  if (typeof value !== "string") return "";
  return value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|\*|_|`)(.+?)\1/g, "$2")
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
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
    key: field.propKey,
    label: field.label,
    type: field.type,
    defaultValue: usesPlaceholder ? (field.type === "list" ? [] : "") : field.defaultValue,
    placeholder: usesPlaceholder && defaultText ? defaultText : undefined,
    required: field.required,
    group: field.group,
  };

  const requiredBadge = field.required ? (
    filled ? (
      <span className="text-[10px] font-medium text-ink">✓ obligatoire</span>
    ) : (
      <span className="text-[10px] font-medium text-warn-strong">obligatoire</span>
    )
  ) : null;

  const startFromDefault = () => {
    onChange(field.defaultValue);
    setResetKey((k) => k + 1);
  };

  return (
    <div
      id={`field-${field.nodeId}.${field.propKey}`}
      onFocusCapture={onFocus}
      onMouseDown={onFocus}
      className={`relative -mx-2 rounded-md px-2 py-1.5 transition-colors ${active ? "bg-doc-tint/70 ring-1 ring-doc/30" : ""}`}
    >
      {/* Les listes ont leur propre action en haut à droite : le statut passe sous le champ */}
      {field.type !== "list" && <div className="absolute right-2 top-1.5">{requiredBadge}</div>}
      <PropField key={resetKey} schema={schema} value={value} onChange={onChange} />
      {field.type === "list" && requiredBadge && <div className="mt-1">{requiredBadge}</div>}
      {usesPlaceholder && !filled && defaultText && (
        <p className="mt-1 text-[11px] text-ink-faint">
          Vide : le document garde le contenu du template.{" "}
          {(field.type === "textarea" || field.type === "richtext" || field.type === "list") && (
            <Button variant="link" tone="doc" onClick={startFromDefault}>
              Partir de ce contenu
            </Button>
          )}
        </p>
      )}
    </div>
  );
}
