import { Hono } from "hono";
import { db } from "../db/connection";
import { documents } from "../db/schema";
import { eq } from "drizzle-orm";

const router = new Hono();

router.get("/", async (c) => {
  const result = await db
    .select({
      id:                documents.id,
      templateId:        documents.templateId,
      name:              documents.name,
      status:            documents.status,
      completionPercent: documents.completionPercent,
      updatedAt:         documents.updatedAt,
      createdAt:         documents.createdAt,
    })
    .from(documents)
    .orderBy(documents.updatedAt);
  return c.json(result);
});

router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [result] = await db.select().from(documents).where(eq(documents.id, id));
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.post("/", async (c) => {
  const body = await c.req.json();
  const [result] = await db.insert(documents).values(body).returning();
  return c.json(result, 201);
});

router.put("/:id/data", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ data: Record<string, unknown> }>();

  const [existing] = await db.select().from(documents).where(eq(documents.id, id));
  if (!existing) return c.json({ error: "Not found" }, 404);

  const mergedData = { ...(existing.data as Record<string, unknown>), ...body.data };

  const snapshot = existing.templateSnapshot as { editableFields?: { nodeId: string; propKey: string }[] };
  const editableFields = snapshot?.editableFields ?? [];
  const total = editableFields.length;
  const filled = editableFields.filter((f) => {
    const val = mergedData[`${f.nodeId}.${f.propKey}`];
    return val !== undefined && val !== null && val !== "";
  }).length;
  const completionPercent = total > 0 ? Math.round((filled / total) * 100) : 100;

  const [result] = await db
    .update(documents)
    .set({ data: mergedData, completionPercent, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();
  return c.json(result);
});

router.put("/:id/finalize", async (c) => {
  const id = c.req.param("id");
  const [result] = await db
    .update(documents)
    .set({ status: "finalized", updatedAt: new Date() })
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
