import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import "@template-generator/component-registry/components";
import { get } from "@template-generator/component-registry/registry";
import { ICONS } from "@template-generator/component-registry/icons";
import { isPropValues, isValueOfType } from "@template-generator/shared/utils/prop-values";
import type { ComponentNode, EditableField, TemplatePage } from "@template-generator/shared/types/template";
import { PROP_TYPES, type PropType, type PropValues } from "@template-generator/shared/types/component";

/*
 * Les jeux de données du seed (apps/api/src/seed/data) confrontés au registre de composants.
 * Le seed vérifie la forme des fichiers ; ce test vérifie qu'ils décrivent des documents que
 * l'application sait afficher : composants connus, props du bon type, champs qui existent.
 */

const DATA = join(import.meta.dirname, "../../api/src/seed/data");

interface SeedTemplate {
  name: string;
  published: boolean;
  pages: TemplatePage[];
  editableFields: EditableField[];
}
interface SeedDocument {
  template: string;
  name: string;
  data: PropValues;
}

interface SeedPreset {
  baseType: string;
  label: string;
  defaultProps: PropValues;
}

// Gardes de type : les fichiers sont lus comme `unknown`, leur forme est vérifiée avant usage
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isNode(value: unknown): value is ComponentNode {
  return (
    isRecord(value) &&
    typeof value["id"] === "string" &&
    typeof value["type"] === "string" &&
    isPropValues(value["props"]) &&
    (value["children"] === undefined || (Array.isArray(value["children"]) && value["children"].every(isNode)))
  );
}
function isPropType(value: unknown): value is PropType {
  return PROP_TYPES.some((type) => type === value);
}
function isField(value: unknown): value is EditableField {
  return (
    isRecord(value) &&
    typeof value["nodeId"] === "string" &&
    typeof value["propKey"] === "string" &&
    isPropType(value["type"])
  );
}
function isTemplate(value: unknown): value is SeedTemplate {
  return (
    isRecord(value) &&
    typeof value["name"] === "string" &&
    typeof value["published"] === "boolean" &&
    Array.isArray(value["pages"]) &&
    value["pages"].every(
      (page) => isRecord(page) && Array.isArray(page["children"]) && page["children"].every(isNode),
    ) &&
    Array.isArray(value["editableFields"]) &&
    value["editableFields"].every(isField)
  );
}
function isDocument(value: unknown): value is SeedDocument {
  return (
    isRecord(value) &&
    typeof value["template"] === "string" &&
    typeof value["name"] === "string" &&
    isPropValues(value["data"])
  );
}
function isPreset(value: unknown): value is SeedPreset {
  return (
    isRecord(value) &&
    typeof value["baseType"] === "string" &&
    typeof value["label"] === "string" &&
    isPropValues(value["defaultProps"])
  );
}

/** Lit un fichier JSON et vérifie sa forme ; un fichier mal formé fait échouer le test avec son nom */
function readJson<T>(path: string, guard: (value: unknown) => value is T): T {
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!guard(value)) throw new Error(`${path} : forme inattendue`);
  return value;
}

function readList<T>(path: string, guard: (value: unknown) => value is T): T[] {
  return readJson(path, (value): value is T[] => Array.isArray(value) && value.every(guard));
}

function walk(
  nodes: ComponentNode[],
  visit: (node: ComponentNode, parent: ComponentNode | null) => void,
  parent: ComponentNode | null = null,
) {
  for (const node of nodes) {
    visit(node, parent);
    walk(node.children ?? [], visit, node);
  }
}

