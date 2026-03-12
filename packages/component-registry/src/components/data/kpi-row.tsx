import type { ReactNode } from "react";
import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  sectionTitle?: string;
  children?: ReactNode;
}

function KpiRow({ theme, sectionTitle, children }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      {sectionTitle && (
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: theme.colors.textLight,
          }}
        >
          {sectionTitle}
        </p>
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>{children}</div>
    </div>
  );
}

register({
  type: "kpi-row",
  label: "Ligne de KPIs",
  icon: "LayoutGrid",
  category: "data",
  description: "Rangée de cartes KPI (max 4)",
  schema: [
    { key: "sectionTitle", label: "Titre de section", type: "text", defaultValue: "" },
  ],
  acceptsChildren: true,
  childrenLayout: "horizontal",
  allowedChildren: ["kpi-card"],
  maxChildren: 4,
  defaultProps: { sectionTitle: "" },
  render: KpiRow as RegisteredComponent["render"],
});
