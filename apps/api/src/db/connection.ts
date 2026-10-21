import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
});

// Une connexion inactive coupée par le serveur (redémarrage, mise à jour de Postgres) émet une erreur
// sur le pool ; sans écouteur, Node arrête le processus. Le pool rouvre une connexion à la requête suivante.
pool.on("error", (err) => {
  console.error("Connexion PostgreSQL perdue :", err.message);
});

export const db = drizzle(pool);
