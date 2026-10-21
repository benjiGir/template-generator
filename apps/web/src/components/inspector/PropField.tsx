import type { PropType, PropValue } from "@template-generator/shared/types/component";
import { editorValue } from "@template-generator/shared/utils/prop-values";
import { TextPropField } from "./fields/TextPropField";
import { TextareaPropField } from "./fields/TextareaPropField";
import { RichtextPropField } from "./RichtextPropField";
import { NumberPropField } from "./fields/NumberPropField";
import { BooleanPropField } from "./fields/BooleanPropField";
import { SelectPropField } from "./fields/SelectPropField";
import { ColorPropField } from "./fields/ColorPropField";
import { ListPropField } from "./fields/ListPropField";
import { EmojiPropField } from "./fields/EmojiPropField";
import { SpacingPropField } from "./fields/SpacingPropField";
import { FontPropField } from "./fields/FontPropField";
import { BorderPropField } from "./fields/BorderPropField";
import { ImagePropField } from "./fields/ImagePropField";
import { IconPropField } from "./fields/IconPropField";

/** Ce dont un éditeur de prop a besoin : une prop du registre, ou un champ du formulaire du Studio */
export interface PropFieldSpec {
  key: string;
  label: string;
  type: PropType;
  defaultValue?: PropValue;
  options?: readonly { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
}

interface Props {
  schema: PropFieldSpec;
  /** Absente tant que rien n'est saisi : l'éditeur montre la valeur par défaut */
  value: PropValue | undefined;
  onChange: (value: PropValue) => void;
}

/** Types dont le composant de saisie n'affiche pas son propre libellé */
const UNLABELLED = new Set(["text", "textarea", "number", "boolean", "select", "emoji"]);

export function PropField(props: Props) {
  const field = <PropInput {...props} />;
  if (!UNLABELLED.has(props.schema.type)) return field;
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{props.schema.label}</label>
      {field}
    </div>
  );
}

function PropInput({ schema, value, onChange }: Props) {
  const { label, placeholder, defaultValue } = schema;
  // Valeur du type de l'éditeur : saisie, sinon défaut, sinon vide
  const valueAs = <T extends PropType>(type: T) => editorValue(type, value, defaultValue);

  switch (schema.type) {
    case "text":
      return <TextPropField value={valueAs("text")} placeholder={placeholder} onChange={onChange} />;
    case "textarea":
      return <TextareaPropField value={valueAs("textarea")} placeholder={placeholder} onChange={onChange} />;
    case "richtext":
      return (
        <RichtextPropField label={label} value={valueAs("richtext")} placeholder={placeholder} onChange={onChange} />
      );
    case "number":
      return <NumberPropField value={valueAs("number")} onChange={onChange} />;
    case "boolean":
      return <BooleanPropField label={label} value={valueAs("boolean")} onChange={onChange} />;
    case "select":
      return <SelectPropField value={valueAs("select")} options={schema.options ?? []} onChange={onChange} />;
    case "color":
      return <ColorPropField label={label} value={valueAs("color")} onChange={onChange} />;
    case "list":
      return <ListPropField label={label} value={valueAs("list")} onChange={onChange} />;
    case "emoji":
      return <EmojiPropField value={valueAs("emoji")} onChange={onChange} />;
    case "spacing":
      return <SpacingPropField label={label} value={valueAs("spacing")} onChange={onChange} />;
    case "font":
      return <FontPropField label={label} value={valueAs("font")} onChange={onChange} />;
    case "border":
      return <BorderPropField label={label} value={valueAs("border")} onChange={onChange} />;
    case "image":
      return <ImagePropField label={label} value={valueAs("image")} onChange={onChange} />;
    case "icon":
      return <IconPropField label={label} value={valueAs("icon")} onChange={onChange} />;
  }
}
