import type { PropSchema } from "@template-generator/shared/types/component";
import { TextPropField } from "./fields/TextPropField";
import { TextareaPropField } from "./fields/TextareaPropField";
import { NumberPropField } from "./fields/NumberPropField";
import { BooleanPropField } from "./fields/BooleanPropField";
import { SelectPropField } from "./fields/SelectPropField";
import { ColorPropField } from "./fields/ColorPropField";
import { ListPropField } from "./fields/ListPropField";
import { EmojiPropField } from "./fields/EmojiPropField";

interface Props {
  schema: PropSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function PropField({ schema, value, onChange }: Props) {
  const str = (value as string | undefined) ?? String(schema.defaultValue ?? "");
  const num = (value as number | undefined) ?? (schema.defaultValue as number) ?? 0;
  const bool = (value as boolean | undefined) ?? (schema.defaultValue as boolean) ?? false;
  const list = (value as string[] | undefined) ?? (schema.defaultValue as string[]) ?? [];

  switch (schema.type) {
    case "text":
      return (
        <TextPropField
          label={schema.label}
          value={str}
          placeholder={schema.placeholder}
          onChange={onChange}
        />
      );

    case "textarea":
    case "richtext":
      return (
        <TextareaPropField
          label={schema.label}
          value={str}
          placeholder={schema.placeholder}
          onChange={onChange}
        />
      );

    case "number":
      return <NumberPropField label={schema.label} value={num} onChange={onChange} />;

    case "boolean":
      return <BooleanPropField label={schema.label} value={bool} onChange={onChange} />;

    case "select":
      return (
        <SelectPropField
          label={schema.label}
          value={str}
          options={schema.options ?? []}
          onChange={onChange}
        />
      );

    case "color":
      return <ColorPropField label={schema.label} value={str} onChange={onChange} />;

    case "list":
      return <ListPropField label={schema.label} value={list} onChange={onChange} />;

    case "emoji":
      return <EmojiPropField label={schema.label} value={str} onChange={onChange} />;

    default:
      return null;
  }
}
