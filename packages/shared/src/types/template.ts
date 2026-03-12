/** Un noeud dans l'arbre de composants */
export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: ComponentNode[];
}

/** Configuration du thème */
export interface Theme {
  colors: {
    primary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    text: string;
    textLight: string;
    background: string;
    border: string;
  };
  fontFamily: string;
  baseFontSize: number;
}

/** Format de page */
export interface PageFormat {
  width: string;
  height: string;
  padding: string;
}

/** Une page du template */
export interface TemplatePage {
  id: string;
  label?: string;
  format?: PageFormat;
  children: ComponentNode[];
}

/** Le template complet */
export interface Template {
  id: string;
  name: string;
  description?: string;
  theme: Theme;
  pageFormat: PageFormat;
  pages: TemplatePage[];
  createdAt: string;
  updatedAt: string;
}

/** Thème par défaut */
export const DEFAULT_THEME: Theme = {
  colors: {
    primary: "#2563EB",
    accent: "#3B82F6",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    text: "#111827",
    textLight: "#6B7280",
    background: "#FFFFFF",
    border: "#E5E7EB",
  },
  fontFamily: "Inter, system-ui, sans-serif",
  baseFontSize: 14,
};

/** Format A4 par défaut */
export const DEFAULT_PAGE_FORMAT: PageFormat = {
  width: "210mm",
  height: "297mm",
  padding: "28px 36px 32px",
};