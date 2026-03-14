import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import templatesRouter from "./routes/templates";
import presetsRouter from "./routes/presets";
import documentsRouter from "./routes/documents";
import themesRouter from "./routes/themes";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: process.env["CORS_ORIGIN"] ?? "http://localhost:5173" }));

app.route("/api/templates", templatesRouter);
app.route("/api/presets", presetsRouter);
app.route("/api/documents", documentsRouter);
app.route("/api/themes", themesRouter);

app.get("/api/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env["PORT"]) || 3001;

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});