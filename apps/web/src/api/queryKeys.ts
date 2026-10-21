/**
 * Clés du cache TanStack Query, hiérarchiques : invalider `templates.lists()` rafraîchit
 * toutes les listes de templates (Atelier et Studio), quel que soit le filtre.
 */
export const queryKeys = {
  templates: {
    lists: () => ["templates", "list"] as const,
    list: (filters?: { published?: boolean }) => ["templates", "list", filters ?? {}] as const,
    detail: (id: string) => ["templates", "detail", id] as const,
  },
  documents: {
    lists: () => ["documents", "list"] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
  },
  presets: {
    lists: () => ["presets", "list"] as const,
    detail: (id: string) => ["presets", "detail", id] as const,
  },
  themes: {
    lists: () => ["themes", "list"] as const,
  },
};
