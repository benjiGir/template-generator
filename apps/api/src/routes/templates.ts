import { Hono } from "hono";
import { db } from "../db/connection";
import { templates } from "../db/schema";
import { eq } from "drizzle-orm";

const router = new Hono();

router.get("/", async (c) => {
  const publishedFilter = c.req.query("published");
  let query = db
    .select({
      id:          templates.id,
      name:        templates.name,
      description: templates.description,
      published:   templates.published,
      editableFields: templates.editableFields,
      createdAt:   templates.createdAt,
      updatedAt:   templates.updatedAt,
    })
    .from(templates)
    .$dynamic();
  if (publishedFilter === "true") {
    query = query.where(eq(templates.published, true));
  }
  const result = await query.orderBy(templates.updatedAt);
  return c.json(result);
});

router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [result] = await db.select().from(templates).where(eq(templates.id, id));
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.post("/", async (c) => {
  const body = await c.req.json();
  const [result] = await db.insert(templates).values(body).returning();
  return c.json(result, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [result] = await db
    .update(templates)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(templates.id, id))
    .returning();
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.put("/:id/publish", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ editableFields: unknown[]; tags?: string[] }>();
  const [result] = await db
    .update(templates)
    .set({
      published:      true,
      editableFields: body.editableFields ?? [],
      tags:           body.tags ?? [],
      updatedAt:      new Date(),
    })
    .where(eq(templates.id, id))
    .returning();
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(templates).where(eq(templates.id, id));
  return c.json({ ok: true });
});

export default router;
