import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([{ key: "opacity", label: "Opacité", type: "number", defaultValue: 0.08 }]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function Watermark({ theme, opacity }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <span
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: theme.colors.primary,
          opacity,
          transform: "rotate(-30deg)",
          userSelect: "none",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        CONFIDENTIEL
      </span>
    </div>
  );
}

defineComponent({
  type: "watermark",
  label: "Filigrane",
  icon: "Stamp",
  category: "decoration",
  description: "Filigrane CONFIDENTIEL en arrière-plan",
  schema,
  acceptsChildren: false,
  render: Watermark,
});
