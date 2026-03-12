/** Catégories de composants dans la bibliothèque */
export type ComponentCategory = "layout" | "content" | "data" | "decoration";

/** Types de props supportés par l'éditeur */
export type PropType =
  | "text"
  | "textarea"
  | "richtext"
  | "color"
  | "select"
  | "number"
  | "boolean"
  | "list"
  | "emoji";

/** Définition d'une prop éditable */
export interface PropSchema {
  key: string;
  label: string;
  type: PropType;
  defaultValue: unknown;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

/** Définition d'un composant dans le registre */
export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  category: ComponentCategory;
  description: string;
  schema: PropSchema[];
  acceptsChildren: boolean;
  childrenLayout?: "vertical" | "horizontal";
  allowedChildren?: string[];
  maxChildren?: number;
  defaultProps: Record<string, unknown>;
}