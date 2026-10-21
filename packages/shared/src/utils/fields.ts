import type { EditableField, PublishedVersion, Template, TemplateStatus } from "../types/template";
import type { Document, DocumentDisplayStatus, DocumentSnapshot } from "../types/document";
import type { PropValue, PropValues } from "../types/component";
import { findNode } from "./tree";

/** Clé d'un champ dans `Document.data` */
export function fieldKey(field: Pick<EditableField, "nodeId" | "propKey">): string {
  return `${field.nodeId}.${field.propKey}`;
}

/** Une valeur est considérée remplie si elle n'est ni vide ni une liste vide */
export function isFilled(value: PropValue | undefined): boolean {
  if (value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export interface Completion {
  total: number;
  filled: number;
  percent: number;
  missingRequired: EditableField[];
}

export function computeCompletion(fields: EditableField[], data: PropValues): Completion {
  const total = fields.length;
  const filled = fields.filter((f) => isFilled(data[fieldKey(f)])).length;
  const missingRequired = fields.filter((f) => f.required && !isFilled(data[fieldKey(f)]));
  return {
    total,
    filled,
    percent: total > 0 ? Math.round((filled / total) * 100) : 100,
    missingRequired,
  };
}

/** Applique les données saisies sur une copie du snapshot du template (ou de son aperçu) */
export function mergeDocumentData<T extends Pick<DocumentSnapshot, "pages" | "editableFields">>(
  snapshot: T,
  data: PropValues,
): T {
  const merged = structuredClone(snapshot);
  for (const field of merged.editableFields ?? []) {
    const value = data[fieldKey(field)];
    if (value === undefined) continue;
    for (const page of merged.pages) {
      const node = findNode(page.children, field.nodeId);
      if (node) {
        node.props[field.propKey] = value;
        break;
      }
    }
  }
  return merged;
}

/**
 * La valeur par défaut d'un champ est le contenu actuel du composant dans le template :
 * c'est ce que le document affiche tant que rien n'est saisi.
 */
export function withNodeDefaults(fields: EditableField[], pages: Template["pages"]): EditableField[] {
  return fields.map((field) => {
    for (const page of pages) {
      const node = findNode(page.children, field.nodeId);
      const current = node?.props[field.propKey];
      if (current !== undefined) return { ...field, defaultValue: current };
      if (node) return field;
    }
    return field;
  });
}

/** Fige l'état courant d'un template pour publication */
export function buildPublishedVersion(
  template: Pick<Template, "name" | "description" | "theme" | "pageFormat" | "pages" | "editableFields">,
): PublishedVersion {
  return structuredClone({
    name: template.name,
    description: template.description ?? undefined,
    theme: template.theme,
    pageFormat: template.pageFormat,
    pages: template.pages,
    editableFields: withNodeDefaults(template.editableFields, template.pages),
  });
}

/** Snapshot d'un template tel qu'utilisé par un document : la version publiée */
export function buildDocumentSnapshot(
  template: Pick<
    Template,
    "name" | "description" | "theme" | "pageFormat" | "pages" | "editableFields" | "publishedVersion"
  >,
): DocumentSnapshot {
  return structuredClone(template.publishedVersion ?? buildPublishedVersion(template));
}

export function templateStatus(t: Pick<Template, "published" | "publishedAt" | "updatedAt">): TemplateStatus {
  if (!t.published) return "draft";
  if (t.publishedAt && new Date(t.updatedAt).getTime() > new Date(t.publishedAt).getTime() + 1000) {
    return "published-with-changes";
  }
  return "published";
}

export function documentDisplayStatus(d: Pick<Document, "status" | "exportedAt" | "updatedAt">): DocumentDisplayStatus {
  if (d.status !== "finalized") return "draft";
  if (d.exportedAt && new Date(d.updatedAt).getTime() > new Date(d.exportedAt).getTime() + 1000) {
    return "modified-after-export";
  }
  return "finalized";
}
