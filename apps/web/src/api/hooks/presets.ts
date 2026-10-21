import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type PresetWritable } from "../client";
import { cache } from "../cache";
import { queryKeys } from "../queryKeys";

export function usePresets() {
  return useQuery({
    queryKey: queryKeys.presets.lists(),
    queryFn: () => api.presets.list(),
  });
}

export function usePreset(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.presets.detail(id),
    queryFn: () => api.presets.get(id),
    enabled: options?.enabled,
  });
}

/** Crée un preset, ou enregistre celui qu'on modifie quand `id` est fourni */
export function useSavePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: PresetWritable & { id?: string | null }) =>
      id ? api.presets.update(id, body) : api.presets.create(body),
    onSuccess: (preset) => cache.presetsChanged(qc, preset),
    meta: { errorMessage: "L'enregistrement du preset a échoué." },
  });
}

export function useDuplicatePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.presets.duplicate(id),
    onSuccess: () => cache.presetsChanged(qc),
    meta: { errorMessage: "La copie du preset a échoué." },
  });
}

export function useDeletePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.presets.delete(id),
    onSuccess: () => cache.presetsChanged(qc),
    meta: { errorMessage: "La suppression du preset a échoué." },
  });
}
