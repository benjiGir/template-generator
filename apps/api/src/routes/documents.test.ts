import { beforeEach, describe, expect, it } from "vitest";
import { parseResponse } from "hono/client";
import { client, field, hasTestDatabase, resetDatabase, templateBody } from "../test/api";

/** Template publié avec deux champs : le sous-titre (obligatoire) et le titre */
async function publishedTemplate() {
  const created = await parseResponse(client.templates.$post({ json: templateBody() }));
  return parseResponse(
    client.templates[":id"].publish.$put({
      param: { id: created.id },
      json: { editableFields: [field("tb", "subtitle", true, 0), field("tb", "title", false, 1)] },
    }),
  );
}

describe.skipIf(!hasTestDatabase)("Documents", () => {
  beforeEach(resetDatabase);

  it("refuse de créer un document depuis un template non publié", async () => {
    const draft = await parseResponse(client.templates.$post({ json: templateBody() }));
    const res = await client.documents.$post({ json: { templateId: draft.id } });
    expect(res.status).toBe(409);
  });

  it("crée le document depuis la version publiée, pas depuis l'état de travail", async () => {
    const template = await publishedTemplate();
    const edited = templateBody("Rapport mensuel", [
      { id: "tb", type: "title-block", props: { title: "Pas encore publié", subtitle: "Mois" } },
    ]);
    await parseResponse(client.templates[":id"].$put({ param: { id: template.id }, json: { pages: edited.pages } }));

    const doc = await parseResponse(client.documents.$post({ json: { templateId: template.id } }));
    expect(doc.status).toBe("draft");
    expect(doc.templateSnapshot).toEqual(template.publishedVersion);
    expect(doc.templateSnapshot.pages[0]?.children[0]?.props["title"]).toBe("Rapport");
    expect(doc.name).toMatch(/^Rapport mensuel — /);
  });

  it("garde sa version quand le template est republié", async () => {
    const template = await publishedTemplate();
    const doc = await parseResponse(client.documents.$post({ json: { templateId: template.id, name: "Mars" } }));

    const edited = templateBody("Rapport mensuel", [
      { id: "tb", type: "title-block", props: { title: "Version 2", subtitle: "Mois" } },
    ]);
    await parseResponse(client.templates[":id"].$put({ param: { id: template.id }, json: { pages: edited.pages } }));
    await parseResponse(client.templates[":id"].publish.$put({ param: { id: template.id }, json: {} }));

    const kept = await parseResponse(client.documents[":id"].$get({ param: { id: doc.id } }));
    expect(kept.templateSnapshot.pages[0]?.children[0]?.props["title"]).toBe("Rapport");
  });

  it("calcule la progression à chaque saisie", async () => {
    const template = await publishedTemplate();
    const doc = await parseResponse(client.documents.$post({ json: { templateId: template.id } }));
    expect(doc.completionPercent).toBe(0);

    const half = await parseResponse(
      client.documents[":id"].data.$put({ param: { id: doc.id }, json: { data: { "tb.subtitle": "Mars 2026" } } }),
    );
    expect(half.completionPercent).toBe(50);

    const full = await parseResponse(
      client.documents[":id"].data.$put({
        param: { id: doc.id },
        json: { data: { "tb.subtitle": "Mars 2026", "tb.title": "Bilan" } },
      }),
    );
    expect(full.completionPercent).toBe(100);
    expect(full.data).toEqual({ "tb.subtitle": "Mars 2026", "tb.title": "Bilan" });
  });

  it("finalise le document à l'export", async () => {
    const template = await publishedTemplate();
    const doc = await parseResponse(client.documents.$post({ json: { templateId: template.id } }));
    const exported = await parseResponse(client.documents[":id"].export.$put({ param: { id: doc.id } }));
    expect(exported.status).toBe("finalized");
    expect(exported.exportedAt).not.toBeNull();
  });

  it("duplique en brouillon avec les données saisies", async () => {
    const template = await publishedTemplate();
    const doc = await parseResponse(client.documents.$post({ json: { templateId: template.id, name: "Mars" } }));
    await parseResponse(
      client.documents[":id"].data.$put({ param: { id: doc.id }, json: { data: { "tb.subtitle": "Mars 2026" } } }),
    );
    await parseResponse(client.documents[":id"].export.$put({ param: { id: doc.id } }));

    const copy = await parseResponse(client.documents[":id"].duplicate.$post({ param: { id: doc.id } }));
    expect(copy.name).toBe("Mars (copie)");
    expect(copy.status).toBe("draft");
    expect(copy.data).toEqual({ "tb.subtitle": "Mars 2026" });
    expect(copy.templateSnapshot).toEqual(doc.templateSnapshot);
  });

  it("compte les documents de chaque template", async () => {
    const template = await publishedTemplate();
    await parseResponse(client.documents.$post({ json: { templateId: template.id } }));
    await parseResponse(client.documents.$post({ json: { templateId: template.id } }));
    const [listed] = await parseResponse(client.templates.$get({ query: {} }));
    expect(listed?.documentCount).toBe(2);
  });

  it("renomme puis supprime", async () => {
    const template = await publishedTemplate();
    const doc = await parseResponse(client.documents.$post({ json: { templateId: template.id } }));
    const renamed = await parseResponse(
      client.documents[":id"].$put({ param: { id: doc.id }, json: { name: "Bilan de mars" } }),
    );
    expect(renamed.name).toBe("Bilan de mars");

    expect((await client.documents[":id"].$delete({ param: { id: doc.id } })).status).toBe(200);
    expect((await client.documents[":id"].$get({ param: { id: doc.id } })).status).toBe(404);
  });
});
