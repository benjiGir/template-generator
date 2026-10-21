import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import documentsRouter from "./routes/documents";
import presetsRouter from "./routes/presets";
import templatesRouter from "./routes/templates";
import themesRouter from "./routes/themes";
import type { ApiErrorBody } from "./validation";

const app = new Hono();

if (process.env["NODE_ENV"] !== "test") app.use(logger());
app.use(cors({ origin: process.env["CORS_ORIGIN"] ?? "http://localhost:5173" }));

app.notFound((c) => c.json<ApiErrorBody>({ error: "Route inconnue" }, 404));

app.onError((err, c) => {
  // Erreurs prévues par Hono (JSON mal formé, Content-Type absent…) : leur statut et leur message
  if (err instanceof HTTPException) return c.json<ApiErrorBody>({ error: err.message }, err.status);
  console.error(err);
  return c.json<ApiErrorBody>({ error: "Erreur interne du serveur" }, 500);
});

const routes = app
  .route("/api/templates", templatesRouter)
  .route("/api/presets", presetsRouter)
  .route("/api/documents", documentsRouter)
  .route("/api/themes", themesRouter)
  .get("/api/health", (c) => c.json({ status: "ok" }, 200));

export default app;

/** Contrat de l'API, lu par le client typé du front (`hc<AppType>`) */
export type AppType = typeof routes;
