import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { WorkflowSessionProvider, useWorkflowExitGuard } from "@/workflow/session";
import { LoadingState, NotFoundState } from "@/workflow/EntityState";
import { PRESET_WORKFLOW } from "@/workflow/definitions";
import { ComponentSelectPage } from "./ComponentSelectPage";

/**
 * Route parente du workflow preset : `/components/new/*` pour une création,
 * `/components/:presetId/*` pour une modification. Le preset n'est enregistré qu'à la dernière étape :
 * quitter avant demande confirmation.
 */
export function PresetWorkflowRoute() {
  const { presetId } = useParams<{ presetId: string }>();
  const isNew = presetId === "new";
  const confirm = useConfirm();
  const editingId = useComponentDraftStore((s) => s.editingId);
  const loadPreset = useComponentDraftStore((s) => s.loadPreset);
  const reset = useComponentDraftStore((s) => s.reset);
  const [ready, setReady] = useState(false);
  const loadedFor = useRef<string | null>(null);

  const query = useQuery({
    queryKey: queryKeys.presets.detail(presetId!),
    queryFn: () => api.presets.get(presetId!),
    enabled: !isNew && editingId !== presetId,
  });

  useEffect(() => {
    if (loadedFor.current === presetId) return;
    if (isNew) {
      // Un brouillon de création en cours est conservé ; celui d'une modification ne l'est pas
      if (useComponentDraftStore.getState().editingId) reset();
      loadedFor.current = presetId!;
      setReady(true);
    } else if (editingId === presetId) {
      loadedFor.current = presetId!;
      setReady(true);
    } else if (query.data) {
      loadPreset(query.data);
      loadedFor.current = presetId!;
      setReady(true);
    }
  }, [presetId, isNew, editingId, query.data, loadPreset, reset]);

  useWorkflowExitGuard(
    `/components/${presetId}`,
    () => useComponentDraftStore.getState().dirty,
    async () => {
      const ok = await confirm({
        title: isNew ? "Abandonner ce preset ?" : "Abandonner les modifications ?",
        message: "Le preset n'est enregistré qu'à la dernière étape. La configuration en cours sera perdue.",
        confirmLabel: "Abandonner",
        cancelLabel: "Continuer l'édition",
        tone: "danger",
      });
      if (ok) reset();
      return ok;
    },
  );

  if (query.isError) {
    return (
      <NotFoundState
        message="Ce preset n'existe pas ou a été supprimé."
        backTo="/components"
        backLabel="Retour aux presets"
      />
    );
  }
  if (!ready) return <LoadingState label="Chargement du preset…" />;

  return (
    <WorkflowSessionProvider value={{ flush: async () => true }}>
      <Outlet />
    </WorkflowSessionProvider>
  );
}

/** Index : choix du composant pour une création, configuration directe pour une modification */
export function PresetEntry() {
  const { presetId } = useParams<{ presetId: string }>();
  if (presetId === "new") return <ComponentSelectPage />;
  return <Navigate to={PRESET_WORKFLOW.steps[1]!.path(presetId!)} replace />;
}
