import { expect, test } from "@playwright/test";
import { dragTo, stepButton, unique } from "./helpers";

test("l'Atelier construit un template depuis une page blanche et le publie dans le Studio", async ({ page }) => {
  const name = unique("Bilan");
  await page.goto("/templates/new");
  await page.getByText("Page blanche", { exact: true }).click();
  await expect(page).toHaveURL(/\/templates\/[^/]+\/theme$/);

  await stepButton(page, "Construire").click();
  await expect(page).toHaveURL(/\/build$/);

  // Un bloc titre glissé de la bibliothèque sur la page vide, puis modifié dans l'inspecteur
  await dragTo(page, page.getByRole("button", { name: /^Bloc titre/ }), page.getByText("Glissez des composants ici"));
  const title = page.getByLabel("Titre", { exact: true });
  await expect(title).toBeVisible();
  await title.fill("Bilan trimestriel");
  await expect(page.getByText("Bilan trimestriel").first()).toBeVisible();

  await stepButton(page, "Champs et publication").click();
  await expect(page).toHaveURL(/\/publish$/);

  // Le sous-titre est pré-sélectionné ; le titre, nom stable du document, ne l'est pas
  await expect(page.getByRole("tab", { name: /Champs/ })).toContainText("1");

  await page.getByRole("tab", { name: /Nom et description/ }).click();
  await page.getByLabel(/^Nom/).fill(name);
  await stepButton(page, "Publier dans le Studio").click();

  // Retour à la liste de l'Atelier une fois publié
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByText(name)).toBeVisible();

  // Le template est proposé dans le Studio
  await page.goto("/documents/new");
  await expect(page.getByRole("button", { name: `Créer un document à partir de ${name}` })).toBeVisible();
});
