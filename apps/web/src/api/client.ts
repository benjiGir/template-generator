import type { Template, EditableField, Theme } from "@template-generator/shared/types/template";
import type { ComponentPreset, Document } from "@template-generator/shared/types/document";

export interface ThemeRecord {
  id: string;
  name: string;
  theme: Theme;
  isBuiltin: boolean;
  createdAt: string;
}

const BASE_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string | null;
  published: boolean;
  editableFields?: EditableField[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSummary {
  id: string;
  templateId: string | null;
  name: string;
  status: "draft" | "finalized";
  completionPercent: number;
  updatedAt: string;
  createdAt: string;
}

export const api = {
  templates: {
    list: (filters?: { published?: boolean }) => {
      const qs = filters?.published !== undefined ? `?published=${filters.published}` : "";
      return request<TemplateSummary[]>(`/api/templates${qs}`);
    },
    get: (id: string) => request<Template>(`/api/templates/${id}`),
    create: (data: Omit<Template, "id" | "createdAt" | "updatedAt">) =>
      request<Template>("/api/templates", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>) =>
      request<Template>(`/api/templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    publish: (id: string, data: { editableFields: EditableField[]; tags?: string[] }) =>
      request<Template>(`/api/templates/${id}/publish`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ ok: boolean }>(`/api/templates/${id}`, { method: "DELETE" }),
  },
  presets: {
    list: () => request<ComponentPreset[]>("/api/presets"),
    create: (data: Omit<ComponentPreset, "id" | "createdAt">) =>
      request<ComponentPreset>("/api/presets", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ComponentPreset>) =>
      request<ComponentPreset>(`/api/presets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ ok: boolean }>(`/api/presets/${id}`, { method: "DELETE" }),
  },
  documents: {
    list: () => request<DocumentSummary[]>("/api/documents"),
    get: (id: string) => request<Document>(`/api/documents/${id}`),
    create: (data: { templateId: string; name: string; data: Record<string, unknown>; templateSnapshot: Template }) =>
      request<Document>("/api/documents", { method: "POST", body: JSON.stringify({ ...data, status: "draft", completionPercent: 0 }) }),
    updateData: (id: string, data: Record<string, unknown>) =>
      request<Document>(`/api/documents/${id}/data`, { method: "PUT", body: JSON.stringify({ data }) }),
    finalize: (id: string) =>
      request<Document>(`/api/documents/${id}/finalize`, { method: "PUT", body: JSON.stringify({}) }),
    delete: (id: string) => request<{ ok: boolean }>(`/api/documents/${id}`, { method: "DELETE" }),
  },
  themes: {
    list: () => request<ThemeRecord[]>("/api/themes"),
    create: (data: { name: string; theme: Theme }) =>
      request<ThemeRecord>("/api/themes", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean }>(`/api/themes/${id}`, { method: "DELETE" }),
  },
};
