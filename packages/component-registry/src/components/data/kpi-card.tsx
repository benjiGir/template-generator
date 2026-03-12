import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";
import { resolveColor, resolveLightBg } from "../../color-map";

interface Props {
  theme: Theme;
  emoji?: string;
  title?: string;
  description?: string;
  color?: string;
}

function KpiCard({ theme, emoji = "📊", title = "KPI", description = "", color = "blue" }: Props) {
  const accentColor = resolveColor(color, theme);
  const lightBg = resolveLightBg(color, theme);

  return (
    <div
      style={{
        backgroundColor: lightBg,
        border: `1px solid ${accentColor}30`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 8,
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

register({
  type: "kpi-card",
  label: "Carte KPI",
  icon: "BarChart3",
  category: "data",
  description: "Indicateur clé avec emoji, titre et description",
  schema: [
    { key: "emoji", label: "Emoji", type: "emoji", defaultValue: "📊" },
    { key: "title", label: "Titre", type: "text", defaultValue: "KPI" },
    { key: "description", label: "Description", type: "textarea", defaultValue: "" },
    {
      key: "color",
      label: "Couleur",
      type: "select",
      defaultValue: "blue",
      options: [
        { label: "Bleu", value: "blue" },
        { label: "Vert", value: "green" },
        { label: "Ambre", value: "amber" },
        { label: "Rouge", value: "red" },
      ],
    },
  ],
  acceptsChildren: false,
  defaultProps: { emoji: "📊", title: "KPI", description: "", color: "blue" },
  render: KpiCard as RegisteredComponent["render"],
});
