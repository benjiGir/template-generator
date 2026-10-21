import { Fragment } from "react";
import type { TemplatePage, Theme, PageFormat } from "@template-generator/shared/types/template";
import { EditorRenderer } from "./EditorRenderer";
import { DropZone } from "./DropZone";
import { DocumentPage } from "@/components/document-view/DocumentPage";
import { useEditorStore } from "@/store/editor-store";
import { useDropTarget } from "@/hooks/useDragAndDrop";

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
  const hoverNode = useEditorStore((s) => s.hoverNode);
  const isActivePage = selectedPageIndex === pageIndex;
  const { drop } = useDropTarget();
  const isDropTarget = drop !== null && drop.parentId === null && drop.pageIndex === pageIndex;

  return (
    <div data-page-wrapper style={{ marginBottom: 24 }} onMouseOver={() => hoverNode(null)}>
      {/* Onglet */}
      <button
        data-page-tab
        onClick={() => {
          selectPage(pageIndex);
          selectNode(null);
        }}
        style={{
          display: "inline-block",
          marginBottom: 4,
          padding: "3px 10px",
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: isActivePage ? "#2448C8" : "#DDD8CE",
          color: isActivePage ? "#fff" : "#6E6A62",
          border: "none",
          borderRadius: "4px 4px 0 0",
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {page.label ?? `Page ${pageIndex + 1}`}
      </button>

      {/* Page */}
      <DocumentPage
        theme={theme}
        format={pageFormat}
        chromeStyle={{
          outline: isDropTarget ? "2px dashed #2448C8" : isActivePage ? "2px solid #C9D3F6" : "none",
          outlineOffset: 2,
        }}
        onClick={() => {
          selectPage(pageIndex);
          selectNode(null);
        }}
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
              color: "#C9C3B7",
              fontSize: 13,
              fontFamily: "system-ui, sans-serif",
              pointerEvents: "none",
            }}
          >
            Page vide — glissez des composants ici
          </div>
        )}
      </DocumentPage>
    </div>
  );
}
