import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client, Pool } from "pg";
import { testDatabaseName, testDatabaseUrl } from "./test-database";

/**
 * Prépare la base de test : la crée si besoin, puis applique les migrations.
 * Sans TEST_DATABASE_URL, les tests sur base sont ignorés en local, mais la CI échoue :
 * elle doit toujours les exécuter.
 */
export default async function setup() {
  const url = testDatabaseUrl();
  if (!url) {
    if (process.env["CI"]) throw new Error("TEST_DATABASE_URL est requise en CI");
    console.warn("\nTEST_DATABASE_URL absente : les tests sur base de données sont ignorés.\n");
    return;
  }

  const name = testDatabaseName(url);
  const server = new URL(url);
  server.pathname = "/postgres";
  const admin = new Client({ connectionString: server.toString() });
  try {
    await admin.connect();
  } catch (error) {
    // Sans ce message, Vitest n'affiche que l'erreur brute de pg suivie d'un trompeur « No test files found »
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Connexion impossible au serveur de TEST_DATABASE_URL (${server.host}, utilisateur « ${server.username} ») : ` +
        `${reason}. Vérifiez qu'il s'agit bien du serveur PostgreSQL de DocForge (celui de DATABASE_URL) ` +
        `et que l'utilisateur et le mot de passe sont les siens.`,
      { cause: error },
    );
  }
  try {
    const existing = await admin.query("select 1 from pg_database where datname = $1", [name]);
    // Nom vérifié par testDatabaseUrl (lettres, chiffres, _) : il peut entrer dans la requête
    if (existing.rowCount === 0) await admin.query(`create database "${name}"`);
  } finally {
    await admin.end();
  }

  const pool = new Pool({ connectionString: url });
  try {
    await migrate(drizzle(pool), { migrationsFolder: resolve(import.meta.dirname, "../../drizzle") });
  } finally {
    await pool.end();
  }
}
