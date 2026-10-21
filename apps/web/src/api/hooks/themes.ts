import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BUILTIN_THEMES } from "@template-generator/shared/themes/presets";
import { api, type ThemeRecord } from "../client";
import { cache } from "../cache";
import { queryKeys } from "../queryKeys";

/** Thèmes fournis avec l'application, affichés le temps que la liste du serveur arrive */
const BUILTIN_PLACEHOLDER: ThemeRecord[] = BUILTIN_THEMES.map((theme, i) => ({
  id: String(i),
  name: theme.name,
  theme,
  isBuiltin: true,
  createdAt: "",
}));

export function useThemes() {
  return useQuery({
    queryKey: queryKeys.themes.lists(),
    queryFn: () => api.themes.list(),
    placeholderData: BUILTIN_PLACEHOLDER,
  });
}

export function useCreateTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.themes.create>[0]) => api.themes.create(body),
    onSuccess: () => cache.themesChanged(qc),
    meta: { errorMessage: "L'enregistrement du thème a échoué." },
  });
}

export function useDeleteTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.themes.delete(id),
    onSuccess: () => cache.themesChanged(qc),
    meta: { errorMessage: "La suppression du thème a échoué." },
  });
}
