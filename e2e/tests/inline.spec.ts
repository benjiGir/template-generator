import { expect, test } from "@playwright/test";
import { DEFAULT_PAGE_FORMAT, DEFAULT_THEME } from "@template-generator/shared/types/template";
import { unique } from "./helpers";

test("l'Atelier modifie un texte enrichi directement sur la page", async ({ page, request }) => {
  const created = await request.post("/api/templates", {
    data: {
      name: unique("Édition sur la page"),
      description: null,
      theme: DEFAULT_THEME,
      pageFormat: DEFAULT_PAGE_FORMAT,
      pages: [
        { id: "p1", label: "Page 1", children: [{ id: "ib", type: "intro-box", props: { content: "Texte initial" } }] },
      ],
      editableFields: [],
      tags: [],
    },
  });
  const { id } = await created.json();
  await page.goto(`/templates/${id}/build`);

  // Double-clic : l'éditeur s'ouvre sur la page, curseur dans le texte
  await page.getByText("Texte initial").dblclick();
  // L'inspecteur montre aussi un éditeur pour ce texte ; celui de la page vient en premier
  const editors = page.locator('[contenteditable="true"]');
  const editor = editors.first();
  await editor.click();
  await expect(editor).toBeFocused();
  await page.keyboard.press("End");
  await page.keyboard.type(" et **ajouté** ");

  // Un clic ailleurs termine l'édition ; le texte reste, mis en forme
  await page.getByText("Les pages blanches sont le document exporté").click();
  await expect(editors).toHaveCount(1);
  await expect(page.getByText("Texte initial et ajouté")).toBeVisible();
  await expect(page.locator("strong").getByText("ajouté")).toBeVisible();
});
