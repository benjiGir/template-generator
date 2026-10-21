import { sql } from "drizzle-orm";
import { hc } from "hono/client";
import { DEFAULT_PAGE_FORMAT, DEFAULT_THEME } from "@template-generator/shared/types/template";
import type { ComponentNode, EditableField } from "@template-generator/shared/types/template";
import app, { type AppType } from "../app";
import { db } from "../db/connection";
import { testDatabaseUrl } from "./test-database";

/** Les tests sur base ne tournent que si une base de test est configurée */
export const hasTestDatabase = testDatabaseUrl() !== null;

/** Client typé de l'API, comme celui du front, branché directement sur l'application (sans réseau) */
export const client = hc<AppType>("http://test.local", {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => app.request(input, init),
}).api;

/** Vide toutes les tables : chaque test part d'une base vierge */
export async function resetDatabase() {
  await db.execute(sql`truncate table documents, templates, component_presets, themes restart identity cascade`);
}

/** Corps d'un template minimal : une page, un titre et un sous-titre */
export function templateBody(name = "Rapport mensuel", children: ComponentNode[] = defaultChildren()) {
  return {
    name,
    description: null,
    theme: DEFAULT_THEME,
    pageFormat: DEFAULT_PAGE_FORMAT,
    pages: [{ id: "page-1", label: "Page 1", children }],
    editableFields: [],
    tags: [],
  };
}

function defaultChildren(): ComponentNode[] {
  return [{ id: "tb", type: "title-block", props: { title: "Rapport", subtitle: "Mois" } }];
}

/** Champ remplissable sur une prop du template */
export function field(nodeId: string, propKey: string, required = false, order = 0): EditableField {
  return { nodeId, propKey, label: `${nodeId}.${propKey}`, type: "text", defaultValue: "", required, order };
}
