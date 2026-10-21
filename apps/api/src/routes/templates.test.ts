import { beforeEach, describe, expect, it } from "vitest";
import { parseResponse } from "hono/client";
import { client, field, hasTestDatabase, resetDatabase, templateBody } from "../test/api";

/** Crée un template et le publie avec un champ remplissable sur le sous-titre */
async function publishedTemplate(name = "Rapport mensuel") {
  const created = await parseResponse(client.templates.$post({ json: templateBody(name) }));
  return parseResponse(
    client.templates[":id"].publish.$put({
      param: { id: created.id },
      json: { editableFields: [field("tb", "subtitle", true)] },
    }),
  );
}

describe.skipIf(!hasTestDatabase)("Templates", () => {
  beforeEach(resetDatabase);

  it("crée un brouillon, visible dans l'Atelier mais pas dans le Studio", async () => {
    const created = await parseResponse(client.templates.$post({ json: templateBody() }));
    expect(created.published).toBe(false);
    expect(created.publishedVersion).toBeNull();

    const atelier = await parseResponse(client.templates.$get({ query: {} }));
    expect(atelier.map((t) => t.id)).toEqual([created.id]);
    expect(atelier[0]?.documentCount).toBe(0);

    const studio = await parseResponse(client.templates.$get({ query: { published: "true" } }));
    expect(studio).toEqual([]);
  });

  it("publie en figeant l'état courant, valeurs par défaut des champs comprises", async () => {
    const published = await publishedTemplate();
    expect(published.published).toBe(true);
    expect(published.publishedAt).not.toBeNull();
    expect(published.publishedVersion?.pages).toEqual(published.pages);
    // Le champ reprend le contenu du composant comme valeur par défaut
    expect(published.publishedVersion?.editableFields[0]?.defaultValue).toBe("Mois");

    const studio = await parseResponse(client.templates.$get({ query: { published: "true" } }));
    expect(studio.map((t) => t.id)).toEqual([published.id]);
  });

  it("garde la version publiée intacte quand l'Atelier continue de modifier le template", async () => {
    const published = await publishedTemplate();
    const edited = templateBody("Rapport mensuel", [
      { id: "tb", type: "title-block", props: { title: "Rapport refondu", subtitle: "Mois" } },
    ]);
    const updated = await parseResponse(
      client.templates[":id"].$put({ param: { id: published.id }, json: { pages: edited.pages } }),
    );

    expect(updated.pages[0]?.children[0]?.props["title"]).toBe("Rapport refondu");
    expect(updated.publishedVersion?.pages[0]?.children[0]?.props["title"]).toBe("Rapport");

    // Le Studio voit la version publiée, l'Atelier l'état de travail
    const [studio] = await parseResponse(client.templates.$get({ query: { published: "true" } }));
    expect(studio?.preview?.pages[0]?.children[0]?.props["title"]).toBe("Rapport");
    const [atelier] = await parseResponse(client.templates.$get({ query: {} }));
    expect(atelier?.preview?.pages[0]?.children[0]?.props["title"]).toBe("Rapport refondu");
  });

  it("republie : la nouvelle version remplace l'ancienne", async () => {
    const published = await publishedTemplate();
    const edited = templateBody("Rapport mensuel", [
      { id: "tb", type: "title-block", props: { title: "Version 2", subtitle: "Mois" } },
    ]);
    await parseResponse(client.templates[":id"].$put({ param: { id: published.id }, json: { pages: edited.pages } }));
    const republished = await parseResponse(
      client.templates[":id"].publish.$put({ param: { id: published.id }, json: {} }),
    );
    expect(republished.publishedVersion?.pages[0]?.children[0]?.props["title"]).toBe("Version 2");
    // Sans champs envoyés, la publication garde ceux déjà configurés
    expect(republished.editableFields.map((f) => f.propKey)).toEqual(["subtitle"]);
  });

  it("duplique en brouillon, sans la version publiée", async () => {
    const published = await publishedTemplate();
    const copy = await parseResponse(client.templates[":id"].duplicate.$post({ param: { id: published.id } }));
    expect(copy.name).toBe("Rapport mensuel (copie)");
    expect(copy.published).toBe(false);
    expect(copy.publishedVersion).toBeNull();
    expect(copy.pages).toEqual(published.pages);
  });

  it("supprime le template en détachant ses documents, qui restent lisibles", async () => {
    const published = await publishedTemplate();
    const doc = await parseResponse(client.documents.$post({ json: { templateId: published.id } }));

    const deleted = await client.templates[":id"].$delete({ param: { id: published.id } });
    expect(deleted.status).toBe(200);

    const kept = await parseResponse(client.documents[":id"].$get({ param: { id: doc.id } }));
    expect(kept.templateId).toBeNull();
    expect(kept.templateSnapshot.name).toBe("Rapport mensuel");
  });

  it("répond 404 pour un template inconnu", async () => {
    const id = "4ec6bca1-a856-4c12-a66b-f793bcda02d1";
    expect((await client.templates[":id"].$get({ param: { id } })).status).toBe(404);
    expect((await client.templates[":id"].publish.$put({ param: { id }, json: {} })).status).toBe(404);
    expect((await client.templates[":id"].$delete({ param: { id } })).status).toBe(404);
  });
});
