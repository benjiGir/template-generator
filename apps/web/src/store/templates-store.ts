import { create } from "zustand";
import { api } from "@/api/client";
import type { TemplateSummary } from "@/api/client";
import type { Template } from "@template-generator/shared/types/template";

interface TemplatesState {
  templates: TemplateSummary[];
  loading: boolean;
  error: string | null;

  fetchTemplates: () => Promise<void>;
  createTemplate: (data: Omit<Template, "id" | "createdAt" | "updatedAt">) => Promise<Template>;
  duplicateTemplate: (id: string) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplatesStore = create<TemplatesState>()((set, get) => ({
  templates: [],
  loading: false,
  error: null,

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const templates = await api.templates.list();
      set({ templates, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  createTemplate: async (data) => {
    const created = await api.templates.create(data);
    await get().fetchTemplates();
    return created;
  },

  duplicateTemplate: async (id) => {
    const full = await api.templates.get(id);
    const copy = await api.templates.create({
      name: `${full.name} (copie)`,
      description: full.description,
      theme: full.theme,
      pageFormat: full.pageFormat,
      pages: full.pages,
    });
    await get().fetchTemplates();
    return copy;
  },

  deleteTemplate: async (id) => {
    await api.templates.delete(id);
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
  },
}));
