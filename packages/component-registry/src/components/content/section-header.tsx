import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([{ key: "text", label: "Texte", type: "text", role: "section", defaultValue: "Section" }]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function SectionHeader({ theme, text }: Props) {
  return (
    <div
      style={{
        borderBottom: `2px solid ${theme.colors.primary}`,
        paddingBottom: 6,
        marginBottom: 14,
        marginTop: 8,
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: theme.colors.primary,
        }}
      >
        {text}
      </span>
    </div>
  );
}

defineComponent({
  type: "section-header",
  label: "En-tête de section",
  icon: "Heading2",
  category: "content",
  description: "Titre de section avec ligne de séparation",
  schema,
  acceptsChildren: false,
  render: SectionHeader,
});
