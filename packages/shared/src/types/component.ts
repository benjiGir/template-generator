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
  | "emoji"
  | "spacing"
  | "font"
  | "border"
  | "image"
  | "icon";

export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BorderValue {
  style: "none" | "solid" | "dashed" | "dotted";
  width: number;
  color: string;
  radius: number;
}

export interface ImageValue {
  type: "url" | "base64";
  value: string;
}

/** Définition d'une prop éditable */
export interface PropSchema {
  key: string;
  label: string;
  type: PropType;
  defaultValue: unknown;
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  group?: string;
  condition?: {
    prop: string;
    value: unknown;
  };
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