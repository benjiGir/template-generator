import { testDatabaseUrl } from "./test-database";

// La connexion de l'API (db/connection.ts) lit DATABASE_URL à l'import : on la fixe avant.
// Sans base de test, une adresse qui échoue tout de suite plutôt que la base de développement.
process.env["DATABASE_URL"] = testDatabaseUrl() ?? "postgres://aucune-base-de-test.invalid/none";
