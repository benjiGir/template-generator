import type { ReactNode } from "react";
import { ComponentRenderer } from "@template-generator/component-registry/renderer";
import type { ComponentNode, Template, TemplatePage, Theme } from "@template-generator/shared/types/template";
import { DocumentPage } from "./DocumentPage";
import { dimToPx } from "./units";

interface Props {
  template: Pick<Template, "theme" | "pageFormat" | "pages">;
  /** Rendu alternatif d'un nœud (mode inline du Studio) */
  renderNodes?: (nodes: ComponentNode[], theme: Theme, page: TemplatePage) => ReactNode;
}

/** Affiche toutes les pages d'un template ou d'un document, en lecture seule, à l'échelle 1 */
export function DocumentView({ template, renderNodes }: Props) {
  return (
    <div className="mx-auto flex w-fit flex-col gap-8">
      {template.pages.map((page) => (
        <DocumentPage key={page.id} theme={template.theme} format={page.format ?? template.pageFormat}>
          {renderNodes
            ? renderNodes(page.children, template.theme, page)
            : page.children.map((node) => <ComponentRenderer key={node.id} node={node} theme={template.theme} />)}
        </DocumentPage>
      ))}
    </div>
  );
}

interface ThumbnailProps {
  template: Pick<Template, "theme" | "pageFormat" | "pages">;
  /** Largeur affichée en px */
  width: number;
  /** Nombre de pages affichées (1 par défaut) */
  pages?: number;
  /** Montre chaque page en entier ; sinon la vignette est coupée au ratio du format de page */
  fullHeight?: boolean;
}

/** Réduction fidèle des pages, pour les listes et les aperçus */
export function DocumentThumbnail({ template, width, pages = 1, fullHeight = false }: ThumbnailProps) {
  const pageWidthPx  = dimToPx(template.pageFormat.width);
  const pageHeightPx = dimToPx(template.pageFormat.height);
  const scale = width / pageWidthPx;
  const shown = template.pages.slice(0, pages);

  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {shown.map((page) => (
        <div
          key={page.id}
          style={{
            width,
            height: fullHeight ? undefined : pageHeightPx * scale,
            overflow: "hidden",
            flexShrink: 0,
            pointerEvents: "none",
            userSelect: "none",
            boxShadow: fullHeight ? "0 1px 3px rgba(15,23,42,0.12), 0 8px 24px rgba(15,23,42,0.08)" : undefined,
          }}
        >
          {/* zoom (et non transform) : la hauteur de mise en page est réduite elle aussi */}
          <div style={{ zoom: scale, width: pageWidthPx }}>
            <DocumentPage theme={template.theme} format={page.format ?? template.pageFormat} chromeStyle={{ boxShadow: "none" }}>
              {page.children.map((node) => (
                <ComponentRenderer key={node.id} node={node} theme={template.theme} />
              ))}
            </DocumentPage>
          </div>
        </div>
      ))}
    </div>
  );
}
