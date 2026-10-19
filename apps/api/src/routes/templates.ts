import { Hono } from "hono";
import { db } from "../db/connection";
import { templates } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { pick } from "../utils/pick";
import { buildPublishedVersion } from "@template-generator/shared/utils/fields";
import type { EditableField, Template } from "@template-generator/shared/types/template";

const router = new Hono();

type TemplateInsert = typeof templates.$inferInsert;
const WRITABLE_FIELDS = ["name", "description", "theme", "pageFormat", "pages", "editableFields", "tags"] as const;

// Noms qualifiés explicitement : dans une sous-requête, drizzle ne préfixe pas les colonnes
const documentCount = sql<number>`(select count(*)::int from "documents" where "documents"."template_id" = "templates"."id")`;

/** Première page de travail, pour les miniatures de l'Atelier */
const workingPreview = sql<unknown>`jsonb_build_object(
  'theme', "templates"."theme",
  'pageFormat', "templates"."page_format",
  'pages', jsonb_path_query_array("templates"."pages", '$[0]')
)`;

/** Première page de la version publiée, pour le Studio */
const publishedPreview = sql<unknown>`case when "templates"."published_version" is null then null else jsonb_build_object(
  'theme', "templates"."published_version" -> 'theme',
  'pageFormat', "templates"."published_version" -> 'pageFormat',
  'pages', jsonb_path_query_array("templates"."published_version" -> 'pages', '$[0]')
) end`;

router.get("/", async (c) => {
  const publishedFilter = c.req.query("published");
  const studio = publishedFilter === "true";
  let query = db
    .select({
      id:             templates.id,
      name:           templates.name,
      description:    templates.description,
      published:      templates.published,
      publishedAt:    templates.publishedAt,
      // Le Studio voit les champs de la version publiée, l'Atelier ceux de l'état de travail
      editableFields: studio
        ? sql<unknown>`coalesce("templates"."published_version" -> 'editableFields', "templates"."editable_fields")`
        : templates.editableFields,
      preview:        studio ? publishedPreview : workingPreview,
      documentCount,
      createdAt:      templates.createdAt,
      updatedAt:      templates.updatedAt,
    })
    .from(templates)
    .$dynamic();
  if (studio) {
    query = query.where(eq(templates.published, true));
  }
  const result = await query.orderBy(desc(templates.updatedAt));
  return c.json(result);
});

router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [result] = await db.select().from(templates).where(eq(templates.id, id));
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.post("/", async (c) => {
  const body = pick<TemplateInsert>(await c.req.json(), WRITABLE_FIELDS);
  const [result] = await db
    .insert(templates)
    .values({ ...body, published: false } as TemplateInsert)
    .returning();
  return c.json(result, 201);
});

router.post("/:id/duplicate", async (c) => {
  const id = c.req.param("id");
  const [source] = await db.select().from(templates).where(eq(templates.id, id));
  if (!source) return c.json({ error: "Not found" }, 404);
  const [result] = await db
    .insert(templates)
    .values({
      name:           `${source.name} (copie)`,
      description:    source.description,
      theme:          source.theme,
      pageFormat:     source.pageFormat,
      pages:          source.pages,
      editableFields: source.editableFields,
      tags:           source.tags,
      published:      false,
    })
    .returning();
  return c.json(result, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = pick<TemplateInsert>(await c.req.json(), WRITABLE_FIELDS);
  const [result] = await db
    .update(templates)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(templates.id, id))
    .returning();
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

/** Publie l'état courant : fige une version que le Studio utilisera pour créer les documents */
router.put("/:id/publish", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ editableFields?: EditableField[] }>();
  const [existing] = await db.select().from(templates).where(eq(templates.id, id));
  if (!existing) return c.json({ error: "Not found" }, 404);

  const editableFields = body.editableFields ?? existing.editableFields;
  const now = new Date();
  const [result] = await db
    .update(templates)
    .set({
      published:        true,
      editableFields,
      publishedVersion: buildPublishedVersion({ ...(existing as unknown as Template), editableFields }),
      publishedAt:      now,
      updatedAt:        now,
    })
    .where(eq(templates.id, id))
    .returning();
  return c.json(result);
});

/** Les documents gardent leur snapshot : ils sont détachés, pas supprimés */
router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db.delete(templates).where(eq(templates.id, id)).returning({ id: templates.id });
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});

export default router;
