import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([{ key: "text", label: "Texte", type: "textarea", defaultValue: "Résultat..." }]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function ResultBox({ theme, text }: Props) {
  return (
    <div
      style={{
        backgroundColor: theme.colors.backgroundAlt,
        borderRadius: theme.borders.radius - 2,
        padding: "10px 14px",
        marginTop: 10,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.6,
          color: theme.colors.text,
        }}
      >
        {text}
      </p>
    </div>
  );
}

defineComponent({
  type: "result-box",
  label: "Encadré résultat",
  icon: "CheckSquare",
  category: "content",
  description: "Encadré de résumé ou de résultat",
  schema,
  acceptsChildren: false,
  render: ResultBox,
});
