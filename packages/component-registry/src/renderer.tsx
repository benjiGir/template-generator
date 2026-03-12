import { get } from "./registry";
import type { ComponentNode, Theme } from "@template-generator/shared/types/template";

interface Props {
  node: ComponentNode;
  theme: Theme;
  isEditor?: boolean;
}

function resolveThemeVars(props: Record<string, unknown>, theme: Theme): Record<string, unknown> {
  const resolved = { ...props };
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string" && value.startsWith("theme.")) {
      const path = value.slice(6) as keyof typeof theme.colors;
      resolved[key] = theme.colors[path] ?? value;
    }
  }
  return resolved;
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
  const mergedProps = { ...definition.defaultProps, ...resolveThemeVars(node.props, theme), theme };

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
