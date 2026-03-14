import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { themes } from "../db/schema";
import { eq } from "drizzle-orm";
import { BUILTIN_THEMES } from "@template-generator/shared/themes/presets";

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const db = drizzle(pool);

for (const theme of BUILTIN_THEMES) {
  const existing = await db.select().from(themes).where(eq(themes.name, theme.name));
  if (existing.length === 0) {
    await db.insert(themes).values({ name: theme.name, theme, isBuiltin: true });
    console.log(`Thème inséré : ${theme.name}`);
  } else {
    console.log(`Thème déjà présent : ${theme.name}`);
  }
}

await pool.end();
console.log("Seed thèmes terminé.");
