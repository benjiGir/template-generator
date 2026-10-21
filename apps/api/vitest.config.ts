import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Crée et migre la base de test une fois, avant tous les fichiers
    globalSetup: ["./src/test/global-setup.ts"],
    // Pointe la connexion de l'API sur la base de test, avant tout import
    setupFiles: ["./src/test/setup-env.ts"],
    // Les tests sur base vident les tables : un fichier à la fois
    fileParallelism: false,
  },
});
