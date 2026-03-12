import type { ComponentNode } from "../types/template";

/** Trouve un noeud par ID dans l'arbre (récursif) */
export function findNode(nodes: ComponentNode[], id: string): ComponentNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Trouve le parent d'un noeud par ID */
export function findParent(
  nodes: ComponentNode[],
  id: string,
  parent: ComponentNode | null = null,
  parentIndex = 0
): { parent: ComponentNode | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;
    if (node.id === id) return { parent, index: i };
    if (node.children) {
      const result = findParent(node.children, id, node, i);
      if (result) return result;
    }
  }
  return null;
}

/** Supprime un noeud par ID et retourne le nouvel arbre */
export function removeNode(nodes: ComponentNode[], id: string): ComponentNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      children: node.children ? removeNode(node.children, id) : undefined,
    }));
}

/** Insère un noeud à une position donnée dans l'arbre */
export function insertNode(
  nodes: ComponentNode[],
  parentId: string | null,
  index: number,
  node: ComponentNode
): ComponentNode[] {
  if (parentId === null) {
    const result = [...nodes];
    result.splice(index, 0, node);
    return result;
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      const children = [...(n.children ?? [])];
      children.splice(index, 0, node);
      return { ...n, children };
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, parentId, index, node) };
    }
    return n;
  });
}

/** Déplace un noeud d'une position à une autre */
export function moveNode(
  nodes: ComponentNode[],
  nodeId: string,
  newParentId: string | null,
  newIndex: number
): ComponentNode[] {
  const node = findNode(nodes, nodeId);
  if (!node) return nodes;
  const without = removeNode(nodes, nodeId);
  return insertNode(without, newParentId, newIndex, node);
}

/** Deep clone d'un noeud avec nouveaux IDs */
function deepCloneWithNewIds(node: ComponentNode): ComponentNode {
  return {
    ...node,
    id: generateNodeId(),
    children: node.children?.map(deepCloneWithNewIds),
  };
}

/** Duplique un noeud (deep clone avec nouveaux IDs) */
export function duplicateNode(nodes: ComponentNode[], nodeId: string): ComponentNode[] {
  const node = findNode(nodes, nodeId);
  if (!node) return nodes;
  const parent = findParent(nodes, nodeId);
  const clone = deepCloneWithNewIds(node);
  const insertIndex = parent ? parent.index + 1 : nodes.length;
  const parentId = parent?.parent?.id ?? null;
  return insertNode(nodes, parentId, insertIndex, clone);
}

/** Génère un ID unique pour un nouveau noeud */
export function generateNodeId(): string {
  return `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}