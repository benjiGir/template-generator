import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/connection";
import { componentPresets } from "../db/schema";
import { idParam, presetCreate, presetUpdate } from "../schemas";
import { validate } from "../validation";

const NOT_FOUND = { error: "Preset introuvable" };

const router = new Hono()
  .get("/", async (c) => {
    const result = await db.select().from(componentPresets).orderBy(desc(componentPresets.createdAt));
    return c.json(result, 200);
  })

  .get("/:id", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [result] = await db.select().from(componentPresets).where(eq(componentPresets.id, id));
    if (!result) return c.json(NOT_FOUND, 404);
    return c.json(result, 200);
  })

  .post("/", validate("json", presetCreate), async (c) => {
    const [result] = await db.insert(componentPresets).values(c.req.valid("json")).returning();
    return c.json(result!, 201);
  })

  .post("/:id/duplicate", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [source] = await db.select().from(componentPresets).where(eq(componentPresets.id, id));
    if (!source) return c.json(NOT_FOUND, 404);
    const { id: _id, createdAt: _createdAt, ...rest } = source;
    const [result] = await db
      .insert(componentPresets)
      .values({ ...rest, label: `${source.label} (copie)` })
      .returning();
    return c.json(result!, 201);
  })

  .put("/:id", validate("param", idParam), validate("json", presetUpdate), async (c) => {
    const { id } = c.req.valid("param");
    const [result] = await db
      .update(componentPresets)
      .set(c.req.valid("json"))
      .where(eq(componentPresets.id, id))
      .returning();
    if (!result) return c.json(NOT_FOUND, 404);
    return c.json(result, 200);
  })

  .delete("/:id", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [deleted] = await db
      .delete(componentPresets)
      .where(eq(componentPresets.id, id))
      .returning({ id: componentPresets.id });
    if (!deleted) return c.json(NOT_FOUND, 404);
    return c.json({ ok: true }, 200);
  });

export default router;
