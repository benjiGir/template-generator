import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";
import { RichBlock } from "../../rich-text";

interface Props {
  theme: Theme;
  content?: string;
}

function TextBlock({ theme, content = "" }: Props) {
  return (
    <RichBlock
      text={content}
      style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.65, color: theme.colors.text }}
    />
  );
}

register({
  type: "text-block",
  label: "Bloc texte",
  icon: "AlignLeft",
  category: "content",
  description: "Paragraphe de texte libre",
  schema: [
    { key: "content", label: "Contenu", type: "richtext", defaultValue: "Votre texte ici..." },
  ],
  acceptsChildren: false,
  defaultProps: { content: "Votre texte ici..." },
  render: TextBlock as RegisteredComponent["render"],
});
