import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PAGE_FORMAT,
  DEFAULT_THEME,
  type ComponentNode,
  type Template,
} from "@template-generator/shared/types/template";
import { useEditorStore } from "./editor-store";

const store = useEditorStore;

function node(id: string, title = id, children?: ComponentNode[]): ComponentNode {
  return { id, type: "title-block", props: { title }, ...(children ? { children } : {}) };
}

function template(pages: ComponentNode[][] = [[node("a"), node("b"), node("c")]]): Template {
  return {
    id: "tpl-1",
    name: "Rapport",
    description: null,
    theme: DEFAULT_THEME,
    pageFormat: DEFAULT_PAGE_FORMAT,
    pages: pages.map((children, i) => ({ id: `p${i + 1}`, label: `Page ${i + 1}`, children })),
    editableFields: [],
    tags: [],
    published: false,
    publishedAt: null,
    publishedVersion: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

/** Identifiants des composants d'une page, enfants compris */
function ids(pageIndex = 0): string[] {
  const walk = (nodes: ComponentNode[]): string[] => nodes.flatMap((n) => [n.id, ...walk(n.children ?? [])]);
  return walk(store.getState().template?.pages[pageIndex]?.children ?? []);
}

function titleOf(id: string): unknown {
  return store.getState().template?.pages[0]?.children.find((n) => n.id === id)?.props["title"];
}

beforeEach(() => store.getState().loadTemplate(template()));

describe("chargement et révisions", () => {
  it("complète un thème partiel avec les valeurs par défaut", () => {
    const partial = template();
    partial.theme = { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, primary: "#ff0000" } };
    store.getState().loadTemplate(partial);
    expect(store.getState().template?.theme.colors.primary).toBe("#ff0000");
    expect(store.getState().template?.theme.typography).toEqual(DEFAULT_THEME.typography);
  });

  it("compte une révision par modification ; markSaved ne recule jamais", () => {
    const s = store.getState();
    s.updateNodeProps("a", { title: "A1" });
    s.updateNodeProps("a", { title: "A2" });
    expect(store.getState().revision).toBe(2);
    s.markSaved(2);
    s.markSaved(1); // réponse d'une requête plus ancienne, arrivée en retard
    expect(store.getState().savedRevision).toBe(2);
  });

  it("n'applique de l'état serveur que la publication, pas le contenu", () => {
    store.getState().updateNodeProps("a", { title: "Modifié localement" });
    const server = { ...template(), published: true, publishedAt: "2026-02-01T00:00:00.000Z" };
    store.getState().applyServerState(server);
    expect(store.getState().template?.published).toBe(true);
    expect(titleOf("a")).toBe("Modifié localement");

    store.getState().applyServerState({ ...server, id: "autre", published: false });
    expect(store.getState().template?.published).toBe(true);
  });
});

describe("annuler / rétablir", () => {
  it("annule et rétablit les modifications une à une", () => {
    const s = store.getState();
    s.updateNodeProps("a", { title: "A1" });
    s.updateNodeProps("a", { title: "A2" });

    s.undo();
    expect(titleOf("a")).toBe("A1");
    s.undo();
    expect(titleOf("a")).toBe("a");
    s.undo(); // rien avant le chargement
    expect(titleOf("a")).toBe("a");

    s.redo();
    expect(titleOf("a")).toBe("A1");
    s.redo();
    expect(titleOf("a")).toBe("A2");
    s.redo(); // rien après la dernière modification
    expect(titleOf("a")).toBe("A2");
  });

  it("abandonne ce qui pouvait être rétabli après une nouvelle modification", () => {
    const s = store.getState();
    s.updateNodeProps("a", { title: "A1" });
    s.updateNodeProps("a", { title: "A2" });
    s.undo();
    s.updateNodeProps("b", { title: "B1" });
    s.redo();
    expect(titleOf("a")).toBe("A1");
    expect(titleOf("b")).toBe("B1");
  });

  it("annule aussi les opérations de structure", () => {
    const s = store.getState();
    s.removeNode(0, "b");
    s.addPage();
    expect(ids()).toEqual(["a", "c"]);
    expect(store.getState().template?.pages).toHaveLength(2);
    s.undo();
    expect(store.getState().template?.pages).toHaveLength(1);
    s.undo();
    expect(ids()).toEqual(["a", "b", "c"]);
  });

  it("compte une révision à chaque annulation : elle sera sauvegardée", () => {
    const s = store.getState();
    s.updateNodeProps("a", { title: "A1" });
    s.undo();
    expect(store.getState().revision).toBe(2);
  });

  it("garde les 50 dernières étapes", () => {
    const s = store.getState();
    for (let i = 1; i <= 60; i++) s.updateNodeProps("a", { title: `A${i}` });
    for (let i = 0; i < 100; i++) s.undo();
    expect(titleOf("a")).toBe("A10");
  });
});

describe("déplacements et composants", () => {
  it("réordonne un composant dans sa page", () => {
    store.getState().moveNode(0, 0, "a", null, 2);
    expect(ids()).toEqual(["b", "c", "a"]);
  });

  it("place un composant dans un conteneur, puis l'en sort", () => {
    store.getState().loadTemplate(template([[node("row", "row", []), node("k")]]));
    store.getState().moveNode(0, 0, "k", "row", 0);
    expect(store.getState().template?.pages[0]?.children[0]?.children?.map((n) => n.id)).toEqual(["k"]);
    store.getState().moveNode(0, 0, "k", null, 0);
    expect(ids()).toEqual(["k", "row"]);
  });

  it("déplace un composant d'une page à l'autre", () => {
    store.getState().loadTemplate(template([[node("a"), node("b")], [node("x")]]));
    store.getState().moveNode(0, 1, "b", null, 1);
    expect(ids(0)).toEqual(["a"]);
    expect(ids(1)).toEqual(["x", "b"]);
  });

  it("duplique un composant juste après lui, avec un nouvel identifiant", () => {
    store.getState().duplicateNode(0, "a");
    const pageIds = ids();
    expect(pageIds).toHaveLength(4);
    expect(pageIds[0]).toBe("a");
    expect(pageIds[1]).not.toBe("a");
    expect(store.getState().template?.pages[0]?.children[1]?.props["title"]).toBe("a");
  });

  it("désélectionne le composant supprimé", () => {
    store.getState().selectNode("b");
    store.getState().removeNode(0, "b");
    expect(store.getState().selectedNodeId).toBeNull();
  });

  it("sélectionne le composant ajouté", () => {
    store.getState().addNode(0, null, 1, node("new"));
    expect(ids()).toEqual(["a", "new", "b", "c"]);
    expect(store.getState().selectedNodeId).toBe("new");
  });
});

describe("pages", () => {
  it("garde toujours au moins une page", () => {
    store.getState().removePage(0);
    expect(store.getState().template?.pages).toHaveLength(1);
  });

  it("ajoute une page et la sélectionne ; en supprimer une recale la sélection", () => {
    const s = store.getState();
    s.addPage();
    expect(store.getState().selectedPageIndex).toBe(1);
    s.removePage(1);
    expect(store.getState().selectedPageIndex).toBe(0);
  });

  it("renomme une page sans créer d'étape si le nom ne change pas", () => {
    const s = store.getState();
    s.renamePage(0, "Page 1");
    expect(store.getState().revision).toBe(0);
    s.renamePage(0, "Synthèse");
    expect(store.getState().template?.pages[0]?.label).toBe("Synthèse");
  });
});
