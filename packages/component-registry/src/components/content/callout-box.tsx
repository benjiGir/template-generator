import type { ElementType } from "react";
import * as LucideIcons from "lucide-react";
import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";
import { RichBlock } from "../../rich-text";

interface Props {
  theme: Theme;
  icon?: string;
  title?: string;
  content?: string;
  color?: string;
  variant?: "info" | "success" | "warning" | "danger";
}

const VARIANT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  info:    { bg: "#EFF6FF", border: "#3B82F6", text: "#1D4ED8" },
  success: { bg: "#F0FDF4", border: "#22C55E", text: "#15803D" },
  warning: { bg: "#FFFBEB", border: "#F59E0B", text: "#B45309" },
  danger:  { bg: "#FEF2F2", border: "#EF4444", text: "#B91C1C" },
};

function CalloutBox({ theme, icon = "Info", title = "", content = "", color, variant = "info" }: Props) {
  const palette = VARIANT_COLORS[variant] ?? VARIANT_COLORS.info!;
  const accentColor = color ?? palette.border;
  const bgColor = color ? `${color}12` : palette.bg;
  const textColor = palette.text;

  const IconComponent = (LucideIcons as Record<string, ElementType>)[icon] ?? LucideIcons.Info;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${accentColor}40`,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: `0 ${theme.borders.radius}px ${theme.borders.radius}px 0`,
        padding: "12px 14px",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ color: accentColor, flexShrink: 0, marginTop: 1 }}>
          <IconComponent size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 13,
                fontWeight: 700,
                color: textColor,
                lineHeight: 1.3,
              }}
            >
              {title}
            </p>
          )}
          <RichBlock
            text={content}
            style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: theme.colors.text }}
          />
        </div>
      </div>
    </div>
  );
}

register({
  type: "callout-box",
  label: "Encadré d'appel",
  icon: "AlertCircle",
  category: "content",
  description: "Encadré d'appel avec icône, titre et contenu richtext",
  schema: [
    { key: "icon", label: "Icône", type: "icon", defaultValue: "Info", group: "Contenu" },
    { key: "title", label: "Titre", type: "text", defaultValue: "", group: "Contenu" },
    { key: "content", label: "Contenu", type: "richtext", defaultValue: "Votre message ici…", group: "Contenu" },
    {
      key: "variant",
      label: "Variante",
      type: "select",
      defaultValue: "info",
      group: "Style",
      options: [
        { label: "Info", value: "info" },
        { label: "Succès", value: "success" },
        { label: "Avertissement", value: "warning" },
        { label: "Danger", value: "danger" },
      ],
    },
    { key: "color", label: "Couleur personnalisée", type: "color", defaultValue: "", group: "Style" },
  ],
  acceptsChildren: false,
  defaultProps: { icon: "Info", title: "", content: "Votre message ici…", variant: "info", color: "" },
  render: CalloutBox as RegisteredComponent["render"],
});
