// templates-store.ts — conserve uniquement les actions de mutation.
// Le chargement des listes/détails est géré par TanStack Query (queryKeys.templates).
import { api } from "@/api/client";
import type { Template } from "@template-generator/shared/types/template";

export async function duplicateTemplate(id: string): Promise<Template> {
  const source = await api.templates.get(id);
  return api.templates.create({
    name:           `${source.name} (copie)`,
    description:    source.description,
    theme:          source.theme,
    pageFormat:     source.pageFormat,
    pages:          source.pages,
    published:      false,
    editableFields: [],
    tags:           [],
  });
}