/** Problèmes d'un template : une ligne par erreur, vide si tout va bien */
function templateProblems(template: SeedTemplate): string[] {
  const problems: string[] = [];
  const nodes = new Map<string, ComponentNode>();
  for (const page of template.pages) {
    walk(page.children, (node, parent) => {
      const where = `${template.name} › ${node.id}`;
      if (nodes.has(node.id)) problems.push(`${where} : identifiant en double`);
      nodes.set(node.id, node);
      const def = get(node.type);
      if (!def) return problems.push(`${where} : composant inconnu « ${node.type} »`);
      for (const [key, value] of Object.entries(node.props)) {
        const prop = def.schema.find((p) => p.key === key);
        if (!prop) problems.push(`${where} : prop inconnue « ${key} »`);
        else if (!isValueOfType(prop.type, value))
          problems.push(`${where} : « ${key} » n'est pas du type ${prop.type}`);
        else if (prop.options && !prop.options.some((o) => o.value === value))
          problems.push(`${where} : « ${key} » = ${JSON.stringify(value)} hors des options`);
        else if (prop.type === "icon" && typeof value === "string" && !ICONS.has(value))
          problems.push(`${where} : icône « ${value} » absente de la liste`);
      }
      const children = node.children ?? [];
      if (children.length > 0 && !def.acceptsChildren) problems.push(`${where} : n'accepte pas d'enfants`);
      if (def.maxChildren !== undefined && children.length > def.maxChildren)
        problems.push(`${where} : ${children.length} enfants pour ${def.maxChildren} au plus`);
      if (parent) {
        const allowed = get(parent.type)?.allowedChildren;
        if (allowed && !allowed.includes(node.type)) problems.push(`${where} : interdit dans « ${parent.type} »`);
      }
    });
  }
  for (const field of template.editableFields) {
    const node = nodes.get(field.nodeId);
    const prop = node ? get(node.type)?.schema.find((p) => p.key === field.propKey) : undefined;
    if (!prop) problems.push(`${template.name} › champ ${field.nodeId}.${field.propKey} : aucune prop correspondante`);
    else if (prop.type !== field.type)
      problems.push(
        `${template.name} › champ ${field.nodeId}.${field.propKey} : ${field.type} au lieu de ${prop.type}`,
      );
  }
  if (template.published && template.editableFields.length === 0) problems.push(`${template.name} : publié sans champ`);
  return problems;
}

const SETS = readdirSync(DATA, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe.each(SETS)("jeu de données « %s »", (set) => {
  const dir = join(DATA, set);
  const templates = readdirSync(join(dir, "templates")).map((file) =>
    readJson(join(dir, "templates", file), isTemplate),
  );

  it("ne décrit que des composants, props et champs que l'application connaît", () => {
    expect(templates.flatMap(templateProblems)).toEqual([]);
  });

  it("remplit les documents avec les champs de templates publiés", () => {
    const byName = new Map(templates.map((t) => [t.name, t]));
    const problems: string[] = [];
    for (const doc of readList(join(dir, "documents.json"), isDocument)) {
      const template = byName.get(doc.template);
      if (!template?.published) {
        problems.push(`${doc.name} : template « ${doc.template} » absent ou non publié`);
        continue;
      }
      const fields = new Map(template.editableFields.map((f) => [`${f.nodeId}.${f.propKey}`, f]));
      for (const [key, value] of Object.entries(doc.data)) {
        const field = fields.get(key);
        if (!field) problems.push(`${doc.name} : « ${key} » n'est pas un champ du template`);
        else if (!isValueOfType(field.type, value))
          problems.push(`${doc.name} : « ${key} » n'est pas du type ${field.type}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("règle des presets sur des composants et props existants", () => {
    const problems: string[] = [];
    for (const preset of readList(join(dir, "presets.json"), isPreset)) {
      const def = get(preset.baseType);
      if (!def) {
        problems.push(`${preset.label} : composant inconnu « ${preset.baseType} »`);
        continue;
      }
      for (const [key, value] of Object.entries(preset.defaultProps)) {
        const prop = def.schema.find((p) => p.key === key);
        if (!prop || !isValueOfType(prop.type, value)) problems.push(`${preset.label} : « ${key} » invalide`);
      }
    }
    expect(problems).toEqual([]);
  });
});
