import { z } from "zod";
import { BORDER_STYLES, COMPONENT_CATEGORIES, PROP_TYPES } from "@template-generator/shared/types/component";
import type { BorderValue, ImageValue, PropValue, SpacingValue } from "@template-generator/shared/types/component";
import type {
  ComponentNode,
  EditableField,
  PageFormat,
  TemplatePage,
  Theme,
} from "@template-generator/shared/types/template";

/*
 * Schémas des requêtes acceptées par l'API. Les types partagés restent la référence :
 * chaque schéma qui décrit un type partagé le vérifie avec `satisfies`, une divergence
 * ne compile donc pas.
 */

// Messages d'erreur de validation en français
z.config(z.locales.fr());

// ─── Briques ──────────────────────────────────────────────────────────────────

/** Identifiant de ressource dans l'URL */
export const idParam = z.object({ id: z.guid("Identifiant invalide") });

const themeColors = z.object({
  primary: z.string(),
  primaryLight: z.string(),
  accent: z.string(),
  accentLight: z.string(),
  success: z.string(),
  successLight: z.string(),
  warning: z.string(),
  warningLight: z.string(),
  danger: z.string(),
  dangerLight: z.string(),
  text: z.string(),
  textLight: z.string(),
  textMuted: z.string(),
  background: z.string(),
  backgroundAlt: z.string(),
  border: z.string(),
  borderLight: z.string(),
});

const theme = z.object({
  name: z.string(),
  colors: themeColors,
  typography: z.object({
    fontFamily: z.string(),
    headingFontFamily: z.string(),
    baseFontSize: z.number(),
    lineHeight: z.number(),
    headingSizes: z.object({ h1: z.number(), h2: z.number(), h3: z.number() }),
    fontWeights: z.object({
      normal: z.number(),
      medium: z.number(),
      semibold: z.number(),
      bold: z.number(),
      extrabold: z.number(),
    }),
  }),
  spacing: z.object({
    unit: z.number(),
    pagePadding: z.string(),
    sectionGap: z.number(),
    componentGap: z.number(),
  }),
  borders: z.object({ radius: z.number(), radiusLg: z.number(), width: z.number() }),
}) satisfies z.ZodType<Theme>;

// Valeur d'une prop de composant (et d'un champ de document) : une des formes de PropValue
const spacingValue = z.object({
  top: z.number(),
  right: z.number(),
  bottom: z.number(),
  left: z.number(),
}) satisfies z.ZodType<SpacingValue>;

const borderValue = z.object({
  style: z.enum(BORDER_STYLES),
  width: z.number(),
  color: z.string(),
  radius: z.number(),
}) satisfies z.ZodType<BorderValue>;

const imageValue = z.object({
  type: z.enum(["url", "base64"]),
  value: z.string(),
}) satisfies z.ZodType<ImageValue>;

const propValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  spacingValue,
  borderValue,
  imageValue,
]) satisfies z.ZodType<PropValue>;

const propValues = z.record(z.string(), propValue);

const pageFormat = z.object({
  width: z.string(),
  height: z.string(),
  padding: z.string(),
}) satisfies z.ZodType<PageFormat>;

const componentNode: z.ZodType<ComponentNode> = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: propValues,
  get children() {
    return z.array(componentNode).optional();
  },
});

const templatePage = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  format: pageFormat.optional(),
  children: z.array(componentNode),
}) satisfies z.ZodType<TemplatePage>;

const editableField = z.object({
  nodeId: z.string().min(1),
  propKey: z.string().min(1),
  label: z.string(),
  type: z.enum(PROP_TYPES),
  defaultValue: propValue,
  required: z.boolean(),
  group: z.string().optional(),
  order: z.number().int().min(0),
}) satisfies z.ZodType<EditableField>;

const name = z.string().trim().max(200);
const description = z.string().max(2000).nullable();

// ─── Templates ────────────────────────────────────────────────────────────────

export const templateListQuery = z.object({
  /** "true" : seulement les templates publiés, avec leur version publiée (Studio) */
  published: z.enum(["true", "false"]).optional(),
});

/** Le nom peut être vide pendant l'édition : la publication le signale */
export const templateCreate = z.object({
  name: z.string().max(200),
  description: description.optional(),
  theme,
  pageFormat,
  pages: z.array(templatePage),
  editableFields: z.array(editableField),
  tags: z.array(z.string()),
});

export const templateUpdate = templateCreate.partial();

export const templatePublish = z.object({
  editableFields: z.array(editableField).optional(),
});

// ─── Documents ────────────────────────────────────────────────────────────────

export const documentCreate = z.object({
  templateId: z.guid("Identifiant de template invalide"),
  name: name.optional(),
});

export const documentRename = z.object({
  name: name.min(1, "Le nom est obligatoire"),
});

export const documentData = z.object({
  data: propValues,
});

// ─── Presets ──────────────────────────────────────────────────────────────────

export const presetCreate = z.object({
  baseType: z.string().min(1),
  label: name.min(1, "Le nom est obligatoire"),
  description: description.optional(),
  defaultProps: propValues,
  category: z.enum(COMPONENT_CATEGORIES).nullable().optional(),
});

export const presetUpdate = presetCreate.partial();

// ─── Thèmes ───────────────────────────────────────────────────────────────────

export const themeCreate = z.object({
  name: name.min(1, "Le nom est obligatoire"),
  theme,
});

export const themeUpdate = themeCreate.partial();
