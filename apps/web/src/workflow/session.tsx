import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useBlocker } from "react-router-dom";
import type { Autosave } from "@/hooks/useAutosave";
import { useConfirm } from "@/components/ui/ConfirmDialog";

/** Ce qu'une route de workflow (template, document, preset) partage avec ses étapes */
export interface WorkflowSession {
  /** Sauvegarde en attente avant de changer d'étape */
  flush: () => Promise<boolean>;
  autosave?: Autosave;
}

const SessionContext = createContext<WorkflowSession | null>(null);

export function WorkflowSessionProvider({ value, children }: { value: WorkflowSession; children: ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useWorkflowSession(): WorkflowSession | null {
  return useContext(SessionContext);
}

/**
 * Intercepte la sortie du workflow (navigation hors de `basePath`).
 * `onLeave` décide : true pour laisser partir, false pour rester.
 */
export function useWorkflowExitGuard(basePath: string, shouldBlock: () => boolean, onLeave: () => Promise<boolean>) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname &&
      nextLocation.pathname !== basePath &&
      !nextLocation.pathname.startsWith(`${basePath}/`) &&
      shouldBlock()
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    let cancelled = false;
    void onLeave().then((ok) => {
      if (cancelled) return;
      if (ok) blocker.proceed();
      else blocker.reset();
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocker.state]);
}

/** Garde standard des workflows avec autosave : on enregistre, et on ne demande qu'en cas d'échec */
export function useAutosaveExitGuard(basePath: string, autosave: Autosave) {
  const confirm = useConfirm();
  useWorkflowExitGuard(
    basePath,
    () => autosave.dirty || autosave.status === "saving" || autosave.status === "error",
    async () => {
      if (await autosave.flush()) return true;
      return confirm({
        title: "Vos dernières modifications ne sont pas enregistrées",
        message: "Le serveur ne répond pas. Si vous quittez maintenant, ces modifications seront perdues.",
        confirmLabel: "Quitter sans enregistrer",
        cancelLabel: "Rester sur la page",
        tone: "danger",
      });
    }
  );
}
