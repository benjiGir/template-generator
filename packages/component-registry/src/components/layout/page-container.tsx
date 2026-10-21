import type { ReactNode } from "react";
import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([]);

type Props = PropsOf<typeof schema> & { theme: Theme; children?: ReactNode };

/** Dimensions A4 fixes : ce conteneur ne reçoit pas le format de page du template */
function PageContainer({ theme, children }: Props) {
  return (
    <div
      data-doc-page
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "28px 36px 32px",
        backgroundColor: theme.colors.background,
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.baseFontSize,
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

defineComponent({
  type: "page-container",
  label: "Page",
  icon: "FileText",
  category: "layout",
  description: "Conteneur principal d'une page A4",
  schema,
  acceptsChildren: true,
  render: PageContainer,
});
