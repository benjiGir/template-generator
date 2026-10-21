import { Hono } from "hono";
import { desc, eq, sql } from "drizzle-orm";
import { buildDocumentSnapshot, computeCompletion } from "@template-generator/shared/utils/fields";
import type { DocumentSnapshot } from "@template-generator/shared/types/document";
import type { PropValues } from "@template-generator/shared/types/component";
import type { EditableField, PagePreview } from "@template-generator/shared/types/template";
import { db } from "../db/connection";
import { documents, templates } from "../db/schema";
import { documentCreate, documentData, documentRename, idParam } from "../schemas";
import { validate } from "../validation";

const NOT_FOUND = { error: "Document introuvable" };

function completionOf(snapshot: DocumentSnapshot, data: PropValues): number {
  return computeCompletion(snapshot.editableFields ?? [], data).percent;
}

/** Première page du snapshot et champs : de quoi dessiner une miniature fidèle avec les données saisies */
const preview = sql<PagePreview & { editableFields: EditableField[] }>`jsonb_build_object(
  'theme', "documents"."template_snapshot" -> 'theme',
  'pageFormat', "documents"."template_snapshot" -> 'pageFormat',
  'pages', jsonb_path_query_array("documents"."template_snapshot" -> 'pages', '$[0]'),
  'editableFields', "documents"."template_snapshot" -> 'editableFields'
)`;

const router = new Hono()
  .get("/", async (c) => {
    const result = await db
      .select({
        id: documents.id,
        templateId: documents.templateId,
        templateName: sql<string | null>`"documents"."template_snapshot" ->> 'name'`,
        preview,
        data: documents.data,
        name: documents.name,
        status: documents.status,
        completionPercent: documents.completionPercent,
        exportedAt: documents.exportedAt,
        updatedAt: documents.updatedAt,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .orderBy(desc(documents.updatedAt));
    return c.json(result, 200);
  })

  .get("/:id", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [result] = await db.select().from(documents).where(eq(documents.id, id));
    if (!result) return c.json(NOT_FOUND, 404);
    return c.json(result, 200);
  })

  /** Crée un document à partir de la version publiée d'un template */
  .post("/", validate("json", documentCreate), async (c) => {
    const body = c.req.valid("json");
    const [template] = await db.select().from(templates).where(eq(templates.id, body.templateId));
    if (!template) return c.json({ error: "Template introuvable" }, 404);
    if (!template.published) return c.json({ error: "Ce template n'est pas publié" }, 409);

    const snapshot = buildDocumentSnapshot(template);
    const name = body.name || `${snapshot.name} — ${new Date().toLocaleDateString("fr-FR")}`;
    const [result] = await db
      .insert(documents)
      .values({
        templateId: template.id,
        name,
        data: {},
        templateSnapshot: snapshot,
        status: "draft",
        completionPercent: completionOf(snapshot, {}),
      })
      .returning();
    if (!result) throw new Error("L'insertion n'a renvoyé aucune ligne");
    return c.json(result, 201);
  })

  /** Duplique un document (le cas courant : repartir du mois précédent) */
  .post("/:id/duplicate", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [source] = await db.select().from(documents).where(eq(documents.id, id));
    if (!source) return c.json(NOT_FOUND, 404);
    const [result] = await db
      .insert(documents)
      .values({
        templateId: source.templateId,
        name: `${source.name} (copie)`,
        data: source.data,
        templateSnapshot: source.templateSnapshot,
        status: "draft",
        completionPercent: source.completionPercent,
      })
      .returning();
    if (!result) throw new Error("L'insertion n'a renvoyé aucune ligne");
    return c.json(result, 201);
  })

  .put("/:id", validate("param", idParam), validate("json", documentRename), async (c) => {
    const { id } = c.req.valid("param");
    const [result] = await db
      .update(documents)
      .set({ name: c.req.valid("json").name, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    if (!result) return c.json(NOT_FOUND, 404);
    return c.json(result, 200);
  })

  /** Remplace les données saisies (le client envoie toujours l'état complet) */
  .put("/:id/data", validate("param", idParam), validate("json", documentData), async (c) => {
    const { id } = c.req.valid("param");
    const { data } = c.req.valid("json");
    const [existing] = await db.select().from(documents).where(eq(documents.id, id));
    if (!existing) return c.json(NOT_FOUND, 404);

    const [result] = await db
      .update(documents)
      .set({ data, completionPercent: completionOf(existing.templateSnapshot, data), updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    // Supprimé entre-temps par une autre requête
    if (!result) return c.json(NOT_FOUND, 404);
    return c.json(result, 200);
  })

  /** Appelé après l'export PDF : le document est finalisé */
  .put("/:id/export", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const now = new Date();
    const [result] = await db
      .update(documents)
      .set({ status: "finalized", exportedAt: now, updatedAt: now })
      .where(eq(documents.id, id))
      .returning();
    if (!result) return c.json(NOT_FOUND, 404);
    return c.json(result, 200);
  })

  .delete("/:id", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [deleted] = await db.delete(documents).where(eq(documents.id, id)).returning({ id: documents.id });
    if (!deleted) return c.json(NOT_FOUND, 404);
    return c.json({ ok: true }, 200);
  });

export default router;
