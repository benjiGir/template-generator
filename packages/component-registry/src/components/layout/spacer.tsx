import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  height?: number;
}

function Spacer({ height = 24 }: Props) {
  return <div style={{ height }} />;
}

register({
  type: "spacer",
  label: "Espacement",
  icon: "ArrowUpDown",
  category: "layout",
  description: "Espace vertical entre les composants",
  schema: [
    { key: "height", label: "Hauteur (px)", type: "number", defaultValue: 24 },
  ],
  acceptsChildren: false,
  defaultProps: { height: 24 },
  render: Spacer as RegisteredComponent["render"],
});
