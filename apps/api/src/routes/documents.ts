import { Hono } from "hono";
import { db } from "../db/connection";
import { documents } from "../db/schema";
import { eq } from "drizzle-orm";

const router = new Hono();

router.get("/", async (c) => {
  const result = await db
    .select({
      id:         documents.id,
      templateId: documents.templateId,
      name:       documents.name,
      createdAt:  documents.createdAt,
    })
    .from(documents)
    .orderBy(documents.createdAt);
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

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(documents).where(eq(documents.id, id));
  return c.json({ ok: true });
});

export default router;