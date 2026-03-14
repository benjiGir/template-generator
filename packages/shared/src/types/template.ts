/** Un noeud dans l'arbre de composants */
export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: ComponentNode[];
}

/** Couleurs du thème */
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  text: string;
  textLight: string;
  textMuted: string;
  background: string;
  backgroundAlt: string;
  border: string;
  borderLight: string;
}

/** Typographie du thème */
export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: number;
  lineHeight: number;
  headingSizes: {
    h1: number;
    h2: number;
    h3: number;
  };
  fontWeights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
}

/** Espacements du thème */
export interface ThemeSpacing {
  unit: number;
  pagePadding: string;
  sectionGap: number;
  componentGap: number;
}

/** Bordures du thème */
export interface ThemeBorder {
  radius: number;
  radiusLg: number;
  width: number;
}

/** Configuration du thème */
export interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borders: ThemeBorder;
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

/** Thème par défaut (KOMITY Blue) */
export const DEFAULT_THEME: Theme = {
  name: "KOMITY Blue",
  colors: {
    primary: "#2563EB",
    primaryLight: "#EFF6FF",
    accent: "#3B82F6",
    accentLight: "#DBEAFE",
    success: "#16A34A",
    successLight: "#F0FDF4",
    warning: "#D97706",
    warningLight: "#FFFBEB",
    danger: "#DC2626",
    dangerLight: "#FEF2F2",
    text: "#111827",
    textLight: "#6B7280",
    textMuted: "#9CA3AF",
    background: "#FFFFFF",
    backgroundAlt: "#F8FAFC",
    border: "#E5E7EB",
    borderLight: "#F3F4F6",
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    headingFontFamily: "Inter, system-ui, sans-serif",
    baseFontSize: 14,
    lineHeight: 1.65,
    headingSizes: { h1: 28, h2: 20, h3: 16 },
    fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  },
  spacing: {
    unit: 4,
    pagePadding: "28px 36px 32px",
    sectionGap: 4,
    componentGap: 3,
  },
  borders: {
    radius: 8,
    radiusLg: 12,
    width: 1,
  },
};

/** Format A4 par défaut */
export const DEFAULT_PAGE_FORMAT: PageFormat = {
  width: "210mm",
  height: "297mm",
  padding: "28px 36px 32px",
};
