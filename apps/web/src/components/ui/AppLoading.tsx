/** Écran du tout premier chargement : le nom de l'application, le temps que l'écran demandé arrive */
export function AppLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-paper" role="status" aria-label="Chargement">
      <span className="animate-pulse font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">DocForge</span>
    </div>
  );
}
