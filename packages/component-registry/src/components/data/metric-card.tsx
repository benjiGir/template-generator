import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";
import { resolveColor, resolveLightBg } from "../../color-map";

interface Props {
  theme: Theme;
  value?: string;
  label?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
}

const TREND_ICONS = { up: "↑", down: "↓", neutral: "→" } as const;
const TREND_COLORS = { up: "#16A34A", down: "#DC2626", neutral: "#6B7280" } as const;

function MetricCard({ theme, value = "0", label = "Métrique", trend = "neutral", trendValue = "", color = "blue" }: Props) {
  const accentColor = resolveColor(color, theme);
  const bgColor = resolveLightBg(color, theme);
  const trendColor = TREND_COLORS[trend] ?? TREND_COLORS.neutral;
  const trendIcon = TREND_ICONS[trend] ?? TREND_ICONS.neutral;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `${theme.borders.width}px solid ${accentColor}30`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: theme.borders.radius,
        padding: "14px 16px",
        flex: 1,
      }}
    >
      <p
        style={{
          margin: "0 0 2px",
          fontSize: 11,
          color: theme.colors.textMuted,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 28,
          fontWeight: 800,
          color: accentColor,
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      {trendValue && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: trendColor }}>{trendIcon}</span>
          <span style={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>{trendValue}</span>
        </div>
      )}
    </div>
  );
}

register({
  type: "metric-card",
  label: "Carte métrique",
  icon: "TrendingUp",
  category: "data",
  description: "Indicateur de performance avec valeur, tendance et couleur",
  schema: [
    { key: "value", label: "Valeur", type: "text", defaultValue: "0", group: "Contenu" },
    { key: "label", label: "Libellé", type: "text", defaultValue: "Métrique", group: "Contenu" },
    {
      key: "trend",
      label: "Tendance",
      type: "select",
      defaultValue: "neutral",
      group: "Contenu",
      options: [
        { label: "Hausse ↑", value: "up" },
        { label: "Baisse ↓", value: "down" },
        { label: "Stable →", value: "neutral" },
      ],
    },
    { key: "trendValue", label: "Valeur tendance", type: "text", defaultValue: "", group: "Contenu" },
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
  ],
  acceptsChildren: false,
  defaultProps: { value: "0", label: "Métrique", trend: "neutral", trendValue: "", color: "blue" },
  render: MetricCard as RegisteredComponent["render"],
});
