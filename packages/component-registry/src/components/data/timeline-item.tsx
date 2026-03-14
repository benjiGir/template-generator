import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";
import { resolveColor } from "../../color-map";
import { RichBlock } from "../../rich-text";

interface Props {
  theme: Theme;
  date?: string;
  title?: string;
  description?: string;
  color?: string;
}

function TimelineItem({ theme, date = "", title = "", description = "", color = "blue" }: Props) {
  const accentColor = resolveColor(color, theme);

  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 12, position: "relative" }}>
      {/* Dot + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 3 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: accentColor,
            border: `2px solid ${accentColor}`,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            width: 2,
            flex: 1,
            backgroundColor: `${accentColor}30`,
            marginTop: 4,
            minHeight: 20,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 12 }}>
        {date && (
          <p
            style={{
              margin: "0 0 2px",
              fontSize: 11,
              fontWeight: 600,
              color: accentColor,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {date}
          </p>
        )}
        {title && (
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
        )}
        <RichBlock
          text={description}
          style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: theme.colors.textLight }}
        />
      </div>
    </div>
  );
}

register({
  type: "timeline-item",
  label: "Élément de timeline",
  icon: "Clock",
  category: "data",
  description: "Entrée chronologique avec date, titre et description",
  schema: [
    { key: "date", label: "Date", type: "text", defaultValue: "Janv. 2025", group: "Contenu" },
    { key: "title", label: "Titre", type: "text", defaultValue: "Événement", group: "Contenu" },
    { key: "description", label: "Description", type: "richtext", defaultValue: "", group: "Contenu" },
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
  defaultProps: { date: "Janv. 2025", title: "Événement", description: "", color: "blue" },
  render: TimelineItem as RegisteredComponent["render"],
});
