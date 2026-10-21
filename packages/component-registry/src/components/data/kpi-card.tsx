import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";
import { resolveColor, resolveLightBg } from "../../color-map";

const schema = defineSchema([
  { key: "emoji", label: "Emoji", type: "emoji", defaultValue: "📊", group: "Contenu" },
  { key: "title", label: "Titre", type: "text", role: "name", defaultValue: "KPI", group: "Contenu" },
  { key: "description", label: "Description", type: "textarea", defaultValue: "", group: "Contenu" },
  {
    key: "color",
    label: "Couleur",
    type: "select",
    defaultValue: "blue",
    group: "Style",
    options: [
      { label: "Bleu", value: "blue" },
      { label: "Vert", value: "green" },
      { label: "Ambre", value: "amber" },
      { label: "Rouge", value: "red" },
    ],
  },
]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function KpiCard({ theme, emoji, title, description, color }: Props) {
  const accentColor = resolveColor(color, theme);
  const lightBg = resolveLightBg(color, theme);

  return (
    <div
      style={{
        backgroundColor: lightBg,
        border: `${theme.borders.width}px solid ${accentColor}30`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: theme.borders.radius,
        padding: "12px 14px",
        flex: 1,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</div>
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 13,
          fontWeight: 700,
          color: theme.colors.text,
          lineHeight: 1.3,
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          lineHeight: 1.55,
          color: theme.colors.textLight,
        }}
      >
        {description}
      </p>
    </div>
  );
}

defineComponent({
  type: "kpi-card",
  label: "Carte KPI",
  icon: "BarChart3",
  category: "data",
  description: "Indicateur clé avec emoji, titre et description",
  schema,
  acceptsChildren: false,
  render: KpiCard,
});
