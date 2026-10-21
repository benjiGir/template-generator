import { useLayoutEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { dimToPx } from "@/components/document-view/units";
import { PageView } from "./PageView";

/** Marge intérieure horizontale du canvas (px-6 de chaque côté) */
const PADDING = 48;
const STEPS = [0.5, 0.67, 0.75, 0.9, 1, 1.25];

export function Canvas() {
  const template = useEditorStore((s) => s.template);
  const selectNode = useEditorStore((s) => s.selectNode);
  const hoverNode = useEditorStore((s) => s.hoverNode);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  // « fit » : la page tient dans la largeur disponible ; sinon un niveau choisi
  const [mode, setMode] = useState<"fit" | number>("fit");

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  if (!template) return null;

  const pageWidth = dimToPx(template.pageFormat.width);
  const fit = width > 0 ? Math.min(1, (width - PADDING) / pageWidth) : 1;
  const zoom = mode === "fit" ? fit : mode;
  const stepFrom = (dir: 1 | -1) => {
    const next = dir > 0 ? STEPS.find((s) => s > zoom + 0.001) : [...STEPS].reverse().find((s) => s < zoom - 0.001);
    if (next) setMode(next);
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto bg-slate-200/70 px-6 py-8"
        onClick={() => selectNode(null)}
        onMouseLeave={() => hoverNode(null)}
      >
        <div className="mx-auto flex w-fit flex-col" style={zoom !== 1 ? { zoom } : undefined}>
          {template.pages.map((page, i) => (
            <PageView
              key={page.id}
              page={page}
              pageIndex={i}
              theme={template.theme}
              pageFormat={page.format ?? template.pageFormat}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 right-4 flex items-center gap-0.5 rounded-lg bg-white/95 p-0.5 text-xs shadow-md ring-1 ring-gray-200">
        <button
          onClick={() => stepFrom(-1)}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
          title="Réduire"
          aria-label="Réduire"
        >
          <Minus size={13} />
        </button>
        <button
          onClick={() => setMode(mode === "fit" ? 1 : "fit")}
          className="min-w-[64px] rounded px-1.5 py-1 font-medium text-gray-700 hover:bg-gray-100"
          title={mode === "fit" ? "Afficher à 100 %" : "Ajuster à la largeur"}
        >
          {mode === "fit" ? `Ajusté ${Math.round(zoom * 100)} %` : `${Math.round(zoom * 100)} %`}
        </button>
        <button
          onClick={() => stepFrom(1)}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
          title="Agrandir"
          aria-label="Agrandir"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
