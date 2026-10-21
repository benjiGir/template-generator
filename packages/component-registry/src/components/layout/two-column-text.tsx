import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";
import { RichBlock } from "../../rich-text";

const schema = defineSchema([
  {
    key: "leftContent",
    label: "Colonne gauche",
    type: "richtext",
    defaultValue: "Contenu gauche…",
    group: "Contenu",
  },
  {
    key: "rightContent",
    label: "Colonne droite",
    type: "richtext",
    defaultValue: "Contenu droite…",
    group: "Contenu",
  },
  {
    key: "ratio",
    label: "Ratio",
    type: "select",
    defaultValue: "50-50",
    group: "Style",
    options: [
      { label: "50 / 50", value: "50-50" },
      { label: "60 / 40", value: "60-40" },
      { label: "40 / 60", value: "40-60" },
      { label: "70 / 30", value: "70-30" },
    ],
  },
]);

type Props = PropsOf<typeof schema> & { theme: Theme };

const RATIO_MAP: Record<string, [string, string]> = {
  "50-50": ["50%", "50%"],
  "60-40": ["60%", "40%"],
  "40-60": ["40%", "60%"],
  "70-30": ["70%", "30%"],
};

function TwoColumnText({ theme, leftContent, rightContent, ratio }: Props) {
  const [leftW, rightW] = RATIO_MAP[ratio] ?? ["50%", "50%"];
  const gap = theme.spacing.unit * 4;

  return (
    <div style={{ display: "flex", gap, marginBottom: 12 }}>
      <div style={{ width: leftW, minWidth: 0 }}>
        <RichBlock text={leftContent} style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: theme.colors.text }} />
      </div>
      <div style={{ width: rightW, minWidth: 0 }}>
        <RichBlock
          text={rightContent}
          style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: theme.colors.text }}
        />
      </div>
    </div>
  );
}

defineComponent({
  type: "two-column-text",
  label: "Texte 2 colonnes",
  icon: "Layout",
  category: "layout",
  description: "Deux colonnes de texte richtext avec ratio configurable",
  schema,
  acceptsChildren: false,
  render: TwoColumnText,
});
