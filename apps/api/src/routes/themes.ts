import { Hono } from "hono";
import { db } from "../db/connection";
import { themes } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

const router = new Hono();

router.get("/", async (c) => {
  const result = await db.select().from(themes).orderBy(desc(themes.isBuiltin), themes.createdAt);
  return c.json(result);
});

router.post("/", async (c) => {
  const body = await c.req.json();
  const [created] = await db
    .insert(themes)
    .values({ name: body.name, theme: body.theme, isBuiltin: false })
    .returning();
  return c.json(created, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db
    .update(themes)
    .set({ name: body.name, theme: body.theme })
    .where(and(eq(themes.id, id), eq(themes.isBuiltin, false)))
    .returning();
  if (!updated) return c.json({ error: "Not found or builtin" }, 404);
  return c.json(updated);
});

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const [deleted] = await db
    .delete(themes)
    .where(and(eq(themes.id, id), eq(themes.isBuiltin, false)))
    .returning();
  if (!deleted) return c.json({ error: "Not found or builtin" }, 404);
  return c.json({ success: true });
});

export default router;
