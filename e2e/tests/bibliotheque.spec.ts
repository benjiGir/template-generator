import { expect, test } from "@playwright/test";
import { stepButton, unique } from "./helpers";

test("la Bibliothèque règle un composant et le range comme preset", async ({ page }) => {
  const name = unique("KPI chiffre d'affaires");
  await page.goto("/components/new");
  await page.getByRole("button", { name: "Carte KPI", exact: true }).click();
  await expect(page).toHaveURL(/\/components\/new\/configure$/);

  const title = page.getByLabel("Titre", { exact: true });
  await title.fill("Chiffre d'affaires");
  await expect(page.getByText("Chiffre d'affaires").first()).toBeVisible();

  await stepButton(page, "Nommer et ranger").click();
  await expect(page).toHaveURL(/\/save$/);
  await page.getByLabel(/^Nom du preset/).fill(name);
  await stepButton(page, "Ranger dans la bibliothèque").click();

  await expect(page).toHaveURL(/\/components$/);
  await expect(page.getByText(name)).toBeVisible();
});

test("l'éditeur de texte enrichi charge le contenu et applique le markdown", async ({ page }) => {
  await page.goto("/components/new");
  await page.getByRole("button", { name: "Encadré d'appel", exact: true }).click();
  await expect(page).toHaveURL(/\/configure$/);

  // Le contenu par défaut est chargé dans l'éditeur (Lexical)
  const editor = page.locator('[contenteditable="true"]').first();
  await expect(editor).toContainText("Votre message ici");

  // Annuler juste après l'ouverture garde le contenu chargé
  await editor.click();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(editor).toContainText("Votre message ici");

  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("Message **important** ");

  // Le raccourci markdown met en gras, et l'aperçu suit la saisie
  await expect(editor.locator("strong, .font-bold").getByText("important")).toBeVisible();
  const preview = page.locator("[data-component-preview]");
  await expect(preview).toContainText("Message important");
  await expect(preview.locator("strong").getByText("important")).toBeVisible();
});
