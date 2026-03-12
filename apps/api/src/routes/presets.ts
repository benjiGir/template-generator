import { Hono } from "hono";
import { db } from "../db/connection";
import { componentPresets } from "../db/schema";
import { eq } from "drizzle-orm";

const router = new Hono();

router.get("/", async (c) => {
  const result = await db.select().from(componentPresets).orderBy(componentPresets.createdAt);
  return c.json(result);
});

router.post("/", async (c) => {
  const body = await c.req.json();
  const [result] = await db.insert(componentPresets).values(body).returning();
  return c.json(result, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const [result] = await db
    .update(componentPresets)
    .set(body)
    .where(eq(componentPresets.id, id))
    .returning();
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(componentPresets).where(eq(componentPresets.id, id));
  return c.json({ ok: true });
});

export default router;