import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([{ key: "text", label: "Texte", type: "textarea", defaultValue: "Pied de page" }]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function PageFooter({ theme, text }: Props) {
  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 10,
        borderTop: `1px solid ${theme.colors.border}`,
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          color: theme.colors.textLight,
          letterSpacing: "0.03em",
        }}
      >
        {text}
      </p>
    </div>
  );
}

defineComponent({
  type: "page-footer",
  formGroup: "Pied de page",
  label: "Pied de page",
  icon: "PanelBottom",
  category: "decoration",
  description: "Pied de page avec texte centré",
  schema,
  acceptsChildren: false,
  render: PageFooter,
});
