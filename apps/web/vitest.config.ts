import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// Mêmes alias que l'application ; les tests qui rendent des hooks déclarent l'environnement jsdom
export default mergeConfig(viteConfig, defineConfig({ test: { environment: "node" } }));
