import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type TemplateWritable } from "../client";
import { cache } from "../cache";
import { queryKeys } from "../queryKeys";

/** Templates de l'Atelier (état de travail) ou du Studio (`published: true`, version publiée) */
export function useTemplates(filters?: { published?: boolean }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.templates.list(filters),
    queryFn: () => api.templates.list(filters),
    enabled: options?.enabled,
  });
}

/** Template complet (aperçu en grand avant de le choisir) */
export function useTemplate(id: string) {
  return useQuery({
    queryKey: queryKeys.templates.detail(id),
    queryFn: () => api.templates.get(id),
  });
}

/**
 * Template ouvert dans l'Atelier : relu du serveur à chaque entrée dans le parcours,
 * jamais en arrière-plan (l'état édité vit dans le store, pas dans le cache).
 */
export function useTemplateForEditing(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.templates.detail(id ?? ""),
    // Sans identifiant, pas de requête
    queryFn: id ? () => api.templates.get(id) : skipToken,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TemplateWritable) => api.templates.create(body),
    onSuccess: () => cache.templatesAddedOrRemoved(qc),
    meta: { errorMessage: "La création du template a échoué." },
  });
}

export function useDuplicateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.duplicate(id),
    onSuccess: () => cache.templatesAddedOrRemoved(qc),
    meta: { errorMessage: "La copie du template a échoué." },
  });
}

export function usePublishTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Parameters<typeof api.templates.publish>[1] & { id: string }) =>
      api.templates.publish(id, body),
    onSuccess: (template) => cache.templateChanged(qc, template),
    meta: { errorMessage: "La publication a échoué. Le template n'a pas été modifié dans le Studio." },
  });
}

/** Les documents du template sont détachés, pas supprimés */
export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.delete(id),
    onSuccess: () => cache.templatesAddedOrRemoved(qc),
    meta: { errorMessage: "La suppression du template a échoué." },
  });
}
