import { Suspense, lazy, useCallback, useMemo, useState, type ReactNode } from "react";
import { HelpContext, type HelpTarget } from "./context";

// Les articles et leurs extraits d'écrans ne sont téléchargés qu'à la première ouverture du panneau
const HelpPanel = lazy(() => import("./HelpPanel").then((m) => ({ default: m.HelpPanel })));

/** Fournit l'ouverture du panneau d'aide à toute l'application */
export function HelpProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HelpTarget | null>(null);
  const open = useCallback((slug: string, sectionId?: string) => setTarget({ slug, sectionId }), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <HelpContext.Provider value={value}>
      {children}
      {target && (
        <Suspense fallback={null}>
          <HelpPanel target={target} onNavigate={setTarget} onClose={() => setTarget(null)} />
        </Suspense>
      )}
    </HelpContext.Provider>
  );
}
