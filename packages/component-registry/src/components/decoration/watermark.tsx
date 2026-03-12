import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  opacity?: number;
}

function Watermark({ theme, opacity = 0.08 }: Props) {
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

register({
  type: "watermark",
  label: "Filigrane",
  icon: "Stamp",
  category: "decoration",
  description: "Filigrane CONFIDENTIEL en arrière-plan",
  schema: [
    { key: "opacity", label: "Opacité", type: "number", defaultValue: 0.08 },
  ],
  acceptsChildren: false,
  defaultProps: { opacity: 0.08 },
  render: Watermark as RegisteredComponent["render"],
});
