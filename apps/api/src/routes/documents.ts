import { Hono } from "hono";
import { db } from "../db/connection";
import { documents, templates } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { buildDocumentSnapshot, computeCompletion } from "@template-generator/shared/utils/fields";
import type { Template } from "@template-generator/shared/types/template";

const router = new Hono();

function completionOf(snapshot: unknown, data: Record<string, unknown>): number {
  const fields = (snapshot as Template | null)?.editableFields ?? [];
  return computeCompletion(fields, data).percent;
}

router.get("/", async (c) => {
  const result = await db
    .select({
      id:                documents.id,
      templateId:        documents.templateId,
      templateName:      sql<string | null>`"documents"."template_snapshot" ->> 'name'`,
      // Première page du snapshot et données saisies : de quoi dessiner une miniature fidèle
      preview:           sql<unknown>`jsonb_build_object(
        'theme', "documents"."template_snapshot" -> 'theme',
        'pageFormat', "documents"."template_snapshot" -> 'pageFormat',
        'pages', jsonb_path_query_array("documents"."template_snapshot" -> 'pages', '$[0]'),
        'editableFields', "documents"."template_snapshot" -> 'editableFields'
      )`,
      data:              documents.data,
      name:              documents.name,
      status:            documents.status,
      completionPercent: documents.completionPercent,
      exportedAt:        documents.exportedAt,
      updatedAt:         documents.updatedAt,
      createdAt:         documents.createdAt,
    })
    .from(documents)
    .orderBy(desc(documents.updatedAt));
  return c.json(result);
});

router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [result] = await db.select().from(documents).where(eq(documents.id, id));
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

/** Crée un document à partir de la version publiée d'un template */
router.post("/", async (c) => {
  const body = await c.req.json<{ templateId: string; name?: string }>();
  const [template] = await db.select().from(templates).where(eq(templates.id, body.templateId));
  if (!template) return c.json({ error: "Template not found" }, 404);
  if (!template.published) return c.json({ error: "Template not published" }, 409);

  const snapshot = buildDocumentSnapshot(template as unknown as Template);
  const name = body.name?.trim() || `${snapshot.name} — ${new Date().toLocaleDateString("fr-FR")}`;
  const [result] = await db
    .insert(documents)
    .values({
      templateId:        template.id,
      name,
      data:              {},
      templateSnapshot:  snapshot,
      status:            "draft",
      completionPercent: completionOf(snapshot, {}),
    })
    .returning();
  return c.json(result, 201);
});

/** Duplique un document (le cas courant : repartir du mois précédent) */
router.post("/:id/duplicate", async (c) => {
  const id = c.req.param("id");
  const [source] = await db.select().from(documents).where(eq(documents.id, id));
  if (!source) return c.json({ error: "Not found" }, 404);
  const [result] = await db
    .insert(documents)
    .values({
      templateId:        source.templateId,
      name:              `${source.name} (copie)`,
      data:              source.data,
      templateSnapshot:  source.templateSnapshot,
      status:            "draft",
      completionPercent: source.completionPercent,
    })
    .returning();
  return c.json(result, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ name?: string }>();
  if (!body.name?.trim()) return c.json({ error: "Name required" }, 400);
  const [result] = await db
    .update(documents)
    .set({ name: body.name.trim(), updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

/** Remplace les données saisies (le client envoie toujours l'état complet) */
router.put("/:id/data", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ data: Record<string, unknown> }>();

  const [existing] = await db.select().from(documents).where(eq(documents.id, id));
  if (!existing) return c.json({ error: "Not found" }, 404);

  const data = body.data ?? {};
  const [result] = await db
    .update(documents)
    .set({ data, completionPercent: completionOf(existing.templateSnapshot, data), updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();
  return c.json(result);
});

/** Appelé après l'export PDF : le document est finalisé */
router.put("/:id/export", async (c) => {
  const id = c.req.param("id");
  const now = new Date();
  const [result] = await db
    .update(documents)
    .set({ status: "finalized", exportedAt: now, updatedAt: now })
    .where(eq(documents.id, id))
    .returning();
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(documents).where(eq(documents.id, id));
  return c.json({ ok: true });
});

export default router;
