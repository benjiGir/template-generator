import { Fragment } from "react";
import { get } from "@template-generator/component-registry/registry";
import { resolveThemeVars } from "@template-generator/component-registry/renderer";
import type { ComponentNode, Theme } from "@template-generator/shared/types/template";
import { useEditorStore } from "@/store/editor-store";
import { SelectableWrapper } from "./SelectableWrapper";
import { DropZone } from "./DropZone";
import { InlineEditor, InlineTextEditor } from "@/components/inspector/InlineEditor";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import type { DropZoneData } from "@/hooks/useDragAndDrop";

interface GridDropZoneProps {
  pageIndex: number;
  parentId: string;
  index: number;
  isEmpty: boolean;
}

function GridDropZone({ pageIndex, parentId, index, isEmpty }: GridDropZoneProps) {
  const id = `dropzone-${pageIndex}-${parentId}-${index}`;
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "dropzone", pageIndex, parentId, index } satisfies DropZoneData,
  });
  const { active } = useDndContext();
  const isDragging = active !== null;

  return (
    <div
      ref={setNodeRef}
      style={{
        gridColumn: "1 / -1",
        minHeight: isEmpty ? 48 : isDragging ? (isOver ? 32 : 24) : 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: isOver ? "2px solid #2448C8" : isEmpty || isDragging ? "1.5px dashed #C9C3B7" : "none",
        borderRadius: 4,
        backgroundColor: isOver ? "#EEF1FC" : "transparent",
        transition: "all 0.15s ease",
        fontSize: 11,
        color: "#6E6A62",
      }}
    >
      {isEmpty && !isDragging && "Glissez des composants ici"}
      {isOver && (
        <div style={{ width: "100%", height: 2, backgroundColor: "#2448C8", borderRadius: 1, position: "absolute" }} />
      )}
    </div>
  );
}

interface Props {
  node: ComponentNode;
  theme: Theme;
  pageIndex: number;
}

export function EditorRenderer({ node, theme, pageIndex }: Props) {
  const definition = get(node.type);
  const inlineEditingNodeId = useEditorStore((s) => s.inlineEditingNodeId);
  const inlineEditingPropKey = useEditorStore((s) => s.inlineEditingPropKey);

  if (!definition) {
    return (
      <SelectableWrapper nodeId={node.id} nodeType={node.type} pageIndex={pageIndex}>
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: 4,
            fontSize: 12,
            color: "#9E1B32",
            fontFamily: "monospace",
          }}
        >
          Composant inconnu : {node.type}
        </div>
      </SelectableWrapper>
    );
  }

  const Component = definition.render;
  const values = resolveThemeVars(node.props, theme);

  if (!definition.acceptsChildren) {
    // Clé de la prop éditée sur place dans ce composant, s'il y en a une
    const editedKey = inlineEditingNodeId === node.id ? inlineEditingPropKey : null;
    const editedValue = editedKey ? String(node.props[editedKey] ?? "") : "";
    return (
      <SelectableWrapper nodeId={node.id} nodeType={node.type} pageIndex={pageIndex}>
        <div style={{ position: "relative" }}>
          <Component values={values} theme={theme} />
          {editedKey &&
            (definition.schema.find((p) => p.key === editedKey)?.type === "text" ? (
              <InlineTextEditor nodeId={node.id} propKey={editedKey} value={editedValue} />
            ) : (
              <InlineEditor nodeId={node.id} propKey={editedKey} value={editedValue} />
            ))}
        </div>
      </SelectableWrapper>
    );
  }

  const children = node.children ?? [];
  const isHorizontal = definition.childrenLayout === "horizontal";
  const isGrid = definition.type.includes("grid");

  let innerContent;

  if (isHorizontal) {
    innerContent = (
      <>
        <DropZone pageIndex={pageIndex} parentId={node.id} index={0} direction="horizontal" />
        {children.map((child, i) => (
          <Fragment key={child.id}>
            <EditorRenderer node={child} theme={theme} pageIndex={pageIndex} />
            <DropZone pageIndex={pageIndex} parentId={node.id} index={i + 1} direction="horizontal" />
          </Fragment>
        ))}
      </>
    );
  } else if (isGrid) {
    // Grilles : enfants dans leurs cellules + une DropZone span-all en bas
    // (Les DropZones entre cellules casseraient l'auto-placement CSS grid)
    innerContent = (
      <>
        {children.map((child) => (
          <EditorRenderer key={child.id} node={child} theme={theme} pageIndex={pageIndex} />
        ))}
        <GridDropZone
          pageIndex={pageIndex}
          parentId={node.id}
          index={children.length}
          isEmpty={children.length === 0}
        />
      </>
    );
  } else {
    innerContent = (
      <>
        <DropZone pageIndex={pageIndex} parentId={node.id} index={0} />
        {children.map((child, i) => (
          <Fragment key={child.id}>
            <EditorRenderer node={child} theme={theme} pageIndex={pageIndex} />
            <DropZone pageIndex={pageIndex} parentId={node.id} index={i + 1} />
          </Fragment>
        ))}
      </>
    );
  }

  return (
    <SelectableWrapper nodeId={node.id} nodeType={node.type} pageIndex={pageIndex}>
      <Component values={values} theme={theme}>
        {innerContent}
      </Component>
    </SelectableWrapper>
  );
}
