import type { CSSProperties, ReactNode, MouseEventHandler } from "react";
import type { PageFormat, Theme } from "@template-generator/shared/types/template";

/**
 * Style d'une page du document. C'est la seule définition de la « zone document » :
 * éditeur, Studio, relecture, miniatures et impression l'utilisent tous, pour que
 * l'écran et le PDF soient identiques.
 */
export function pageStyle(theme: Theme, format: PageFormat): CSSProperties {
  return {
    width:           format.width,
    minHeight:       format.height,
    padding:         format.padding,
    boxSizing:       "border-box",
    position:        "relative",
    backgroundColor: theme.colors.background,
    fontFamily:      theme.typography.fontFamily,
    fontSize:        theme.typography.baseFontSize,
    color:           theme.colors.text,
  };
}

interface Props {
  theme: Theme;
  format: PageFormat;
  children: ReactNode;
  /** Décor hors document (ombre, contour de sélection) : jamais imprimé */
  chromeStyle?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function DocumentPage({ theme, format, children, chromeStyle, onClick }: Props) {
  return (
    <div
      data-doc-page
      style={{ boxShadow: "0 0 0 1px rgba(22,22,26,0.10)", ...chromeStyle, ...pageStyle(theme, format) }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
