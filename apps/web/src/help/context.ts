import { createContext, useContext } from "react";

/** Section d'aide à afficher : un article, et éventuellement une de ses sections */
export interface HelpTarget {
  slug: string;
  sectionId?: string;
}

export interface HelpContextValue {
  /** Ouvre le panneau d'aide sur une section, sans quitter l'écran en cours */
  open: (slug: string, sectionId?: string) => void;
}

export const HelpContext = createContext<HelpContextValue | null>(null);

/** Vrai pour le contenu affiché dans le panneau latéral (les liens y restent dans le panneau) */
export const InHelpPanelContext = createContext(false);

export function useHelp(): HelpContextValue {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error("useHelp doit être utilisé sous <HelpProvider>");
  return ctx;
}

/** Adresse d'une section dans l'espace Aide */
export function helpPath(slug: string, sectionId?: string): string {
  return `/aide/${slug}${sectionId ? `#${sectionId}` : ""}`;
}
