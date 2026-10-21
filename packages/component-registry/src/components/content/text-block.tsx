import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";
import { RichBlock } from "../../rich-text";

const schema = defineSchema([
  { key: "content", label: "Contenu", type: "richtext", defaultValue: "Votre texte ici..." },
]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function TextBlock({ theme, content }: Props) {
  return (
    <RichBlock text={content} style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.65, color: theme.colors.text }} />
  );
}

defineComponent({
  type: "text-block",
  label: "Bloc texte",
  icon: "AlignLeft",
  category: "content",
  description: "Paragraphe de texte libre",
  schema,
  acceptsChildren: false,
  render: TextBlock,
});
