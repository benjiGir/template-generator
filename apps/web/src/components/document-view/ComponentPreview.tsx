import { useLayoutEffect, useRef, useState } from "react";
import { get, getAll } from "@template-generator/component-registry/registry";
import { DEFAULT_PAGE_FORMAT, type ComponentNode, type Theme } from "@template-generator/shared/types/template";
import { DocumentPage } from "./DocumentPage";
import { MarkedNode } from "./DocumentView";
import { dimToPx } from "./units";

const GHOST = "ghost-";

function ghost(type: string, index: number): ComponentNode {
  const def = get(type);
  return {
    id: `${GHOST}${type}-${index}`,
    type,
    props: { ...def?.defaultProps },
    children: def?.acceptsChildren ? [] : undefined,
  };
}

/**
 * Met le composant dans le contexte où il vit réellement, pour un aperçu honnête :
 * une carte KPI dans sa rangée (avec des voisines estompées), une rangée avec des cartes d'exemple.
 */
function inContext(node: ComponentNode): ComponentNode {
  const def = get(node.type);
  if (def?.acceptsChildren && (node.children ?? []).length === 0) {
    const childType = def.allowedChildren?.[0] ?? "text-block";
    return {
      ...node,
      children: [0, 1, 2].slice(0, def.childrenLayout === "horizontal" ? 3 : 2).map((i) => ghost(childType, i)),
    };
  }
  const parent = getAll().find((d) => d.allowedChildren?.includes(node.type));
  if (parent) {
    return {
      id: `${GHOST}parent`,
      type: parent.type,
      props: { ...parent.defaultProps },
      children: [node, ghost(node.type, 1), ghost(node.type, 2)],
    };
  }
  return node;
}

interface Props {
  type: string;
  props: Record<string, unknown>;
  theme: Theme;
  /** Hauteur affichée maximale (vignettes) ; sans valeur, l'aperçu est complet */
  maxHeight?: number;
  /** Vignette : page étroite et marges réduites, pour un rendu lisible en petit */
  compact?: boolean;
}

/** Page de vignette : assez large pour une rangée de cartes, sans les marges d'une vraie page */
const COMPACT_FORMAT = { width: "480px", height: "0px", padding: "14px 16px" };

/** Un composant rendu dans une page simulée, à l'échelle de la largeur disponible */
export function ComponentPreview({ type, props, theme, maxHeight, compact = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const format = compact ? COMPACT_FORMAT : { ...DEFAULT_PAGE_FORMAT, height: "0px" };
  const pageWidth = dimToPx(format.width);
  const zoom = width > 0 ? width / pageWidth : 0;
  const node = inContext({ id: "preview", type, props, children: get(type)?.acceptsChildren ? [] : undefined });

  return (
    <div
      ref={ref}
      data-component-preview
      style={{ maxHeight, overflow: "hidden", pointerEvents: "none", userSelect: "none" }}
      aria-hidden
    >
      {zoom > 0 && (
        <div style={{ zoom, width: pageWidth }}>
          <DocumentPage theme={theme} format={format} chromeStyle={{ boxShadow: "none" }}>
            <MarkedNode node={node} theme={theme} />
          </DocumentPage>
        </div>
      )}
    </div>
  );
}
