import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { BUILTIN_THEMES } from "@template-generator/shared/themes/presets";
import { DEFAULT_PAGE_FORMAT, type Template } from "@template-generator/shared/types/template";
import { DOCUMENT_STATUSES } from "../db/schema";
import { documentData, presetCreate, templateCreate } from "../schemas";

/*
 * Jeux de données de démonstration (dossier data/<jeu>/) : un fichier JSON par template, les presets
 * et les documents. Chaque fichier est vérifié avec les schémas de l'API à la lecture : une faute de frappe
 * arrête le seed avec le fichier et le champ en cause, au lieu d'insérer des données illisibles.
 */

const DATA_DIR = join(import.meta.dirname, "data");

/** Jeu chargé par défaut */
export const DEFAULT_SEED_SET = "demo";

/** Jeux disponibles : les sous-dossiers de data/ */
export function seedSets(): string[] {
  return readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted();
}

function setDir(set: string): string {
  const dir = join(DATA_DIR, set);
  if (!existsSync(dir)) throw new Error(`Seed : jeu « ${set} » inconnu ; jeux disponibles : ${seedSets().join(", ")}`);
  return dir;
}

/** Ancienneté en jours (dates de création et de modification), pour des listes réalistes */
const daysAgo = z.number().int().min(0).max(365).optional();

const THEMES = new Map(BUILTIN_THEMES.map((theme) => [theme.name, theme]));

/** Template de démonstration : son thème est désigné par le nom d'un thème intégré */
const seedTemplate = templateCreate
  .omit({ theme: true, pageFormat: true, description: true })
  .extend({
    description: z.string().nullable(),
    theme: z.string().refine((name) => THEMES.has(name), {
      error: `Thème inconnu ; thèmes intégrés : ${[...THEMES.keys()].join(", ")}`,
    }),
    pageFormat: templateCreate.shape.pageFormat.optional(),
    published: z.boolean(),
    daysAgo,
  })
  .strict();

/** Document de démonstration : il désigne son template par son nom */
const seedDocument = z
  .object({
    template: z.string().min(1),
    name: z.string().min(1),
    status: z.enum(DOCUMENT_STATUSES),
    data: documentData.shape.data,
    daysAgo,
    /** Finalisé, puis modifié après l'export (« Modifié depuis l'export » dans le Studio) */
    modifiedAfterExport: z.boolean().optional(),
  })
  .strict();

function read<T>(file: string, schema: z.ZodType<T>): T {
  const result = schema.safeParse(JSON.parse(readFileSync(file, "utf8")));
  if (!result.success) throw new Error(`Seed : ${file} est invalide\n${z.prettifyError(result.error)}`);
  return result.data;
}

/** Contenu d'un template à insérer ; la version publiée est calculée à l'insertion */
export type SeedTemplate = Omit<Template, "id" | "createdAt" | "updatedAt" | "publishedAt" | "publishedVersion"> & {
  daysAgo?: number;
};

export function seedTemplates(set: string): SeedTemplate[] {
  const dir = join(setDir(set), "templates");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .toSorted()
    .map((file) => {
      const { theme, pageFormat, ...template } = read(join(dir, file), seedTemplate);
      const builtin = THEMES.get(theme);
      if (!builtin) throw new Error(`Seed : thème « ${theme} » introuvable`);
      return { ...template, theme: builtin, pageFormat: pageFormat ?? DEFAULT_PAGE_FORMAT };
    });
}

export function seedPresets(set: string) {
  return read(join(setDir(set), "presets.json"), z.array(presetCreate.strict()));
}

export function seedDocuments(set: string) {
  return read(join(setDir(set), "documents.json"), z.array(seedDocument));
}
