import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  style?: "solid" | "dashed" | "dotted";
  color?: string;
  thickness?: number;
}

function Divider({ theme, style = "solid", color, thickness = 1 }: Props) {
  const borderColor = color ?? theme.colors.border;

  return (
    <div
      style={{
        borderTop: `${thickness}px ${style} ${borderColor}`,
        margin: "12px 0",
      }}
    />
  );
}

register({
  type: "divider",
  label: "Séparateur",
  icon: "Minus",
  category: "decoration",
  description: "Ligne de séparation horizontale",
  schema: [
    {
      key: "style",
      label: "Style",
      type: "select",
      defaultValue: "solid",
      options: [
        { label: "Plein", value: "solid" },
        { label: "Tirets", value: "dashed" },
        { label: "Pointillés", value: "dotted" },
      ],
    },
    { key: "color", label: "Couleur", type: "color", defaultValue: "" },
    { key: "thickness", label: "Épaisseur (px)", type: "number", defaultValue: 1 },
  ],
  acceptsChildren: false,
  defaultProps: { style: "solid", color: "", thickness: 1 },
  render: Divider as RegisteredComponent["render"],
});
