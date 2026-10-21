import type { ReactNode } from "react";
import { get } from "@template-generator/component-registry/registry";
import { ComponentRenderer, resolveThemeVars } from "@template-generator/component-registry/renderer";
import type { ComponentNode, Template, TemplatePage, Theme } from "@template-generator/shared/types/template";
import { DocumentPage } from "./DocumentPage";
import { dimToPx } from "./units";

/**
 * Rend un nœud comme ComponentRenderer, enveloppé dans un repère `display: contents` :
 * aucune boîte n'est créée (la mise en page est identique au PDF), mais l'aperçu peut
 * retrouver la zone d'un composant pour la mettre en évidence.
 */
export function MarkedNode({ node, theme }: { node: ComponentNode; theme: Theme }) {
  const definition = get(node.type);
  if (!definition) return <ComponentRenderer node={node} theme={theme} />;

  const Component = definition.render;
  const values = resolveThemeVars(node.props, theme);
  return (
    <div data-node-id={node.id} style={{ display: "contents" }}>
      {definition.acceptsChildren && node.children ? (
        <Component values={values} theme={theme}>
          {node.children.map((child) => (
            <MarkedNode key={child.id} node={child} theme={theme} />
          ))}
        </Component>
      ) : (
        <Component values={values} theme={theme} />
      )}
    </div>
  );
}

interface Props {
  template: Pick<Template, "theme" | "pageFormat" | "pages">;
  /** Rendu alternatif des nœuds (mode inline du Studio) */
  renderNodes?: (nodes: ComponentNode[], theme: Theme, page: TemplatePage) => ReactNode;
  /** Réduction pour tenir dans la largeur disponible (1 = taille réelle) */
  zoom?: number;
  /** Page posée sur la table : traits de coupe et légende de format (écran seulement, jamais imprimé) */
  framed?: boolean;
}

/** Affiche toutes les pages d'un template ou d'un document, en lecture seule */
export function DocumentView({ template, renderNodes, zoom = 1, framed = false }: Props) {
  const count = template.pages.length;
  return (
    <div className="mx-auto flex w-fit flex-col gap-8" style={zoom !== 1 ? { zoom } : undefined}>
      {template.pages.map((page, index) => {
        const format = page.format ?? template.pageFormat;
        const content = (
          <DocumentPage key={page.id} theme={template.theme} format={format}>
            {renderNodes
              ? renderNodes(page.children, template.theme, page)
              : page.children.map((node) => <MarkedNode key={node.id} node={node} theme={template.theme} />)}
          </DocumentPage>
        );
        if (!framed) return content;
        return (
          <div key={page.id}>
            <div className="mb-2 flex justify-between px-3 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-soft">
              <span>
                Page {index + 1}/{count} · {format.width} de large · exportée telle quelle
              </span>
            </div>
            <CropMarks>{content}</CropMarks>
          </div>
        );
      })}
    </div>
  );
}

/** Traits de coupe aux quatre coins, comme sur une épreuve d'imprimerie */
export function CropMarks({ children }: { children: ReactNode }) {
  const mark = "pointer-events-none absolute h-2.5 w-2.5 border-ink-soft";
  return (
    <div className="relative p-3">
      <span aria-hidden="true" className={`${mark} left-0 top-0 border-l border-t`} />
      <span aria-hidden="true" className={`${mark} right-0 top-0 border-r border-t`} />
      <span aria-hidden="true" className={`${mark} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden="true" className={`${mark} bottom-0 right-0 border-b border-r`} />
      {children}
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
  /** Hauteur affichée en px (haut de page seulement) */
  cropHeight?: number;
}

/** Réduction fidèle des pages, pour les listes et les aperçus */
export function DocumentThumbnail({ template, width, pages = 1, fullHeight = false, cropHeight }: ThumbnailProps) {
  const pageWidthPx = dimToPx(template.pageFormat.width);
  const pageHeightPx = dimToPx(template.pageFormat.height);
  const scale = width / pageWidthPx;
  const shown = template.pages.slice(0, pages);
  const height = fullHeight ? undefined : (cropHeight ?? pageHeightPx * scale);

  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {shown.map((page) => (
        <div
          key={page.id}
          style={{
            width,
            height,
            overflow: "hidden",
            flexShrink: 0,
            pointerEvents: "none",
            userSelect: "none",
            backgroundColor: template.theme.colors.background,
            boxShadow: fullHeight ? "0 1px 3px rgba(15,23,42,0.12), 0 8px 24px rgba(15,23,42,0.08)" : undefined,
          }}
        >
          {/* zoom (et non transform) : la hauteur de mise en page est réduite elle aussi */}
          <div style={{ zoom: scale, width: pageWidthPx }}>
            <DocumentPage
              theme={template.theme}
              format={page.format ?? template.pageFormat}
              chromeStyle={{ boxShadow: "none" }}
            >
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
