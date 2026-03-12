import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  text?: string;
}

function SectionHeader({ theme, text = "Section" }: Props) {
  return (
    <div
      style={{
        borderBottom: `2px solid ${theme.colors.primary}`,
        paddingBottom: 6,
        marginBottom: 14,
        marginTop: 8,
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: theme.colors.primary,
        }}
      >
        {text}
      </span>
    </div>
  );
}

register({
  type: "section-header",
  label: "En-tête de section",
  icon: "Heading2",
  category: "content",
  description: "Titre de section avec ligne de séparation",
  schema: [
    { key: "text", label: "Texte", type: "text", defaultValue: "Section" },
  ],
  acceptsChildren: false,
  defaultProps: { text: "Section" },
  render: SectionHeader as RegisteredComponent["render"],
});
