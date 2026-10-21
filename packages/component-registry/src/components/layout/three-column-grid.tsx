import type { Theme } from "@template-generator/shared/types/template";
import type { ReactNode } from "react";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([{ key: "gap", label: "Espacement (px)", type: "number", defaultValue: 16 }]);

type Props = PropsOf<typeof schema> & { theme: Theme; children?: ReactNode };

function ThreeColumnGrid({ gap, children }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

defineComponent({
  type: "three-column-grid",
  label: "Grille 3 colonnes",
  icon: "Columns3",
  category: "layout",
  description: "Disposition en 3 colonnes égales",
  schema,
  acceptsChildren: true,
  render: ThreeColumnGrid,
});
