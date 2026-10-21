import type {
  BorderValue,
  ImageValue,
  PropType,
  PropTypeValues,
  PropValue,
  PropValues,
  SpacingValue,
} from "../types/component";
import { BORDER_STYLES } from "../types/component";

/*
 * Gardes de type pour les valeurs de props venues du JSON (templates, documents, presets) ou de
 * bibliothèques non typées : elles remplacent les conversions forcées par une vérification réelle.
 * C'est le seul endroit où `unknown` a sa place : une garde doit accepter n'importe quelle valeur
 * pour pouvoir la vérifier.
 */

function isRecord(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumberField(record: { [key: string]: unknown }, key: string): boolean {
  return typeof record[key] === "number";
}

export function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function isSpacingValue(value: unknown): value is SpacingValue {
  return isRecord(value) && ["top", "right", "bottom", "left"].every((key) => isNumberField(value, key));
}

export function isBorderValue(value: unknown): value is BorderValue {
  return (
    isRecord(value) &&
    BORDER_STYLES.some((style) => style === value["style"]) &&
    isNumberField(value, "width") &&
    isNumberField(value, "radius") &&
    typeof value["color"] === "string"
  );
}

export function isImageValue(value: unknown): value is ImageValue {
  return (
    isRecord(value) && (value["type"] === "url" || value["type"] === "base64") && typeof value["value"] === "string"
  );
}

/** La valeur a-t-elle la forme attendue par ce type de prop ? */
export function isValueOfType<T extends PropType>(type: T, value: unknown): value is PropTypeValues[T] {
  switch (type) {
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "list":
      return isStringList(value);
    case "spacing":
      return isSpacingValue(value);
    case "border":
      return isBorderValue(value);
    case "image":
      return isImageValue(value);
    default:
      return typeof value === "string";
  }
}

/** Valeur acceptée pour une prop, quel que soit son type */
export function isPropValue(value: unknown): value is PropValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    isStringList(value) ||
    isSpacingValue(value) ||
    isBorderValue(value) ||
    isImageValue(value)
  );
}

/** Valeur « vide » de chaque type : ce que montre un éditeur quand rien n'est défini */
export const EMPTY_VALUES: PropTypeValues = {
  text: "",
  textarea: "",
  richtext: "",
  color: "",
  select: "",
  number: 0,
  boolean: false,
  list: [],
  emoji: "",
  spacing: { top: 0, right: 0, bottom: 0, left: 0 },
  font: "",
  border: { style: "solid", width: 1, color: "#000000", radius: 0 },
  image: { type: "url", value: "" },
  icon: "",
};

/** Props ou données d'un document : un objet dont chaque valeur est une PropValue */
export function isPropValues(value: unknown): value is PropValues {
  return isRecord(value) && Object.values(value).every(isPropValue);
}

/** La valeur fournie si elle a le type attendu, sinon la valeur de repli */
export function valueOf<T extends PropType>(
  type: T,
  value: PropValue | undefined,
  fallback: PropTypeValues[T],
): PropTypeValues[T] {
  return isValueOfType(type, value) ? value : fallback;
}

/**
 * Valeur à montrer dans l'éditeur d'un type : la valeur saisie, sinon la valeur par défaut,
 * sinon la valeur vide du type, chacune n'étant retenue que si elle a la bonne forme.
 */
export function editorValue<T extends PropType>(
  type: T,
  value: PropValue | undefined,
  defaultValue: PropValue | undefined,
): PropTypeValues[T] {
  return valueOf(type, value, valueOf(type, defaultValue, EMPTY_VALUES[type]));
}
