import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PAGE_FORMAT, DEFAULT_THEME } from "@template-generator/shared/types/template";
import type { Document, DocumentSnapshot } from "@template-generator/shared/types/document";
import { useDocumentStore } from "./document-store";

const store = useDocumentStore;

const snapshot: DocumentSnapshot = {
  name: "Rapport",
  theme: DEFAULT_THEME,
  pageFormat: DEFAULT_PAGE_FORMAT,
  pages: [{ id: "p1", children: [{ id: "tb", type: "title-block", props: { title: "Rapport", subtitle: "Mois" } }] }],
  // Ordre volontairement mélangé, et une valeur par défaut absente (document ancien)
  editableFields: [
    { nodeId: "tb", propKey: "title", label: "Titre", type: "text", defaultValue: "", required: false, order: 1 },
    { nodeId: "tb", propKey: "subtitle", label: "Mois", type: "text", defaultValue: "", required: true, order: 0 },
  ],
};

function doc(overrides: Partial<Document> = {}): Document {
  return {
    id: "doc-1",
    templateId: "tpl-1",
    name: "Mars",
    data: { "tb.title": "Bilan" },
    templateSnapshot: snapshot,
    status: "draft",
    completionPercent: 50,
    exportedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => store.getState().loadDocument(doc()));

describe("document en cours de saisie", () => {
  it("ordonne les champs et relit leur valeur par défaut dans le template", () => {
    const fields = store.getState().editableFields;
    expect(fields.map((f) => f.propKey)).toEqual(["subtitle", "title"]);
    expect(fields[0]?.defaultValue).toBe("Mois");
  });

  it("enregistre une saisie ; un champ vidé reprend le contenu du template", () => {
    const s = store.getState();
    s.updateField("tb.subtitle", "Mars 2026");
    expect(store.getState().data).toEqual({ "tb.title": "Bilan", "tb.subtitle": "Mars 2026" });
    s.updateField("tb.title", "   ");
    expect(store.getState().data).toEqual({ "tb.subtitle": "Mars 2026" });
    expect(store.getState().revision).toBe(2);
  });

  it("montre la saisie dans le document sans modifier le template", () => {
    store.getState().updateField("tb.subtitle", "Mars 2026");
    const merged = store.getState().getMergedTemplate();
    expect(merged?.pages[0]?.children[0]?.props).toEqual({ title: "Bilan", subtitle: "Mars 2026" });
    expect(snapshot.pages[0]?.children[0]?.props["subtitle"]).toBe("Mois");
  });

  it("prend le statut venu du serveur sans écraser une saisie plus récente", () => {
    store.getState().updateField("tb.subtitle", "Saisie locale");
    store.getState().applyServerState(doc({ status: "finalized", completionPercent: 100, data: {} }));
    expect(store.getState().document?.status).toBe("finalized");
    expect(store.getState().document?.data).toEqual(store.getState().data);
    expect(store.getState().data["tb.subtitle"]).toBe("Saisie locale");

    store.getState().applyServerState(doc({ id: "autre", status: "draft" }));
    expect(store.getState().document?.status).toBe("finalized");
  });

  it("ne recule pas la révision sauvegardée", () => {
    store.getState().markSaved(3);
    store.getState().markSaved(2);
    expect(store.getState().savedRevision).toBe(3);
  });
});
