import { describe, it, expect } from "vitest";
import {
  fieldKey,
  isFilled,
  computeCompletion,
  mergeDocumentData,
  buildDocumentSnapshot,
  buildPublishedVersion,
  templateStatus,
  documentDisplayStatus,
} from "./fields";
import type { EditableField, Template } from "../types/template";
import { DEFAULT_THEME, DEFAULT_PAGE_FORMAT } from "../types/template";

function field(nodeId: string, propKey: string, required = false): EditableField {
  return { nodeId, propKey, label: propKey, type: "text", defaultValue: "", required, order: 0 };
}

function template(overrides: Partial<Template> = {}): Template {
  return {
    id: "t1",
    name: "Brouillon",
    description: null,
    theme: DEFAULT_THEME,
    pageFormat: DEFAULT_PAGE_FORMAT,
    pages: [{ id: "p1", children: [{ id: "n1", type: "title-block", props: { title: "Défaut" } }] }],
    published: false,
    publishedAt: null,
    publishedVersion: null,
    editableFields: [field("n1", "title")],
    tags: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("isFilled", () => {
  it("rejette vide, espaces et listes vides", () => {
    expect(isFilled(undefined)).toBe(false);
    expect(isFilled("  ")).toBe(false);
    expect(isFilled([])).toBe(false);
  });
  it("accepte texte, nombre et liste non vide", () => {
    expect(isFilled("a")).toBe(true);
    expect(isFilled(0)).toBe(true);
    expect(isFilled(["x"])).toBe(true);
  });
});

describe("computeCompletion", () => {
  it("compte les champs remplis et les obligatoires manquants", () => {
    const fields = [field("a", "x", true), field("b", "y"), field("c", "z", true)];
    const res = computeCompletion(fields, { "a.x": "ok", "c.z": "" });
    expect(res.filled).toBe(1);
    expect(res.percent).toBe(33);
    expect(res.missingRequired.map(fieldKey)).toEqual(["c.z"]);
  });
  it("vaut 100 % sans champ", () => {
    expect(computeCompletion([], {}).percent).toBe(100);
  });
});

describe("mergeDocumentData", () => {
  it("applique les données sans muter le snapshot", () => {
    const snap = buildDocumentSnapshot(template());
    const merged = mergeDocumentData(snap, { "n1.title": "Q3 2026" });
    expect(merged.pages[0]?.children[0]?.props["title"]).toBe("Q3 2026");
    expect(snap.pages[0]?.children[0]?.props["title"]).toBe("Défaut");
  });
});

describe("buildDocumentSnapshot", () => {
  it("utilise la version publiée plutôt que l'état de travail", () => {
    const t = template({
      name: "Travail en cours",
      published: true,
      publishedVersion: {
        name: "Publié",
        theme: DEFAULT_THEME,
        pageFormat: DEFAULT_PAGE_FORMAT,
        pages: [],
        editableFields: [],
      },
    });
    const snap = buildDocumentSnapshot(t);
    expect(snap.name).toBe("Publié");
    expect(snap.pages).toEqual([]);
    // Le snapshot ne garde que la version publiée, pas l'état de travail du template
    expect(snap).not.toHaveProperty("published");
  });
});

describe("buildPublishedVersion", () => {
  it("prend la valeur par défaut des champs dans le composant", () => {
    const version = buildPublishedVersion(
      template({ editableFields: [{ ...field("n1", "title"), defaultValue: "" }] }),
    );
    expect(version.editableFields[0]?.defaultValue).toBe("Défaut");
  });
});

describe("statuts", () => {
  it("détecte un template modifié après publication", () => {
    expect(templateStatus({ published: false, publishedAt: null, updatedAt: "2026-01-02T00:00:00Z" })).toBe("draft");
    expect(
      templateStatus({ published: true, publishedAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" }),
    ).toBe("published");
    expect(
      templateStatus({ published: true, publishedAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z" }),
    ).toBe("published-with-changes");
  });
  it("détecte un document modifié après export", () => {
    expect(documentDisplayStatus({ status: "draft", exportedAt: null, updatedAt: "2026-01-02T00:00:00Z" })).toBe(
      "draft",
    );
    expect(
      documentDisplayStatus({
        status: "finalized",
        exportedAt: "2026-01-02T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
      }),
    ).toBe("finalized");
    expect(
      documentDisplayStatus({
        status: "finalized",
        exportedAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z",
      }),
    ).toBe("modified-after-export");
  });
});
