import { get } from "./registry";
import type { ComponentNode, Theme } from "@template-generator/shared/types/template";

interface Props {
  node: ComponentNode;
  theme: Theme;
  isEditor?: boolean;
}

export function ComponentRenderer({ node, theme, isEditor }: Props) {
  const definition = get(node.type);

  if (!definition) {
    return (
      <div style={{ color: "red", padding: 8, fontSize: 12 }}>
        Composant inconnu : {node.type}
      </div>
    );
  }

  const Component = definition.render;
  const mergedProps = { ...definition.defaultProps, ...node.props, theme };

  if (definition.acceptsChildren && node.children) {
    return (
      <Component {...mergedProps}>
        {node.children.map((child) => (
          <ComponentRenderer key={child.id} node={child} theme={theme} isEditor={isEditor} />
        ))}
      </Component>
    );
  }

  return <Component {...mergedProps} />;
}