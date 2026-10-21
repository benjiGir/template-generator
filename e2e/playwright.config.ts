import { defineConfig, devices } from "@playwright/test";
import { testDatabaseUrl } from "../apps/api/src/test/test-database";

/*
 * Tests de bout en bout : l'application complète (API + front) sur la base de test,
 * sur des ports à part pour ne jamais toucher aux serveurs de développement ni à leur base.
 */

const DATABASE_URL = testDatabaseUrl();
if (!DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL est requise (base dont le nom finit par « _test », vidée avant les tests)");
}

const API_PORT = 3101;
const WEB_PORT = 5183;
const BASE_URL = `http://localhost:${WEB_PORT}`;

export default defineConfig({
  testDir: "./tests",
  // Une seule base, remise à zéro avant la suite : les tests s'enchaînent
  workers: 1,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? [["list"], ["html", { open: "never" }]] : "list",
  globalSetup: "./global-setup.ts",
  use: {
    baseURL: BASE_URL,
    locale: "fr-FR",
    trace: "retain-on-failure",
    // La visite guidée de première utilisation est déjà vue
    storageState: {
      cookies: [],
      origins: [{ origin: BASE_URL, localStorage: [{ name: "docforge-tour", value: "skipped" }] }],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: [
    {
      command: "pnpm --filter @template-generator/api start",
      url: `http://localhost:${API_PORT}/api/health`,
      env: { PORT: String(API_PORT), DATABASE_URL, CORS_ORIGIN: BASE_URL, NODE_ENV: "test" },
      reuseExistingServer: false,
    },
    {
      command: `pnpm --filter @template-generator/web exec vite --port ${WEB_PORT} --strictPort`,
      url: BASE_URL,
      env: { API_PROXY_TARGET: `http://localhost:${API_PORT}` },
      reuseExistingServer: false,
    },
  ],
});
