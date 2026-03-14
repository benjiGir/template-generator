export const queryKeys = {
  templates: {
    list: (filters?: { published?: boolean }) =>
      ["templates", "list", filters ?? {}] as const,
    detail: (id: string) => ["templates", "detail", id] as const,
  },
  documents: {
    list: () => ["documents", "list"] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
  },
  presets: {
    list: () => ["presets", "list"] as const,
  },
  themes: {
    list: () => ["themes", "list"] as const,
  },
} as const;
