import { get } from "./registry";
import type { PropValues } from "@template-generator/shared/types/component";
import type { ComponentNode, Theme } from "@template-generator/shared/types/template";

interface Props {
  node: ComponentNode;
  theme: Theme;
}

/** Couleur du thème désignée par une référence `theme.<couleur>`, sinon undefined */
export function themeColor(theme: Theme, reference: string): string | undefined {
  if (!reference.startsWith("theme.")) return undefined;
  return new Map(Object.entries(theme.colors)).get(reference.slice("theme.".length));
}

/** Remplace les références `theme.<couleur>` des props par la valeur du thème */
export function resolveThemeVars(props: PropValues, theme: Theme): PropValues {
  const resolved = { ...props };
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string") resolved[key] = themeColor(theme, value) ?? value;
  }
  return resolved;
}

export function ComponentRenderer({ node, theme }: Props) {
  const definition = get(node.type);

  if (!definition) {
    return <div style={{ color: "red", padding: 8, fontSize: 12 }}>Composant inconnu : {node.type}</div>;
  }

  const Component = definition.render;
  const values = resolveThemeVars(node.props, theme);

  if (definition.acceptsChildren && node.children) {
    return (
      <Component values={values} theme={theme}>
        {node.children.map((child) => (
          <ComponentRenderer key={child.id} node={child} theme={theme} />
        ))}
      </Component>
    );
  }

  return <Component values={values} theme={theme} />;
}
