import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([{ key: "text", label: "Texte", type: "text", defaultValue: "Résumé" }]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function SummaryBar({ theme, text }: Props) {
  return (
    <div
      style={{
        backgroundColor: theme.colors.primary,
        color: "#fff",
        padding: "8px 16px",
        borderRadius: theme.borders.radius / 2,
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 12,
      }}
    >
      {text}
    </div>
  );
}

defineComponent({
  type: "summary-bar",
  label: "Barre de résumé",
  icon: "Minus",
  category: "decoration",
  description: "Bande colorée avec texte de résumé",
  schema,
  acceptsChildren: false,
  render: SummaryBar,
});
