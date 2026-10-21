import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([{ key: "text", label: "Texte", type: "textarea", defaultValue: "Pour la suite..." }]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function SuiteText({ theme, text }: Props) {
  return (
    <p
      style={{
        margin: "8px 0 0",
        fontSize: 12,
        lineHeight: 1.6,
        color: theme.colors.textLight,
        fontStyle: "italic",
      }}
    >
      <span style={{ fontStyle: "normal", marginRight: 4 }}>→</span>
      {text}
    </p>
  );
}

defineComponent({
  type: "suite-text",
  label: 'Texte "Pour la suite"',
  icon: "ArrowRight",
  category: "content",
  description: "Texte de suite ou de prochaine étape",
  schema,
  acceptsChildren: false,
  render: SuiteText,
});
