import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  text?: string;
}

function SummaryBar({ theme, text = "" }: Props) {
  return (
    <div
      style={{
        backgroundColor: theme.colors.primary,
        color: "#fff",
        padding: "8px 16px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 12,
      }}
    >
      {text}
    </div>
  );
}

register({
  type: "summary-bar",
  label: "Barre de résumé",
  icon: "Minus",
  category: "decoration",
  description: "Bande colorée avec texte de résumé",
  schema: [
    { key: "text", label: "Texte", type: "text", defaultValue: "Résumé" },
  ],
  acceptsChildren: false,
  defaultProps: { text: "Résumé" },
  render: SummaryBar as RegisteredComponent["render"],
});
