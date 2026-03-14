import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  title?: string;
  subtitle?: string;
}

function TitleBlock({ theme, title = "Titre", subtitle }: Props) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1
        style={{
          fontSize: theme.typography.headingSizes.h1,
          fontWeight: theme.typography.fontWeights.extrabold,
          color: theme.colors.text,
          margin: 0,
          lineHeight: 1.2,
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: theme.typography.baseFontSize,
            color: theme.colors.textLight,
            margin: "6px 0 0",
            fontWeight: theme.typography.fontWeights.normal,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

register({
  type: "title-block",
  label: "Bloc titre",
  icon: "Heading1",
  category: "content",
  description: "Titre principal et sous-titre de page",
  schema: [
    { key: "title", label: "Titre", type: "text", defaultValue: "Titre de la page" },
    { key: "subtitle", label: "Sous-titre", type: "text", defaultValue: "" },
  ],
  acceptsChildren: false,
  defaultProps: { title: "Titre de la page", subtitle: "" },
  render: TitleBlock as RegisteredComponent["render"],
});
