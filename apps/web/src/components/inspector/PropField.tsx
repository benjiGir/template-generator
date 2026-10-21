import type { PropSchema, SpacingValue, BorderValue, ImageValue } from "@template-generator/shared/types/component";
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

interface Props {
  schema: PropSchema;
  value: unknown;
  onChange: (value: unknown) => void;
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
  const str = (value as string | undefined) ?? String(schema.defaultValue ?? "");
  const num = (value as number | undefined) ?? (schema.defaultValue as number) ?? 0;
  const bool = (value as boolean | undefined) ?? (schema.defaultValue as boolean) ?? false;
  const list = (value as string[] | undefined) ?? (schema.defaultValue as string[]) ?? [];

  switch (schema.type) {
    case "text":
      return <TextPropField value={str} placeholder={schema.placeholder} onChange={onChange} />;

    case "textarea":
      return <TextareaPropField value={str} placeholder={schema.placeholder} onChange={onChange} />;

    case "richtext":
      return (
        <RichtextPropField label={schema.label} value={str} placeholder={schema.placeholder} onChange={onChange} />
      );

    case "number":
      return <NumberPropField value={num} onChange={onChange} />;

    case "boolean":
      return <BooleanPropField value={bool} onChange={onChange} />;

    case "select":
      return <SelectPropField value={str} options={schema.options ?? []} onChange={onChange} />;

    case "color":
      return <ColorPropField label={schema.label} value={str} onChange={onChange} />;

    case "list":
      return <ListPropField label={schema.label} value={list} onChange={onChange} />;

    case "emoji":
      return <EmojiPropField value={str} onChange={onChange} />;

    case "spacing":
      return (
        <SpacingPropField
          label={schema.label}
          value={
            (value as SpacingValue | undefined) ??
            (schema.defaultValue as SpacingValue) ?? { top: 0, right: 0, bottom: 0, left: 0 }
          }
          onChange={onChange}
        />
      );

    case "font":
      return <FontPropField label={schema.label} value={str} onChange={onChange} />;

    case "border":
      return (
        <BorderPropField
          label={schema.label}
          value={
            (value as BorderValue | undefined) ??
            (schema.defaultValue as BorderValue) ?? { style: "solid", width: 1, color: "#000000", radius: 0 }
          }
          onChange={onChange}
        />
      );

    case "image":
      return (
        <ImagePropField
          label={schema.label}
          value={(value as ImageValue | undefined) ?? (schema.defaultValue as ImageValue) ?? { type: "url", value: "" }}
          onChange={onChange}
        />
      );

    case "icon":
      return <IconPropField label={schema.label} value={str} onChange={onChange} />;

    default:
      return null;
  }
}
