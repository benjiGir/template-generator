import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "error";

interface Options<T> {
  /** Révision courante de l'état édité */
  revision: number;
  /** Dernière révision confirmée par le serveur */
  savedRevision: number;
  /** État à envoyer ; null tant que rien n'est chargé */
  getSnapshot: () => T | null;
  save: (snapshot: T) => Promise<unknown>;
  /** Appelé après succès avec la révision envoyée */
  onSaved: (revision: number, result: unknown) => void;
  delay?: number;
}

export interface Autosave {
  status: SaveStatus;
  dirty: boolean;
  /** Sauvegarde immédiatement ce qui reste ; résout à false si l'enregistrement a échoué */
  flush: () => Promise<boolean>;
}

/**
 * Sauvegarde automatique commune (template, document) :
 * attend une pause de saisie, n'envoie qu'une requête à la fois,
 * sauvegarde ce qui reste au démontage et prévient avant de fermer l'onglet.
 */
export function useAutosave<T>({
  revision,
  savedRevision,
  getSnapshot,
  save,
  onSaved,
  delay = 1200,
}: Options<T>): Autosave {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const dirty = revision !== savedRevision;

  const latest = useRef({ revision, savedRevision, getSnapshot, save, onSaved });
  latest.current = { revision, savedRevision, getSnapshot, save, onSaved };

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<boolean> | null>(null);

  const run = useCallback(async (): Promise<boolean> => {
    // Une requête à la fois : on attend la précédente puis on renvoie si l'état a encore changé
    // oxlint-disable-next-line no-await-in-loop
    while (inFlight.current) await inFlight.current;

    const { revision: rev, savedRevision: saved, getSnapshot: snap, save: doSave } = latest.current;
    if (rev === saved) return true;
    const snapshot = snap();
    if (snapshot === null) return true;

    const attempt = (async () => {
      setStatus("saving");
      try {
        const result = await doSave(snapshot);
        latest.current.onSaved(rev, result);
        setStatus("idle");
        return true;
      } catch (e) {
        console.error("Échec de la sauvegarde automatique :", e);
        setStatus("error");
        return false;
      }
    })();
    inFlight.current = attempt;
    const ok = await attempt;
    inFlight.current = null;
    return ok;
  }, []);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const ok = await run();
    // Des modifications ont pu arriver pendant l'envoi
    if (ok && latest.current.revision !== latest.current.savedRevision) return run();
    return ok;
  }, [run]);

  useEffect(() => {
    if (!dirty) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void run();
    }, delay);
  }, [revision, dirty, delay, run]);

  // Au démontage : on envoie ce qui reste plutôt que de le perdre
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      void run();
    },
    [run],
  );

  useEffect(() => {
    if (!dirty && status !== "saving") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, status]);

  return { status, dirty, flush };
}
