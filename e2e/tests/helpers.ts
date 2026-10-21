import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import { DEFAULT_PAGE_FORMAT, DEFAULT_THEME, type Template } from "@template-generator/shared/types/template";

/**
 * Glisse un élément sur un autre à la souris, par petits pas : le capteur de dnd-kit
 * ne démarre le glisser qu'après quelques pixels de déplacement.
 */
export async function dragTo(page: Page, source: Locator, target: Locator) {
  const from = await source.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error("Élément à glisser ou cible introuvable à l'écran");
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2, { steps: 5 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 });
  await page.mouse.up();
}

/** Template publié créé par l'API : un bloc titre dont le sous-titre est à remplir (obligatoire) */
export async function publishedTemplate(request: APIRequestContext, name: string): Promise<Template> {
  const created = await request.post("/api/templates", {
    data: {
      name,
      description: null,
      theme: DEFAULT_THEME,
      pageFormat: DEFAULT_PAGE_FORMAT,
      pages: [
        {
          id: "page-1",
          label: "Page 1",
          children: [{ id: "tb", type: "title-block", props: { title: name, subtitle: "Période" } }],
        },
      ],
      editableFields: [],
      tags: [],
    },
  });
  expect(created.ok()).toBe(true);
  const { id } = await created.json();
  const published = await request.put(`/api/templates/${id}/publish`, {
    data: {
      editableFields: [
        {
          nodeId: "tb",
          propKey: "subtitle",
          label: "Période couverte",
          type: "text",
          defaultValue: "",
          required: true,
          order: 0,
        },
      ],
    },
  });
  expect(published.ok()).toBe(true);
  return published.json();
}

/**
 * Nom propre à cette exécution : un test relancé (nouvel essai, --repeat-each) ne retrouve pas
 * les objets créés par l'exécution précédente, la base n'étant vidée qu'au début de la suite.
 */
export function unique(base: string): string {
  return `${base} ${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

/** Bouton d'action en pied d'étape (son nom exact : le stepper porte aussi le nom des étapes) */
export function stepButton(page: Page, name: string): Locator {
  return page.getByRole("button", { name, exact: true });
}
