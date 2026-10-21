import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/connection";
import { themes } from "../db/schema";
import { idParam, themeCreate, themeUpdate } from "../schemas";
import { validate } from "../validation";

/** Les thèmes fournis avec l'application ne se modifient ni ne se suppriment */
const NOT_EDITABLE = { error: "Thème introuvable ou fourni avec l'application" };

const router = new Hono()
  .get("/", async (c) => {
    const result = await db.select().from(themes).orderBy(desc(themes.isBuiltin), themes.createdAt);
    return c.json(result, 200);
  })

  .post("/", validate("json", themeCreate), async (c) => {
    const [created] = await db
      .insert(themes)
      .values({ ...c.req.valid("json"), isBuiltin: false })
      .returning();
    return c.json(created!, 201);
  })

  .put("/:id", validate("param", idParam), validate("json", themeUpdate), async (c) => {
    const { id } = c.req.valid("param");
    const [updated] = await db
      .update(themes)
      .set(c.req.valid("json"))
      .where(and(eq(themes.id, id), eq(themes.isBuiltin, false)))
      .returning();
    if (!updated) return c.json(NOT_EDITABLE, 404);
    return c.json(updated, 200);
  })

  .delete("/:id", validate("param", idParam), async (c) => {
    const { id } = c.req.valid("param");
    const [deleted] = await db
      .delete(themes)
      .where(and(eq(themes.id, id), eq(themes.isBuiltin, false)))
      .returning({ id: themes.id });
    if (!deleted) return c.json(NOT_EDITABLE, 404);
    return c.json({ ok: true }, 200);
  });

export default router;
