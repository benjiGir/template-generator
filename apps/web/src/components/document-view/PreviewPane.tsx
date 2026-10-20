import { useEffect, useLayoutEffect, useRef, useState, type MouseEventHandler, type ReactNode } from "react";
import type { ComponentNode, Template, TemplatePage, Theme } from "@template-generator/shared/types/template";
import { DocumentView } from "./DocumentView";
import { dimToPx } from "./units";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Marge intérieure du panneau (p-8 de chaque côté) */
const PADDING = 64;

interface Props {
  template: Pick<Template, "theme" | "pageFormat" | "pages">;
  /** Composant à mettre en évidence (et à amener à l'écran quand il change) */
  highlightNodeId?: string | null;
  /** focus = cobalt (Atelier), doc = orange (Studio), warning = ocre (à compléter) */
  highlightTone?: "focus" | "doc" | "warning";
  /** Zones repérées en permanence, discrètement (ex. : contenus retenus comme champs) */
  outlineNodeIds?: string[];
  outlineTone?: "tpl" | "doc";
  /** Page posée sur la table, avec traits de coupe */
  framed?: boolean;
  /** Curseur « main » sur les composants : l'aperçu sert à désigner des zones */
  pickable?: boolean;
  renderNodes?: (nodes: ComponentNode[], theme: Theme, page: TemplatePage) => ReactNode;
  onBackgroundClick?: MouseEventHandler<HTMLDivElement>;
  /** Contenu affiché au-dessus du document, dans la zone de défilement */
  header?: ReactNode;
  /** Panneau ancré sous la zone mise en évidence (édition sur place) */
  anchoredPanel?: ReactNode;
}

/**
 * Zone de document d'un écran d'édition ou de relecture : fond neutre (la « chrome »),
 * pages réduites pour tenir en largeur, et repère sur le composant en cours.
 */
/** Union des boîtes rendues par un composant (son repère est en display: contents) */
function measureNode(el: HTMLElement, nodeId: string): Rect | null {
  const marker = el.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`);
  const boxes = marker ? Array.from(marker.children).map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0 || r.height > 0) : [];
  if (boxes.length === 0) return null;
  const container = el.getBoundingClientRect();
  const top = Math.min(...boxes.map((b) => b.top));
  const left = Math.min(...boxes.map((b) => b.left));
  const bottom = Math.max(...boxes.map((b) => b.bottom));
  const right = Math.max(...boxes.map((b) => b.right));
  return { top: top - container.top + el.scrollTop, left: left - container.left + el.scrollLeft, width: right - left, height: bottom - top };
}

export function PreviewPane({ template, highlightNodeId, highlightTone = "focus", outlineNodeIds, outlineTone = "tpl", framed = false, pickable = false, renderNodes, onBackgroundClick, header, anchoredPanel }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const pageWidthPx = dimToPx(template.pageFormat.width);
  // Les traits de coupe ajoutent 12 px de chaque côté de la page
  const zoom = width > 0 ? Math.min(1, (width - PADDING - (framed ? 24 : 0)) / pageWidthPx) : 1;

  const [outlines, setOutlines] = useState<Rect[]>([]);
  const outlineKey = outlineNodeIds?.join("|") ?? "";

  // Positions des repères, recalculées quand la mise en page change
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      setRect(highlightNodeId ? measureNode(el, highlightNodeId) : null);
      setOutlines(outlineKey ? outlineKey.split("|").map((id) => measureNode(el, id)).filter((r): r is Rect => r !== null) : []);
    };
    measure();
    const observer = new ResizeObserver(measure);
    const content = el.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [highlightNodeId, outlineKey, template, zoom]);

  // Amène le composant à l'écran quand on change de cible (pas à chaque frappe)
  const scrolledFor = useRef<string | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !rect || !highlightNodeId || scrolledFor.current === highlightNodeId) return;
    scrolledFor.current = highlightNodeId;
    const visible = rect.top >= el.scrollTop && rect.top + rect.height <= el.scrollTop + el.clientHeight;
    if (!visible) {
      el.scrollTo({ top: Math.max(0, rect.top - el.clientHeight / 2 + Math.min(rect.height, el.clientHeight) / 2), behavior: "smooth" });
    }
  }, [rect, highlightNodeId]);

  useEffect(() => {
    if (!highlightNodeId) scrolledFor.current = null;
  }, [highlightNodeId]);

  // Le panneau ancré doit être visible, même sous une zone plus haute que l'écran
  const panelRef = useRef<HTMLDivElement>(null);
  const hasPanel = Boolean(anchoredPanel);
  useEffect(() => {
    if (!hasPanel || !rect) return;
    const timer = setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPanel, highlightNodeId, rect !== null]);

  return (
    <div
      ref={scrollRef}
      data-pickable={pickable || undefined}
      className="relative h-full overflow-auto bg-table p-8"
      onClick={onBackgroundClick}
    >
      <div>
        {header}
        <DocumentView template={template} renderNodes={renderNodes} zoom={zoom} framed={framed} />
      </div>
      {outlines.map((r, i) => (
        <div
          key={i}
          aria-hidden
          className={`pointer-events-none absolute outline-1 outline-offset-1 outline-dashed ${
            outlineTone === "doc" ? "bg-doc/5 outline-doc/80" : "bg-tpl/5 outline-tpl/80"
          }`}
          style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
        />
      ))}
      {rect && anchoredPanel && (
        <div
          ref={panelRef}
          className="absolute z-20 w-[380px]"
          style={{
            top: rect.top + rect.height + 10,
            left: Math.max(8, Math.min(rect.left, (scrollRef.current?.scrollWidth ?? 0) - 388)),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {anchoredPanel}
        </div>
      )}
      {rect && (
        <div
          aria-hidden
          className={`pointer-events-none absolute rounded-sm transition-all duration-150 ${
            highlightTone === "warning"
              ? "bg-amber-400/10 ring-2 ring-amber-600 ring-offset-2"
              : highlightTone === "doc"
              ? "bg-doc/5 ring-2 ring-doc ring-offset-2"
              : "bg-tpl/5 ring-2 ring-tpl ring-offset-2"
          }`}
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      )}
    </div>
  );
}
