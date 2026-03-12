import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  text?: string;
}

function PageFooter({ theme, text = "" }: Props) {
  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 10,
        borderTop: `1px solid ${theme.colors.border}`,
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          color: theme.colors.textLight,
          letterSpacing: "0.03em",
        }}
      >
        {text}
      </p>
    </div>
  );
}

register({
  type: "page-footer",
  label: "Pied de page",
  icon: "PanelBottom",
  category: "decoration",
  description: "Pied de page avec texte centré",
  schema: [
    { key: "text", label: "Texte", type: "textarea", defaultValue: "Pied de page" },
  ],
  acceptsChildren: false,
  defaultProps: { text: "Pied de page" },
  render: PageFooter as RegisteredComponent["render"],
});
