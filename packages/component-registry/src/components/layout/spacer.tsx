import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([{ key: "height", label: "Hauteur (px)", type: "number", defaultValue: 24 }]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function Spacer({ height }: Props) {
  return <div style={{ height }} />;
}

defineComponent({
  type: "spacer",
  label: "Espacement",
  icon: "ArrowUpDown",
  category: "layout",
  description: "Espace vertical entre les composants",
  schema,
  acceptsChildren: false,
  render: Spacer,
});
