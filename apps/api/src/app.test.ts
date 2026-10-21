import { describe, expect, it } from "vitest";
import app from "./app";
import { apiErrorBody, type ApiErrorBody } from "./validation";

/*
 * Validation et erreurs : ces requêtes sont refusées avant toute requête SQL,
 * les tests tournent donc sans base de données (en local comme en CI).
 */

const ID = "4ec6bca1-a856-4c12-a66b-f793bcda02d1";

/** Requête JSON ; un corps texte est envoyé tel quel (JSON volontairement mal formé) */
function send(method: string, body: object | string): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

/** Le corps de la réponse, vérifié contre la forme des erreurs de l'API */
async function errorOf(res: Response): Promise<ApiErrorBody> {
  return apiErrorBody.parse(await res.json());
}

function paths(body: ApiErrorBody): string[] {
  return (body.issues ?? []).map((issue) => issue.path);
}

describe("API : réponses de base", () => {
  it("répond à la vérification de santé", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("renvoie une 404 en JSON sur une route inconnue", async () => {
    const res = await app.request("/api/inconnue");
    expect(res.status).toBe(404);
    expect(await errorOf(res)).toEqual({ error: "Route inconnue" });
  });
});

describe("API : requêtes invalides refusées en 400", () => {
  it("refuse un identifiant mal formé au lieu d'échouer en base", async () => {
    const res = await app.request("/api/documents/abc");
    expect(res.status).toBe(400);
    const body = await errorOf(res);
    expect(body.error).toBe("Requête invalide");
    expect(paths(body)).toEqual(["id"]);
  });

  it("refuse un JSON mal formé", async () => {
    const res = await app.request("/api/templates", send("POST", "{pas du json"));
    expect(res.status).toBe(400);
  });

  it("liste les champs manquants d'un template", async () => {
    const res = await app.request("/api/templates", send("POST", {}));
    expect(res.status).toBe(400);
    expect(paths(await errorOf(res))).toEqual(
      expect.arrayContaining(["name", "theme", "pageFormat", "pages", "editableFields", "tags"]),
    );
  });

  it("refuse un filtre de liste inconnu", async () => {
    const res = await app.request("/api/templates?published=oui");
    expect(res.status).toBe(400);
    expect(paths(await errorOf(res))).toEqual(["published"]);
  });

  it("refuse un type de champ inconnu à la publication", async () => {
    const field = {
      nodeId: "n1",
      propKey: "title",
      label: "Titre",
      type: "video",
      defaultValue: "",
      required: false,
      order: 0,
    };
    const res = await app.request(`/api/templates/${ID}/publish`, send("PUT", { editableFields: [field] }));
    expect(res.status).toBe(400);
    expect(paths(await errorOf(res))).toEqual(["editableFields.0.type"]);
  });

  it("refuse une page dont un composant n'a pas de type", async () => {
    const pages = [{ id: "p1", children: [{ id: "n1", props: {} }] }];
    const res = await app.request(`/api/templates/${ID}`, send("PUT", { pages }));
    expect(res.status).toBe(400);
    expect(paths(await errorOf(res))).toEqual(["pages.0.children.0.type"]);
  });

  it("refuse un nom de document vide", async () => {
    const res = await app.request(`/api/documents/${ID}`, send("PUT", { name: "   " }));
    expect(res.status).toBe(400);
    expect(paths(await errorOf(res))).toEqual(["name"]);
  });

  it("refuse la création d'un document sans template valide", async () => {
    const res = await app.request("/api/documents", send("POST", { templateId: "pas-un-id" }));
    expect(res.status).toBe(400);
    expect(paths(await errorOf(res))).toEqual(["templateId"]);
  });

  it("refuse une catégorie de preset inconnue", async () => {
    const preset = { baseType: "kpi-card", label: "KPI", defaultProps: {}, category: "autre" };
    const res = await app.request("/api/presets", send("POST", preset));
    expect(res.status).toBe(400);
    expect(paths(await errorOf(res))).toEqual(["category"]);
  });

  it("refuse un thème qui n'est pas un objet", async () => {
    const res = await app.request("/api/themes", send("POST", { name: "Sombre", theme: "noir" }));
    expect(res.status).toBe(400);
    expect(paths(await errorOf(res))).toEqual(["theme"]);
  });
});
