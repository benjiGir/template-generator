import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { cache } from "../cache";
import { queryKeys } from "../queryKeys";

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.lists(),
    queryFn: () => api.documents.list(),
  });
}

/**
 * Document ouvert dans le Studio : relu du serveur à chaque entrée dans le parcours,
 * jamais en arrière-plan (la saisie vit dans le store, pas dans le cache).
 */
export function useDocumentForEditing(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id ?? ""),
    // Sans identifiant, pas de requête
    queryFn: id ? () => api.documents.get(id) : skipToken,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

/** Le serveur fige la version publiée du template dans le document */
export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => api.documents.create({ templateId }),
    onSuccess: () => cache.documentsAddedOrRemoved(qc),
    meta: { errorMessage: "La création du document a échoué." },
  });
}

export function useDuplicateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.documents.duplicate(id),
    onSuccess: () => cache.documentsAddedOrRemoved(qc),
    meta: { errorMessage: "La copie du document a échoué." },
  });
}

export function useRenameDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.documents.rename(id, name),
    onSuccess: (document) => cache.documentChanged(qc, document),
    meta: { errorMessage: "Le renommage a échoué : le document garde son nom." },
  });
}

/** Appelé après l'export PDF : le document passe en « Finalisé » */
export function useMarkDocumentExported() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.documents.markExported(id),
    onSuccess: (document) => cache.documentChanged(qc, document),
    meta: { errorMessage: "Le PDF a été produit, mais le document n'a pas pu être marqué comme finalisé." },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.documents.delete(id),
    onSuccess: () => cache.documentsAddedOrRemoved(qc),
    meta: { errorMessage: "La suppression du document a échoué." },
  });
}
