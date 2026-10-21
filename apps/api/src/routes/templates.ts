import { Hono } from "hono";
import { desc, eq, sql } from "drizzle-orm";
import { buildPublishedVersion } from "@template-generator/shared/utils/fields";
import type { EditableField, PagePreview } from "@template-generator/shared/types/template";
import { db } from "../db/connection";
import { templates } from "../db/schema";
import { idParam, templateCreate, templateListQuery, templatePublish, templateUpdate } from "../schemas";
import { validate } from "../validation";

const NOT_FOUND = { error: "Template introuvable" };

// Noms qualifiés explicitement : dans une sous-requête, drizzle ne préfixe pas les colonnes
const documentCount = sql<number>`(select count(*)::int from "documents" where "documents"."template_id" = "templates"."id")`;

/** Première page de travail, pour les miniatures de l'Atelier */
const workingPreview = sql<PagePreview>`jsonb_build_object(
  'theme', "templates"."theme",
  'pageFormat', "templates"."page_format",
  'pages', jsonb_path_query_array("templates"."pages", '$[0]')
)`;

/** Première page de la version publiée, pour le Studio */
const publishedPreview = sql<PagePreview | null>`case when "templates"."published_version" is null then null else jsonb_build_object(
  'theme', "templates"."published_version" -> 'theme',
  'pageFormat', "templates"."published_version" -> 'pageFormat',
  'pages', jsonb_path_query_array("templates"."published_version" -> 'pages', '$[0]')
) end`;

/** Le Studio voit les champs de la version publiée, l'Atelier ceux de l'état de travail */
const publishedFields = sql<
  EditableField[]
>`coalesce("templates"."published_version" -> 'editableFields', "templates"."editable_fields")`;

const router = new Hono()
  .get("/", validate("query", templateListQuery), async (c) => {
    const studio = c.req.valid("query").published === "true";
    let query = db
      .select({
        id: templates.id,
        name: templates.name,
        description: templates.description,
        published: templates.published,
        publishedAt: templates.publishedAt,
        editableFields: studio ? publishedFields : templates.editableFields,
        preview: studio ? publishedPreview : workingPreview,
        documentCount,
        createdAt: templates.createdAt,
        updatedAt: templates.updatedAt,
      })
      .from(templates)
      .$dynamic();
    if (studio) query = query.where(eq(templates.published, true));
    const result = await query.orderBy(desc(templates.updatedAt));
    return c.json(result, 200);
  })

  .get("/:id", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [result] = await db.select().from(templates).where(eq(templates.id, id));
    if (!result) return c.json(NOT_FOUND, 404);
    return c.json(result, 200);
  })

  .post("/", validate("json", templateCreate), async (c) => {
    const [result] = await db
      .insert(templates)
      .values({ ...c.req.valid("json"), published: false })
      .returning();
    if (!result) throw new Error("L'insertion n'a renvoyé aucune ligne");
    return c.json(result, 201);
  })

  .post("/:id/duplicate", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [source] = await db.select().from(templates).where(eq(templates.id, id));
    if (!source) return c.json(NOT_FOUND, 404);
    const [result] = await db
      .insert(templates)
      .values({
        name: `${source.name} (copie)`,
        description: source.description,
        theme: source.theme,
        pageFormat: source.pageFormat,
        pages: source.pages,
        editableFields: source.editableFields,
        tags: source.tags,
        published: false,
      })
      .returning();
    if (!result) throw new Error("L'insertion n'a renvoyé aucune ligne");
    return c.json(result, 201);
  })

  .put("/:id", validate("param", idParam), validate("json", templateUpdate), async (c) => {
    const { id } = c.req.valid("param");
    const [result] = await db
      .update(templates)
      .set({ ...c.req.valid("json"), updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    if (!result) return c.json(NOT_FOUND, 404);
    return c.json(result, 200);
  })

  /** Publie l'état courant : fige une version que le Studio utilisera pour créer les documents */
  .put("/:id/publish", validate("param", idParam), validate("json", templatePublish), async (c) => {
    const { id } = c.req.valid("param");
    const [existing] = await db.select().from(templates).where(eq(templates.id, id));
    if (!existing) return c.json(NOT_FOUND, 404);

    const editableFields = c.req.valid("json").editableFields ?? existing.editableFields;
    const now = new Date();
    const [result] = await db
      .update(templates)
      .set({
        published: true,
        editableFields,
        publishedVersion: buildPublishedVersion({ ...existing, editableFields }),
        publishedAt: now,
        updatedAt: now,
      })
      .where(eq(templates.id, id))
      .returning();
    // Supprimé entre-temps par une autre requête
    if (!result) return c.json(NOT_FOUND, 404);
    return c.json(result, 200);
  })

  /** Les documents gardent leur snapshot : ils sont détachés, pas supprimés */
  .delete("/:id", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [deleted] = await db.delete(templates).where(eq(templates.id, id)).returning({ id: templates.id });
    if (!deleted) return c.json(NOT_FOUND, 404);
    return c.json({ ok: true }, 200);
  });

export default router;
