import { create } from "zustand";
import { api } from "@/api/client";
import type { ComponentPreset } from "@template-generator/shared/types/document";

interface PresetsState {
  presets: ComponentPreset[];
  loading: boolean;

  fetchPresets: () => Promise<void>;
  createPreset: (data: Omit<ComponentPreset, "id" | "createdAt">) => Promise<ComponentPreset>;
  deletePreset: (id: string) => Promise<void>;
}

export const usePresetsStore = create<PresetsState>()((set) => ({
  presets: [],
  loading: false,

  fetchPresets: async () => {
    set({ loading: true });
    try {
      const presets = await api.presets.list();
      set({ presets, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createPreset: async (data) => {
    const created = await api.presets.create(data);
    set((s) => ({ presets: [...s.presets, created] }));
    return created;
  },

  deletePreset: async (id) => {
    await api.presets.delete(id);
    set((s) => ({ presets: s.presets.filter((p) => p.id !== id) }));
  },
}));
