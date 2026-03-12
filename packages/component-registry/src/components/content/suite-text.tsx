import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  text?: string;
}

function SuiteText({ theme, text = "" }: Props) {
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

register({
  type: "suite-text",
  label: 'Texte "Pour la suite"',
  icon: "ArrowRight",
  category: "content",
  description: "Texte de suite ou de prochaine étape",
  schema: [
    { key: "text", label: "Texte", type: "textarea", defaultValue: "Pour la suite..." },
  ],
  acceptsChildren: false,
  defaultProps: { text: "Pour la suite..." },
  render: SuiteText as RegisteredComponent["render"],
});
