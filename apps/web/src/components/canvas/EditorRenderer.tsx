import { Fragment } from "react";
import { get } from "@template-generator/component-registry/registry";
import type { ComponentNode, Theme } from "@template-generator/shared/types/template";
import { useEditorStore } from "@/store/editor-store";
import { SelectableWrapper } from "./SelectableWrapper";
import { DropZone } from "./DropZone";
import { InlineEditor } from "@/components/inspector/InlineEditor";
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
        border: isOver ? "2px solid #2563EB" : (isEmpty || isDragging) ? "1.5px dashed #CBD5E1" : "none",
        borderRadius: 4,
        backgroundColor: isOver ? "#EFF6FF" : "transparent",
        transition: "all 0.15s ease",
        fontSize: 11,
        color: "#94A3B8",
      }}
    >
      {isEmpty && !isDragging && "Glissez des composants ici"}
      {isOver && (
        <div style={{ width: "100%", height: 2, backgroundColor: "#2563EB", borderRadius: 1, position: "absolute" }} />
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
            color: "#DC2626",
            fontFamily: "monospace",
          }}
        >
          Composant inconnu : {node.type}
        </div>
      </SelectableWrapper>
    );
  }

  const Component = definition.render;
  const mergedProps = { ...definition.defaultProps, ...node.props, theme };

  if (!definition.acceptsChildren) {
    const isInlineEditing = inlineEditingNodeId === node.id && !!inlineEditingPropKey;
    return (
      <SelectableWrapper nodeId={node.id} nodeType={node.type} pageIndex={pageIndex}>
        <div style={{ position: "relative" }}>
          <Component {...mergedProps} />
          {isInlineEditing && (
            <InlineEditor
              nodeId={node.id}
              propKey={inlineEditingPropKey!}
              value={String(node.props[inlineEditingPropKey!] ?? "")}
            />
          )}
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
        <GridDropZone pageIndex={pageIndex} parentId={node.id} index={children.length} isEmpty={children.length === 0} />
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
      <Component {...mergedProps}>{innerContent}</Component>
    </SelectableWrapper>
  );
}
