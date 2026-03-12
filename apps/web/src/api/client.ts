import type { Template } from "@template-generator/shared/types/template";
import type { ComponentPreset } from "@template-generator/shared/types/document";

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
  createdAt: string;
  updatedAt: string;
}

export const api = {
  templates: {
    list: () => request<TemplateSummary[]>("/api/templates"),
    get: (id: string) => request<Template>(`/api/templates/${id}`),
    create: (data: Omit<Template, "id" | "createdAt" | "updatedAt">) =>
      request<Template>("/api/templates", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Template>) =>
      request<Template>(`/api/templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
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
};
