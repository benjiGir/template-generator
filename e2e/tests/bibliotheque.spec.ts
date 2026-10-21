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
