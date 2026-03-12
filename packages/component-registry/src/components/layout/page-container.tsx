import type { ReactNode } from "react";
import type { Theme, PageFormat } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  pageFormat?: PageFormat;
  children?: ReactNode;
}

function PageContainer({ theme, pageFormat, children }: Props) {
  return (
    <div
      data-doc-page
      style={{
        width: pageFormat?.width ?? "210mm",
        minHeight: pageFormat?.height ?? "297mm",
        padding: pageFormat?.padding ?? "28px 36px 32px",
        backgroundColor: theme.colors.background,
        fontFamily: theme.fontFamily,
        fontSize: theme.baseFontSize,
        color: theme.colors.text,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

register({
  type: "page-container",
  label: "Page",
  icon: "FileText",
  category: "layout",
  description: "Conteneur principal d'une page A4",
  schema: [],
  acceptsChildren: true,
  defaultProps: {},
  render: PageContainer as RegisteredComponent["render"],
});