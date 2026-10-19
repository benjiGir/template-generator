import type { Template, EditableField, Theme, PageFormat, TemplatePage } from "@template-generator/shared/types/template";
import type { ComponentPreset, Document } from "@template-generator/shared/types/document";

export interface ThemeRecord {
  id: string;
  name: string;
  theme: Theme;
  isBuiltin: boolean;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(public status: number, path: string) {
    super(`API ${status}: ${path}`);
  }
}

const BASE_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new ApiError(res.status, path);
  return res.json() as Promise<T>;
}

/** Première page seulement : de quoi dessiner une miniature */
export interface PagePreview {
  theme: Theme;
  pageFormat: PageFormat;
  pages: TemplatePage[];
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string | null;
  published: boolean;
  publishedAt: string | null;
  editableFields?: EditableField[];
  /** Version publiée pour le Studio, état de travail pour l'Atelier */
  preview: PagePreview | null;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSummary {
  id: string;
  templateId: string | null;
  templateName: string | null;
  name: string;
  status: "draft" | "finalized";
  completionPercent: number;
  exportedAt: string | null;
  preview: PagePreview & { editableFields: EditableField[] };
  data: Record<string, unknown>;
  updatedAt: string;
  createdAt: string;
}

export type TemplateWritable = Pick<Template, "name" | "description" | "theme" | "pageFormat" | "pages" | "editableFields" | "tags">;

export const api = {
  templates: {
    list: (filters?: { published?: boolean }) => {
      const qs = filters?.published !== undefined ? `?published=${filters.published}` : "";
      return request<TemplateSummary[]>(`/api/templates${qs}`);
    },
    get: (id: string) => request<Template>(`/api/templates/${id}`),
    create: (data: TemplateWritable) =>
      request<Template>("/api/templates", { method: "POST", body: JSON.stringify(data) }),
    duplicate: (id: string) => request<Template>(`/api/templates/${id}/duplicate`, { method: "POST" }),
    update: (id: string, data: Partial<TemplateWritable>) =>
      request<Template>(`/api/templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    publish: (id: string, data: { editableFields: EditableField[] }) =>
      request<Template>(`/api/templates/${id}/publish`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ ok: boolean }>(`/api/templates/${id}`, { method: "DELETE" }),
  },
  presets: {
    list: () => request<ComponentPreset[]>("/api/presets"),
    get: (id: string) => request<ComponentPreset>(`/api/presets/${id}`),
    duplicate: (id: string) => request<ComponentPreset>(`/api/presets/${id}/duplicate`, { method: "POST" }),
    create: (data: Omit<ComponentPreset, "id" | "createdAt">) =>
      request<ComponentPreset>("/api/presets", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ComponentPreset>) =>
      request<ComponentPreset>(`/api/presets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ ok: boolean }>(`/api/presets/${id}`, { method: "DELETE" }),
  },
  documents: {
    list: () => request<DocumentSummary[]>("/api/documents"),
    get: (id: string) => request<Document>(`/api/documents/${id}`),
    /** Le serveur fige la version publiée du template dans le document */
    create: (data: { templateId: string; name?: string }) =>
      request<Document>("/api/documents", { method: "POST", body: JSON.stringify(data) }),
    duplicate: (id: string) => request<Document>(`/api/documents/${id}/duplicate`, { method: "POST" }),
    rename: (id: string, name: string) =>
      request<Document>(`/api/documents/${id}`, { method: "PUT", body: JSON.stringify({ name }) }),
    updateData: (id: string, data: Record<string, unknown>) =>
      request<Document>(`/api/documents/${id}/data`, { method: "PUT", body: JSON.stringify({ data }) }),
    markExported: (id: string) =>
      request<Document>(`/api/documents/${id}/export`, { method: "PUT", body: JSON.stringify({}) }),
    delete: (id: string) => request<{ ok: boolean }>(`/api/documents/${id}`, { method: "DELETE" }),
  },
  themes: {
    list: () => request<ThemeRecord[]>("/api/themes"),
    create: (data: { name: string; theme: Theme }) =>
      request<ThemeRecord>("/api/themes", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean }>(`/api/themes/${id}`, { method: "DELETE" }),
  },
};
