// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useAutosave } from "./useAutosave";

/**
 * Banc d'essai : un état édité (révision + contenu), une sauvegarde contrôlée par le test,
 * et la révision confirmée qui suit les réponses du serveur comme le font les stores :
 * onSaved met à jour l'état, et le composant est rendu de nouveau avec la révision confirmée.
 */
function setup(options: { delay?: number } = {}) {
  let content = "v0";
  let savedRevision = 0;
  const pending: { snapshot: string; resolve: () => void; reject: (e: Error) => void }[] = [];
  const save = vi.fn<(snapshot: string) => Promise<string>>(
    (snapshot) =>
      new Promise<string>((resolve, reject) => {
        pending.push({ snapshot, resolve: () => resolve(`ok:${snapshot}`), reject });
      }),
  );
  let revision = 0;
  const onSaved = vi.fn<(sent: number) => void>((sent) => {
    savedRevision = Math.max(savedRevision, sent);
    hook.rerender({ current: revision });
  });

  const hook = renderHook(
    ({ current }: { current: number }) =>
      useAutosave({
        revision: current,
        savedRevision,
        getSnapshot: () => content,
        save,
        onSaved,
        delay: options.delay,
      }),
    { initialProps: { current: 0 } },
  );

  return {
    hook,
    save,
    onSaved,
    pending,
    /** Une saisie : le contenu change, la révision avance */
    edit(value: string) {
      content = value;
      revision++;
      hook.rerender({ current: revision });
    },
  };
}

async function wait(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useAutosave", () => {
  it("attend une pause de saisie et n'envoie que le dernier état", async () => {
    const t = setup();
    t.edit("v1");
    await wait(500);
    t.edit("v2");
    await wait(1000);
    expect(t.save).not.toHaveBeenCalled();
    await wait(300);
    expect(t.save).toHaveBeenCalledTimes(1);
    expect(t.save).toHaveBeenCalledWith("v2");
  });

  it("passe par « saving » puis revient à « idle », avec la révision envoyée", async () => {
    const t = setup();
    t.edit("v1");
    await wait(1200);
    expect(t.hook.result.current.status).toBe("saving");
    await act(async () => t.pending[0]?.resolve());
    expect(t.onSaved).toHaveBeenCalledWith(1, "ok:v1");
    expect(t.hook.result.current.status).toBe("idle");
    expect(t.hook.result.current.dirty).toBe(false);
  });

  it("n'envoie qu'une requête à la fois et renvoie ce qui a changé entre-temps", async () => {
    const t = setup();
    t.edit("v1");
    let flushed: Promise<boolean> = Promise.resolve(false);
    await act(async () => {
      flushed = t.hook.result.current.flush();
    });
    expect(t.save).toHaveBeenCalledTimes(1);

    // Saisie pendant l'envoi : pas de seconde requête tant que la première n'a pas répondu
    t.edit("v2");
    await act(async () => {
      void t.hook.result.current.flush();
    });
    expect(t.save).toHaveBeenCalledTimes(1);

    await act(async () => t.pending[0]?.resolve());
    expect(t.save).toHaveBeenCalledTimes(2);
    expect(t.save).toHaveBeenLastCalledWith("v2");
    await act(async () => t.pending[1]?.resolve());
    await expect(flushed).resolves.toBe(true);
  });

  it("signale un échec ; flush résout à false", async () => {
    const t = setup();
    t.edit("v1");
    let result: Promise<boolean> = Promise.resolve(true);
    await act(async () => {
      result = t.hook.result.current.flush();
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => t.pending[0]?.reject(new Error("réseau")));
    await expect(result).resolves.toBe(false);
    expect(t.hook.result.current.status).toBe("error");
    expect(t.hook.result.current.dirty).toBe(true);
  });

  it("sauvegarde ce qui reste quand l'écran se ferme", async () => {
    const t = setup();
    t.edit("v1");
    t.hook.unmount();
    expect(t.save).toHaveBeenCalledWith("v1");
  });

  it("ne sauvegarde rien quand tout est déjà enregistré", async () => {
    const t = setup();
    await act(async () => {
      await t.hook.result.current.flush();
    });
    t.hook.unmount();
    expect(t.save).not.toHaveBeenCalled();
  });

  it("prévient avant de fermer l'onglet s'il reste des modifications", () => {
    const t = setup();
    const event = () => {
      const e = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(e);
      return e.defaultPrevented;
    };
    expect(event()).toBe(false);
    t.edit("v1");
    expect(event()).toBe(true);
  });
});
