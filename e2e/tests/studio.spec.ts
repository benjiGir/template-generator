import { expect, test } from "@playwright/test";
import { publishedTemplate, stepButton, unique } from "./helpers";

test("le Studio crée un document, le remplit, le relit et l'exporte", async ({ page, request }) => {
  const name = unique("Rapport");
  await publishedTemplate(request, name);

  // L'impression ouvre la boîte de dialogue du système : remplacée par un témoin
  await page.addInitScript(() => {
    window.print = () => {
      document.body.dataset["printed"] = "true";
    };
  });

  await page.goto("/documents/new");
  await page.getByRole("button", { name: `Créer un document à partir de ${name}` }).click();
  await expect(page).toHaveURL(/\/documents\/[^/]+\/fill$/);

  const field = page.getByLabel(/Période couverte/);
  await field.fill("Mars 2026");
  // La saisie apparaît dans le document
  await expect(page.getByText("Mars 2026").first()).toBeVisible();

  await stepButton(page, "Relire").click();
  await expect(page).toHaveURL(/\/preview$/);
  await expect(page.getByText("Mars 2026").first()).toBeVisible();

  await stepButton(page, "Exporter").click();
  await expect(page).toHaveURL(/\/export$/);
  await stepButton(page, "Exporter en PDF").click();
  await expect(stepButton(page, "Exporter à nouveau")).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-printed", "true");

  // Le document est finalisé, avec sa saisie enregistrée
  await page.goto("/documents");
  await page.getByRole("button", { name: /^Finalisés/ }).click();
  await expect(page.getByText(`${name} — `, { exact: false })).toBeVisible();
});
