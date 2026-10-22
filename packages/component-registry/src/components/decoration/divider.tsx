import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([
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
]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function Divider({ theme, style, color, thickness }: Props) {
  // Couleur vide (valeur par défaut) : celle du thème
  const borderColor = color || theme.colors.border;

  return (
    <div
      style={{
        borderTop: `${thickness}px ${style} ${borderColor}`,
        margin: "12px 0",
      }}
    />
  );
}

defineComponent({
  type: "divider",
  label: "Séparateur",
  icon: "Minus",
  category: "decoration",
  description: "Ligne de séparation horizontale",
  schema,
  acceptsChildren: false,
  render: Divider,
});
