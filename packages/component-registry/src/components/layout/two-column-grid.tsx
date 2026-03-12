import type { ReactNode } from "react";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  gap?: number;
  children?: ReactNode;
}

function TwoColumnGrid({ gap = 16, children }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

register({
  type: "two-column-grid",
  label: "Grille 2 colonnes",
  icon: "Columns2",
  category: "layout",
  description: "Disposition en 2 colonnes égales",
  schema: [
    { key: "gap", label: "Espacement (px)", type: "number", defaultValue: 16 },
  ],
  acceptsChildren: true,
  defaultProps: { gap: 16 },
  render: TwoColumnGrid as RegisteredComponent["render"],
});
