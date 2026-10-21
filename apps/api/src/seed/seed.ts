import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { BUILTIN_THEMES } from "@template-generator/shared/themes/presets";
import {
  buildDocumentSnapshot,
  buildPublishedVersion,
  computeCompletion,
} from "@template-generator/shared/utils/fields";
import { templates, componentPresets, themes, documents } from "../db/schema";
import { seedDocuments, seedPresets, seedTemplates } from "./data";

/*
 * Données de démonstration : thèmes intégrés, puis templates, presets et documents lus dans data/.
 * Relancer le seed n'insère que ce qui manque (repéré par le nom).
 */

// Lus et vérifiés avant toute écriture : un fichier invalide n'insère rien
const TEMPLATES = seedTemplates();
const PRESETS = seedPresets();
const DOCUMENTS = seedDocuments();

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const db = drizzle(pool);

console.log("\n── Thèmes ──");
for (const theme of BUILTIN_THEMES) {
  const existing = await db.select().from(themes).where(eq(themes.name, theme.name));
  if (existing.length === 0) {
    await db.insert(themes).values({ name: theme.name, theme, isBuiltin: true });
    console.log(`  ✓ Thème inséré : ${theme.name}`);
  } else {
    console.log(`  — Thème déjà présent : ${theme.name}`);
  }
}

console.log("\n── Templates ──");
for (const tpl of TEMPLATES) {
  const [found] = await db.select({ id: templates.id }).from(templates).where(eq(templates.name, tpl.name));
  if (found) {
    console.log(`  — Template déjà présent : ${tpl.name}`);
    continue;
  }
  await db.insert(templates).values({
    ...tpl,
    publishedAt: tpl.published ? new Date() : null,
    publishedVersion: tpl.published ? buildPublishedVersion(tpl) : null,
  });
  console.log(`  ✓ Template inséré : ${tpl.name}`);
}

console.log("\n── Presets de composants ──");
for (const preset of PRESETS) {
  const [found] = await db
    .select({ id: componentPresets.id })
    .from(componentPresets)
    .where(eq(componentPresets.label, preset.label));
  if (found) {
    console.log(`  — Preset déjà présent : ${preset.label}`);
    continue;
  }
  await db.insert(componentPresets).values(preset);
  console.log(`  ✓ Preset inséré : ${preset.label}`);
}

console.log("\n── Documents ──");
for (const doc of DOCUMENTS) {
  const [found] = await db.select({ id: documents.id }).from(documents).where(eq(documents.name, doc.name));
  if (found) {
    console.log(`  — Document déjà présent : ${doc.name}`);
    continue;
  }
  // Le document part de la version publiée du template, comme dans le Studio
  const [template] = await db.select().from(templates).where(eq(templates.name, doc.template));
  if (!template)
    throw new Error(`Seed : le document « ${doc.name} » désigne un template inconnu : « ${doc.template} »`);
  const templateSnapshot = buildDocumentSnapshot(template);
  await db.insert(documents).values({
    templateId: template.id,
    name: doc.name,
    status: doc.status,
    data: doc.data,
    templateSnapshot,
    completionPercent: computeCompletion(templateSnapshot.editableFields, doc.data).percent,
    exportedAt: doc.status === "finalized" ? new Date() : null,
  });
  console.log(`  ✓ Document inséré : ${doc.name}`);
}

await pool.end();

console.log("\n✅ Seed terminé.");
