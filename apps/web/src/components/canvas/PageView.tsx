import { Fragment } from "react";
import type { TemplatePage, Theme, PageFormat } from "@template-generator/shared/types/template";
import { EditorRenderer } from "./EditorRenderer";
import { DropZone } from "./DropZone";
import { useEditorStore } from "@/store/editor-store";

interface Props {
  page: TemplatePage;
  pageIndex: number;
  theme: Theme;
  pageFormat: PageFormat;
}

export function PageView({ page, pageIndex, theme, pageFormat }: Props) {
  const selectedPageIndex = useEditorStore((s) => s.selectedPageIndex);
  const selectPage = useEditorStore((s) => s.selectPage);
  const selectNode = useEditorStore((s) => s.selectNode);
  const isActivePage = selectedPageIndex === pageIndex;

  return (
    <div data-page-wrapper style={{ marginBottom: 24 }}>
      {/* Onglet */}
      <button
        data-page-tab
        onClick={() => { selectPage(pageIndex); selectNode(null); }}
        style={{
          display: "inline-block",
          marginBottom: 4,
          padding: "3px 10px",
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: isActivePage ? "#2563EB" : "#E5E7EB",
          color: isActivePage ? "#fff" : "#6B7280",
          border: "none",
          borderRadius: "4px 4px 0 0",
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {page.label ?? `Page ${pageIndex + 1}`}
      </button>

      {/* Page */}
      <div
        data-doc-page
        style={{
          width: pageFormat.width,
          minHeight: pageFormat.height,
          padding: pageFormat.padding,
          backgroundColor: theme.colors.background,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.baseFontSize,
          color: theme.colors.text,
          boxSizing: "border-box",
          position: "relative",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          borderRadius: 2,
          outline: isActivePage ? "2px solid #BFDBFE" : "none",
        }}
        onClick={() => { selectPage(pageIndex); selectNode(null); }}
      >
        {/* DropZones entre chaque composant racine */}
        <DropZone pageIndex={pageIndex} parentId={null} index={0} />
        {page.children.map((node, i) => (
          <Fragment key={node.id}>
            <EditorRenderer node={node} theme={theme} pageIndex={pageIndex} />
            <DropZone pageIndex={pageIndex} parentId={null} index={i + 1} />
          </Fragment>
        ))}

        {page.children.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D1D5DB",
              fontSize: 13,
              fontFamily: "system-ui, sans-serif",
              pointerEvents: "none",
            }}
          >
            Page vide — glissez des composants ici
          </div>
        )}
      </div>
    </div>
  );
}
