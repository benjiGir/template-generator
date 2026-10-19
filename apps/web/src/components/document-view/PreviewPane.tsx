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
  highlightTone?: "focus" | "warning";
  renderNodes?: (nodes: ComponentNode[], theme: Theme, page: TemplatePage) => ReactNode;
  onBackgroundClick?: MouseEventHandler<HTMLDivElement>;
  /** Contenu affiché au-dessus du document, dans la zone de défilement */
  header?: ReactNode;
}

/**
 * Zone de document d'un écran d'édition ou de relecture : fond neutre (la « chrome »),
 * pages réduites pour tenir en largeur, et repère sur le composant en cours.
 */
export function PreviewPane({ template, highlightNodeId, highlightTone = "focus", renderNodes, onBackgroundClick, header }: Props) {
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
  const zoom = width > 0 ? Math.min(1, (width - PADDING) / pageWidthPx) : 1;

  // Position du repère : union des boîtes rendues par le composant (son repère est en display: contents)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !highlightNodeId) {
      setRect(null);
      return;
    }
    const measure = () => {
      const marker = el.querySelector(`[data-node-id="${CSS.escape(highlightNodeId)}"]`);
      const boxes = marker ? Array.from(marker.children).map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0 || r.height > 0) : [];
      if (boxes.length === 0) {
        setRect(null);
        return;
      }
      const container = el.getBoundingClientRect();
      const top = Math.min(...boxes.map((b) => b.top));
      const left = Math.min(...boxes.map((b) => b.left));
      const bottom = Math.max(...boxes.map((b) => b.bottom));
      const right = Math.max(...boxes.map((b) => b.right));
      setRect({
        top: top - container.top + el.scrollTop,
        left: left - container.left + el.scrollLeft,
        width: right - left,
        height: bottom - top,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    const content = el.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [highlightNodeId, template, zoom]);

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

  return (
    <div ref={scrollRef} className="relative h-full overflow-auto bg-slate-200/70 p-8" onClick={onBackgroundClick}>
      <div>
        {header}
        <DocumentView template={template} renderNodes={renderNodes} zoom={zoom} />
      </div>
      {rect && (
        <div
          aria-hidden
          className={`pointer-events-none absolute rounded-sm transition-all duration-150 ${
            highlightTone === "warning"
              ? "bg-amber-400/10 ring-2 ring-amber-500 ring-offset-2"
              : "bg-blue-500/5 ring-2 ring-blue-500 ring-offset-2"
          }`}
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      )}
    </div>
  );
}
