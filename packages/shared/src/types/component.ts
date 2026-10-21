/** Catégories de composants dans la bibliothèque (liste aussi utilisée pour valider les requêtes) */
export const COMPONENT_CATEGORIES = ["layout", "content", "data", "decoration"] as const;
export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

/** Types de props supportés par l'éditeur (liste aussi utilisée pour valider les requêtes) */
export const PROP_TYPES = [
  "text",
  "textarea",
  "richtext",
  "color",
  "select",
  "number",
  "boolean",
  "list",
  "emoji",
  "spacing",
  "font",
  "border",
  "image",
  "icon",
] as const;
export type PropType = (typeof PROP_TYPES)[number];

export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const BORDER_STYLES = ["none", "solid", "dashed", "dotted"] as const;

export interface BorderValue {
  style: (typeof BORDER_STYLES)[number];
  width: number;
  color: string;
  radius: number;
}

export interface ImageValue {
  type: "url" | "base64";
  value: string;
}

/** Valeur stockée pour chaque type de prop : c'est ce que contiennent les templates et les documents */
export interface PropTypeValues {
  text: string;
  textarea: string;
  richtext: string;
  color: string;
  select: string;
  number: number;
  boolean: boolean;
  list: string[];
  emoji: string;
  spacing: SpacingValue;
  font: string;
  border: BorderValue;
  image: ImageValue;
  icon: string;
}

/** Valeur d'une prop de composant, et donc d'un champ de document */
export type PropValue = PropTypeValues[PropType];

/** Props d'un composant, ou données saisies d'un document (clé « nœud.prop ») */
export type PropValues = Record<string, PropValue>;

/**
 * Rôle d'une prop de contenu (texte, liste, image) dans le document. La détection des champs remplissables
 * le lit pour pré-sélectionner, grouper et nommer les champs : elle ne connaît aucun composant par son nom.
 *  - content : contenu qui change à chaque édition (rôle par défaut) ; pré-sélectionné
 *  - heading : contenu qui change, et qui nomme le composant dans les libellés (titre d'un jalon) ; pré-sélectionné
 *  - name : nom stable du composant (titre d'un indicateur) ; nomme le composant, non pré-sélectionné
 *  - section : titre de section ; ouvre un groupe du formulaire, nomme le composant, non pré-sélectionné
 *  - structure : texte fixe (libellé, marque, texte alternatif) ; non pré-sélectionné
 */
export const PROP_ROLES = ["content", "heading", "name", "section", "structure"] as const;
export type PropRole = (typeof PROP_ROLES)[number];

interface PropSchemaBase<T extends PropType> {
  key: string;
  label: string;
  type: T;
  defaultValue: PropTypeValues[T];
  required?: boolean;
  options?: readonly { label: string; value: string }[];
  placeholder?: string;
  group?: string;
  /** Rôle dans le document, pour la détection des champs ; « content » si absent */
  role?: PropRole;
  /** La prop n'est proposée que si une autre prop a cette valeur */
  condition?: {
    prop: string;
    value: PropValue;
  };
}

/** Définition d'une prop éditable : sa valeur par défaut a le type qui correspond à son éditeur */
export type PropSchema = { [T in PropType]: PropSchemaBase<T> }[PropType];

/** Props qu'un composant reçoit, déduites de son schéma (toutes présentes : le défaut remplace l'absent) */
export type PropsOf<S extends readonly PropSchema[]> = {
  [P in S[number] as P["key"]]: PropTypeValues[P["type"]];
};

/** Définition d'un composant dans le registre */
export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  category: ComponentCategory;
  description: string;
  schema: readonly PropSchema[];
  acceptsChildren: boolean;
  childrenLayout?: "vertical" | "horizontal";
  allowedChildren?: string[];
  maxChildren?: number;
  /** Groupe du formulaire ouvert par le composant lui-même (« Pied de page ») */
  formGroup?: string;
  /** Valeurs par défaut, tirées du schéma */
  defaultProps: PropValues;
}
