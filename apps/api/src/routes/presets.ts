import { Hono } from "hono";
import { db } from "../db/connection";
import { componentPresets } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { pick } from "../utils/pick";

const router = new Hono();

type PresetInsert = typeof componentPresets.$inferInsert;
const WRITABLE_FIELDS = ["baseType", "label", "description", "defaultProps", "category"] as const;

router.get("/", async (c) => {
  const result = await db.select().from(componentPresets).orderBy(desc(componentPresets.createdAt));
  return c.json(result);
});

router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [result] = await db.select().from(componentPresets).where(eq(componentPresets.id, id));
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

router.post("/", async (c) => {
  const body = pick<PresetInsert>(await c.req.json(), WRITABLE_FIELDS);
  const [result] = await db.insert(componentPresets).values(body as PresetInsert).returning();
  return c.json(result, 201);
});

router.post("/:id/duplicate", async (c) => {
  const id = c.req.param("id");
  const [source] = await db.select().from(componentPresets).where(eq(componentPresets.id, id));
  if (!source) return c.json({ error: "Not found" }, 404);
  const { id: _id, createdAt: _createdAt, ...rest } = source;
  const [result] = await db
    .insert(componentPresets)
    .values({ ...rest, label: `${source.label} (copie)` })
    .returning();
  return c.json(result, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = pick<PresetInsert>(await c.req.json(), WRITABLE_FIELDS);
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
