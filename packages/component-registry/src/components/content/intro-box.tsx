import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";
import { RichText } from "../../rich-text";

interface Props {
  theme: Theme;
  content?: string;
  accentColor?: string;
}

function IntroBox({ theme, content = "", accentColor }: Props) {
  const borderColor = accentColor ?? theme.colors.primary;

  return (
    <div
      style={{
        borderLeft: `4px solid ${borderColor}`,
        backgroundColor: `${borderColor}12`,
        padding: "12px 16px",
        borderRadius: `0 ${theme.borders.radius - 2}px ${theme.borders.radius - 2}px 0`,
        marginBottom: 16,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.65,
          color: theme.colors.text,
        }}
      >
        <RichText text={content} />
      </p>
    </div>
  );
}

register({
  type: "intro-box",
  label: "Encadré introduction",
  icon: "Quote",
  category: "content",
  description: "Texte d'introduction avec bordure colorée",
  schema: [
    { key: "content", label: "Contenu", type: "richtext", defaultValue: "Introduction..." },
    { key: "accentColor", label: "Couleur d'accent", type: "color", defaultValue: "" },
  ],
  acceptsChildren: false,
  defaultProps: { content: "Introduction...", accentColor: "" },
  render: IntroBox as RegisteredComponent["render"],
});
