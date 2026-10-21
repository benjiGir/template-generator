import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { cache } from "@/api/cache";
import { useDocumentForEditing } from "@/api/hooks/documents";
import { useDocumentStore, useLoadedDocument } from "@/store/document-store";
import { useAutosave } from "@/hooks/useAutosave";
import { WorkflowSessionProvider, useAutosaveExitGuard } from "@/workflow/session";
import { LoadingState, NotFoundState } from "@/workflow/EntityState";
import { useRouteParam } from "@/workflow/params";
import { DOCUMENT_PATHS } from "@/workflow/definitions";

/**
 * Route parente des étapes 2 à 4 du Studio.
 * Charge le document une fois par visite et sauvegarde la saisie automatiquement ;
 * les étapes lisent le store, donc la relecture voit toujours la dernière saisie.
 */
export function DocumentWorkflowRoute() {
  const id = useRouteParam("id");
  const queryClient = useQueryClient();
  const loadDocument = useDocumentStore((s) => s.loadDocument);
  const markSaved = useDocumentStore((s) => s.markSaved);
  const revision = useDocumentStore((s) => s.revision);
  const savedRevision = useDocumentStore((s) => s.savedRevision);
  const loadedId = useDocumentStore((s) => s.document?.id);
  const loadedForMount = useRef<string | null>(null);

  const query = useDocumentForEditing(id);

  useEffect(() => {
    if (query.data && query.isFetchedAfterMount && loadedForMount.current !== id) {
      loadedForMount.current = id;
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
    onSaved: (rev, saved) => {
      markSaved(rev);
      useDocumentStore.getState().applyServerState(saved);
      cache.documentChanged(queryClient, saved);
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
  const document = useLoadedDocument();
  const step = document.status === "finalized" ? "preview" : "fill";
  return <Navigate to={DOCUMENT_PATHS[step](document.id)} replace />;
}
