import { useEffect, useRef } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useDocumentStore } from "@/store/document-store";
import { useAutosave } from "@/hooks/useAutosave";
import { WorkflowSessionProvider, useAutosaveExitGuard } from "@/workflow/session";
import { LoadingState, NotFoundState } from "@/workflow/EntityState";
import { DOCUMENT_WORKFLOW } from "@/workflow/definitions";
import type { Document } from "@template-generator/shared/types/document";

/**
 * Route parente des étapes 2 à 4 du Studio.
 * Charge le document une fois par visite et sauvegarde la saisie automatiquement ;
 * les étapes lisent le store, donc la relecture voit toujours la dernière saisie.
 */
export function DocumentWorkflowRoute() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const loadDocument = useDocumentStore((s) => s.loadDocument);
  const markSaved = useDocumentStore((s) => s.markSaved);
  const revision = useDocumentStore((s) => s.revision);
  const savedRevision = useDocumentStore((s) => s.savedRevision);
  const loadedId = useDocumentStore((s) => s.document?.id);
  const loadedForMount = useRef<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.documents.detail(id!),
    queryFn: () => api.documents.get(id!),
    enabled: !!id,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data && query.isFetchedAfterMount && loadedForMount.current !== id) {
      loadedForMount.current = id!;
      loadDocument(query.data);
    }
  }, [query.data, query.isFetchedAfterMount, id, loadDocument]);

  const autosave = useAutosave({
    revision,
    savedRevision,
    getSnapshot: () => {
      const { document, data } = useDocumentStore.getState();
      return document && document.id === id ? { id: document.id, data } : null;
    },
    save: ({ id: documentId, data }) => api.documents.updateData(documentId, data),
    onSaved: (rev, result) => {
      markSaved(rev);
      const saved = result as Document;
      useDocumentStore.getState().applyServerState(saved);
      queryClient.setQueryData(queryKeys.documents.detail(saved.id), saved);
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.list() });
    },
  });

  useAutosaveExitGuard(`/documents/${id}`, autosave);

  if (query.isError) {
    return (
      <NotFoundState
        message="Ce document n'existe pas ou a été supprimé."
        backTo="/documents"
        backLabel="Retour aux documents"
      />
    );
  }
  if (loadedId !== id || loadedForMount.current !== id) return <LoadingState label="Chargement du document…" />;

  return (
    <WorkflowSessionProvider value={{ flush: autosave.flush, autosave }}>
      <Outlet />
    </WorkflowSessionProvider>
  );
}

/** Ouvrir un document : un brouillon reprend au remplissage, un document finalisé à la relecture */
export function DocumentEntryRedirect() {
  const document = useDocumentStore((s) => s.document)!;
  const step = document.status === "finalized" ? "preview" : "fill";
  const target = DOCUMENT_WORKFLOW.steps.find((s) => s.key === step)!;
  return <Navigate to={target.path(document.id)} replace />;
}
