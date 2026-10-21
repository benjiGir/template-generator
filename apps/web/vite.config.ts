import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// En développement, le front appelle l'API en relatif (/api) et Vite relaie vers le serveur Hono :
// même origine que la page, donc pas de CORS, que l'on ouvre localhost ou l'IP du réseau (--host).
const apiProxy = {
  "/api": process.env["API_PROXY_TARGET"] ?? "http://localhost:3001",
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
});