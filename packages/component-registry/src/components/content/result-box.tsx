import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  text?: string;
}

function ResultBox({ theme, text = "" }: Props) {
  return (
    <div
      style={{
        backgroundColor: theme.colors.border,
        borderRadius: 6,
        padding: "10px 14px",
        marginTop: 10,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.6,
          color: theme.colors.text,
        }}
      >
        {text}
      </p>
    </div>
  );
}

register({
  type: "result-box",
  label: "Encadré résultat",
  icon: "CheckSquare",
  category: "content",
  description: "Encadré de résumé ou de résultat",
  schema: [
    { key: "text", label: "Texte", type: "textarea", defaultValue: "Résultat..." },
  ],
  acceptsChildren: false,
  defaultProps: { text: "Résultat..." },
  render: ResultBox as RegisteredComponent["render"],
});
