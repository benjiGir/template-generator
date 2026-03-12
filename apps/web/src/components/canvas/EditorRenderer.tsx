import { Fragment } from "react";
import { get } from "@template-generator/component-registry/registry";
import type { ComponentNode, Theme } from "@template-generator/shared/types/template";
import { useEditorStore } from "@/store/editor-store";
import { SelectableWrapper } from "./SelectableWrapper";
import { DropZone } from "./DropZone";
import { InlineEditor } from "@/components/inspector/InlineEditor";

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
    // Grilles : pas de DropZone entre cellules pour ne pas perturber le grid layout
    innerContent = children.map((child) => (
      <EditorRenderer key={child.id} node={child} theme={theme} pageIndex={pageIndex} />
    ));
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
