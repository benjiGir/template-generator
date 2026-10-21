import { z } from "zod";
import { COMPONENT_CATEGORIES, PROP_TYPES } from "@template-generator/shared/types/component";
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Thème : une quarantaine de réglages produits par l'éditeur. On vérifie qu'il s'agit d'un objet ;
 * sa forme détaillée est garantie par le type partagé côté client.
 */
const theme = z.custom<Theme>(isPlainObject, "Thème invalide");

const pageFormat = z.object({
  width: z.string(),
  height: z.string(),
  padding: z.string(),
}) satisfies z.ZodType<PageFormat>;

const componentNode: z.ZodType<ComponentNode> = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.string(), z.unknown()),
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
  defaultValue: z.unknown(),
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
  data: z.record(z.string(), z.unknown()),
});

// ─── Presets ──────────────────────────────────────────────────────────────────

export const presetCreate = z.object({
  baseType: z.string().min(1),
  label: name.min(1, "Le nom est obligatoire"),
  description: description.optional(),
  defaultProps: z.record(z.string(), z.unknown()),
  category: z.enum(COMPONENT_CATEGORIES).nullable().optional(),
});

export const presetUpdate = presetCreate.partial();

// ─── Thèmes ───────────────────────────────────────────────────────────────────

export const themeCreate = z.object({
  name: name.min(1, "Le nom est obligatoire"),
  theme,
});

export const themeUpdate = themeCreate.partial();
