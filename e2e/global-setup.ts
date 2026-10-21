import { Client } from "pg";
import prepareTestDatabase from "../apps/api/src/test/global-setup";
import { testDatabaseUrl } from "../apps/api/src/test/test-database";

/** Base de test créée, migrée, puis vidée : chaque exécution part de zéro */
export default async function globalSetup() {
  await prepareTestDatabase();
  const client = new Client({ connectionString: testDatabaseUrl() ?? undefined });
  await client.connect();
  try {
    await client.query("truncate table documents, templates, component_presets, themes restart identity cascade");
  } finally {
    await client.end();
  }
}
