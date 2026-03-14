import { describe, it, expect } from "vitest";
import {
  findNode,
  findParent,
  removeNode,
  insertNode,
  moveNode,
  duplicateNode,
  generateNodeId,
} from "./tree";
import type { ComponentNode } from "../types/template";

function node(id: string, children?: ComponentNode[]): ComponentNode {
  return { id, type: "test", props: {}, children };
}

const TREE: ComponentNode[] = [
  node("a", [node("a1"), node("a2")]),
  node("b"),
  node("c", [node("c1", [node("c1a")])]),
];

describe("findNode", () => {
  it("trouve un noeud racine", () => {
    expect(findNode(TREE, "b")?.id).toBe("b");
  });

  it("trouve un noeud imbriqué", () => {
    expect(findNode(TREE, "a2")?.id).toBe("a2");
  });

  it("trouve un noeud profondément imbriqué", () => {
    expect(findNode(TREE, "c1a")?.id).toBe("c1a");
  });

  it("retourne null si introuvable", () => {
    expect(findNode(TREE, "z")).toBeNull();
  });
});

describe("findParent", () => {
  it("retourne null pour un noeud racine", () => {
    const result = findParent(TREE, "a");
    expect(result?.parent).toBeNull();
    expect(result?.index).toBe(0);
  });

  it("retourne le parent d'un noeud enfant", () => {
    const result = findParent(TREE, "a1");
    expect(result?.parent?.id).toBe("a");
    expect(result?.index).toBe(0);
  });

  it("retourne null si introuvable", () => {
    expect(findParent(TREE, "z")).toBeNull();
  });
});

describe("removeNode", () => {
  it("supprime un noeud racine", () => {
    const result = removeNode(TREE, "b");
    expect(result.find((n) => n.id === "b")).toBeUndefined();
    expect(result.length).toBe(2);
  });

  it("supprime un noeud enfant", () => {
    const result = removeNode(TREE, "a1");
    const aNode = result.find((n) => n.id === "a");
    expect(aNode?.children?.find((n) => n.id === "a1")).toBeUndefined();
    expect(aNode?.children?.length).toBe(1);
  });

  it("ne modifie pas l'arbre original", () => {
    removeNode(TREE, "b");
    expect(TREE.length).toBe(3);
  });
});

describe("insertNode", () => {
  it("insère à la racine", () => {
    const newNode = node("d");
    const result = insertNode(TREE, null, 1, newNode);
    expect(result[1]?.id).toBe("d");
    expect(result.length).toBe(4);
  });

  it("insère dans un parent existant", () => {
    const newNode = node("a3");
    const result = insertNode(TREE, "a", 2, newNode);
    const aNode = result.find((n) => n.id === "a");
    expect(aNode?.children?.[2]?.id).toBe("a3");
  });
});

describe("moveNode", () => {
  it("déplace un noeud racine vers une autre position", () => {
    const result = moveNode(TREE, "b", null, 0);
    expect(result[0]?.id).toBe("b");
  });

  it("déplace un noeud vers un parent", () => {
    const result = moveNode(TREE, "b", "a", 0);
    const aNode = result.find((n) => n.id === "a");
    expect(aNode?.children?.[0]?.id).toBe("b");
    expect(result.find((n) => n.id === "b")).toBeUndefined();
  });
});

describe("duplicateNode", () => {
  it("duplique un noeud racine", () => {
    const result = duplicateNode(TREE, "b");
    expect(result.length).toBe(4);
    const bNodes = result.filter((n) => n.type === "test");
    expect(bNodes.length).toBe(4);
  });

  it("duplique avec de nouveaux IDs", () => {
    const result = duplicateNode(TREE, "a");
    const aNodes = result.filter((n) => n.type === "test" && n.children?.length === 2);
    expect(aNodes.length).toBe(2);
    expect(aNodes[0]?.id).not.toBe(aNodes[1]?.id);
  });

  it("ne fait rien si le noeud n'existe pas", () => {
    const result = duplicateNode(TREE, "z");
    expect(result.length).toBe(TREE.length);
  });
});

describe("generateNodeId", () => {
  it("génère des IDs uniques", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateNodeId()));
    expect(ids.size).toBe(100);
  });

  it("commence par 'node-'", () => {
    expect(generateNodeId().startsWith("node-")).toBe(true);
  });
});
