import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { cache } from "@/api/cache";
import { useTemplateForEditing } from "@/api/hooks/templates";
import { useEditorStore } from "@/store/editor-store";
import { useAutosave } from "@/hooks/useAutosave";
import { WorkflowSessionProvider, useAutosaveExitGuard } from "@/workflow/session";
import { LoadingState, NotFoundState } from "@/workflow/EntityState";
import { useRouteParam } from "@/workflow/params";

/**
 * Route parente des étapes 2 à 4 de l'Atelier.
 * Charge le template une fois, le garde dans le store d'édition et le sauvegarde automatiquement :
 * les étapes lisent le store, jamais le cache, donc elles voient toujours le même état.
 */
export function TemplateWorkflowRoute() {
  const id = useRouteParam("id");
  const queryClient = useQueryClient();
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const markSaved = useEditorStore((s) => s.markSaved);
  const revision = useEditorStore((s) => s.revision);
  const savedRevision = useEditorStore((s) => s.savedRevision);
  const loadedId = useEditorStore((s) => s.template?.id);
  const loadedForMount = useRef<string | null>(null);

  const query = useTemplateForEditing(id);

  // On charge la version serveur fraîche une seule fois par visite du workflow
  useEffect(() => {
    if (query.data && query.isFetchedAfterMount && loadedForMount.current !== id) {
      loadedForMount.current = id;
      loadTemplate(query.data);
    }
  }, [query.data, query.isFetchedAfterMount, id, loadTemplate]);

  const autosave = useAutosave({
    revision,
    savedRevision,
    getSnapshot: () => {
      const t = useEditorStore.getState().template;
      if (!t || t.id !== id) return null;
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        theme: t.theme,
        pageFormat: t.pageFormat,
        pages: t.pages,
        editableFields: t.editableFields,
      };
    },
    save: ({ id: templateId, ...body }) => api.templates.update(templateId, body),
    onSaved: (rev, saved) => {
      markSaved(rev);
      useEditorStore.getState().applyServerState(saved);
      cache.templateChanged(queryClient, saved);
    },
  });

  useAutosaveExitGuard(`/templates/${id}`, autosave);

  const session = { flush: autosave.flush, autosave };

  if (query.isError) {
    return (
      <NotFoundState
        message="Ce template n'existe pas ou a été supprimé."
        backTo="/templates"
        backLabel="Retour aux templates"
      />
    );
  }
  if (loadedId !== id || loadedForMount.current !== id) return <LoadingState label="Chargement du template…" />;

  return (
    <WorkflowSessionProvider value={session}>
      <Outlet />
    </WorkflowSessionProvider>
  );
}
