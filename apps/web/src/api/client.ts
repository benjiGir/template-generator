import { hc, parseResponse, type InferRequestType } from "hono/client";
import type { AppType } from "@template-generator/api";
import type { PropValues } from "@template-generator/shared/types/component";

// Vide par défaut : URLs relatives, relayées vers l'API par Vite (dev) ou nginx (Docker)
const BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

/**
 * Client typé depuis les routes de l'API : paramètres, corps et réponses suivent le code du serveur,
 * une divergence ne compile pas. `parseResponse` lève une `DetailedError` sur toute réponse en erreur.
 */
const client = hc<AppType>(BASE_URL).api;

export const api = {
  templates: {
    list: (filters?: { published?: boolean }) =>
      parseResponse(
        client.templates.$get({
          query: filters?.published === undefined ? {} : { published: filters.published ? "true" : "false" },
        }),
      ),
    get: (id: string) => parseResponse(client.templates[":id"].$get({ param: { id } })),
    create: (json: TemplateWritable) => parseResponse(client.templates.$post({ json })),
    duplicate: (id: string) => parseResponse(client.templates[":id"].duplicate.$post({ param: { id } })),
    update: (id: string, json: Partial<TemplateWritable>) =>
      parseResponse(client.templates[":id"].$put({ param: { id }, json })),
    publish: (id: string, json: InferRequestType<(typeof client.templates)[":id"]["publish"]["$put"]>["json"]) =>
      parseResponse(client.templates[":id"].publish.$put({ param: { id }, json })),
    delete: (id: string) => parseResponse(client.templates[":id"].$delete({ param: { id } })),
  },
  presets: {
    list: () => parseResponse(client.presets.$get()),
    get: (id: string) => parseResponse(client.presets[":id"].$get({ param: { id } })),
    duplicate: (id: string) => parseResponse(client.presets[":id"].duplicate.$post({ param: { id } })),
    create: (json: PresetWritable) => parseResponse(client.presets.$post({ json })),
    update: (id: string, json: Partial<PresetWritable>) =>
      parseResponse(client.presets[":id"].$put({ param: { id }, json })),
    delete: (id: string) => parseResponse(client.presets[":id"].$delete({ param: { id } })),
  },
  documents: {
    list: () => parseResponse(client.documents.$get()),
    get: (id: string) => parseResponse(client.documents[":id"].$get({ param: { id } })),
    /** Le serveur fige la version publiée du template dans le document */
    create: (json: { templateId: string; name?: string }) => parseResponse(client.documents.$post({ json })),
    duplicate: (id: string) => parseResponse(client.documents[":id"].duplicate.$post({ param: { id } })),
    rename: (id: string, name: string) =>
      parseResponse(client.documents[":id"].$put({ param: { id }, json: { name } })),
    updateData: (id: string, data: PropValues) =>
      parseResponse(client.documents[":id"].data.$put({ param: { id }, json: { data } })),
    markExported: (id: string) => parseResponse(client.documents[":id"].export.$put({ param: { id } })),
    delete: (id: string) => parseResponse(client.documents[":id"].$delete({ param: { id } })),
  },
  themes: {
    list: () => parseResponse(client.themes.$get()),
    create: (json: InferRequestType<typeof client.themes.$post>["json"]) =>
      parseResponse(client.themes.$post({ json })),
    delete: (id: string) => parseResponse(client.themes[":id"].$delete({ param: { id } })),
  },
};

/** Ce que l'Atelier envoie pour créer ou enregistrer un template */
export type TemplateWritable = InferRequestType<typeof client.templates.$post>["json"];
/** Ce que la Bibliothèque envoie pour créer ou modifier un preset */
export type PresetWritable = InferRequestType<typeof client.presets.$post>["json"];

/** Template dans les listes : version publiée pour le Studio, état de travail pour l'Atelier */
export type TemplateSummary = Awaited<ReturnType<typeof api.templates.list>>[number];
/** Document dans les listes, avec de quoi dessiner sa miniature */
export type DocumentSummary = Awaited<ReturnType<typeof api.documents.list>>[number];
export type ThemeRecord = Awaited<ReturnType<typeof api.themes.list>>[number];
