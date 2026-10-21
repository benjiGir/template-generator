import { createElement, type ComponentType, type ReactNode } from "react";
import type { ComponentDefinition, PropSchema, PropsOf, PropValues } from "@template-generator/shared/types/component";
import type { Theme } from "@template-generator/shared/types/template";
import { valueOf } from "@template-generator/shared/utils/prop-values";

/** Ce que reçoit le rendu d'un composant du registre : les valeurs brutes du nœud (JSON) et le thème */
export interface RenderProps {
  values: PropValues;
  theme: Theme;
  children?: ReactNode;
}

/** Composant React associé à une définition */
export interface RegisteredComponent extends ComponentDefinition {
  render: ComponentType<RenderProps>;
}

/** Ce que déclare un composant : son schéma, et un rendu qui reçoit des props déjà typées */
export interface ComponentSpec<S extends readonly PropSchema[]> extends Omit<
  ComponentDefinition,
  "schema" | "defaultProps"
> {
  schema: S;
  render: ComponentType<PropsOf<S> & { theme: Theme; children?: ReactNode }>;
}

/**
 * Déclare le schéma d'un composant en gardant ses clés et ses types exacts : `PropsOf<typeof schema>`
 * donne alors les props que le rendu reçoit.
 */
export function defineSchema<const S extends readonly PropSchema[]>(schema: S): S {
  return schema;
}

const registryMap = new Map<string, RegisteredComponent>();

/**
 * Lit les valeurs d'un nœud selon le schéma : chaque prop prend la valeur stockée si elle a le bon type,
 * sinon la valeur par défaut du schéma. Le composant reçoit ainsi toutes ses props, bien typées.
 */
function readProps<S extends readonly PropSchema[]>(schema: S, values: PropValues): PropsOf<S> {
  const props: PropValues = {};
  for (const prop of schema) props[prop.key] = valueOf(prop.type, values[prop.key], prop.defaultValue);
  // Seule conversion de type du projet : TypeScript ne suit pas un type indexé à travers une boucle.
  // Chaque valeur vient d'être vérifiée contre le type que le schéma déclare pour sa clé.
  // oxlint-disable-next-line typescript/consistent-type-assertions
  return props as PropsOf<S>;
}

/**
 * Déclare un composant. Ses props sont déduites de son schéma (`const` garde les clés exactes),
 * et ses valeurs par défaut aussi : le schéma est la seule source de vérité.
 */
export function defineComponent<const S extends readonly PropSchema[]>(spec: ComponentSpec<S>): void {
  const { render: Render, schema, ...definition } = spec;

  function RegisteredRender({ values, theme, children }: RenderProps) {
    return createElement(Render, { ...readProps(schema, values), theme }, children);
  }
  RegisteredRender.displayName = `Registered(${spec.type})`;

  registryMap.set(spec.type, {
    ...definition,
    schema,
    defaultProps: Object.fromEntries(schema.map((prop) => [prop.key, prop.defaultValue])),
    render: RegisteredRender,
  });
}

export function get(type: string): RegisteredComponent | undefined {
  return registryMap.get(type);
}

export function getAll(): RegisteredComponent[] {
  return Array.from(registryMap.values());
}
