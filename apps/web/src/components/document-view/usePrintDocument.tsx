import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Template } from "@template-generator/shared/types/template";
import { DocumentView } from "./DocumentView";
import { pxToMmCeil } from "./units";

export type PrintFormat = "auto" | "a4";

interface PrintJob {
  template: Pick<Template, "theme" | "pageFormat" | "pages">;
  format: PrintFormat;
  title: string;
}

const STYLE_ID = "print-page-size";

/**
 * Imprime un document via la boîte d'impression du navigateur.
 * Le document est rendu dans un portail dédié, à l'échelle 1, hors de l'écran :
 * le PDF ne dépend donc pas de ce qui est affiché (aperçu réduit, chrome d'édition…).
 */
export function usePrintDocument(): {
  print: (job: PrintJob) => Promise<void>;
  printNode: ReactNode;
  printing: boolean;
} {
  const [job, setJob] = useState<PrintJob | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  const print = useCallback(
    (next: PrintJob) =>
      new Promise<void>((resolve) => {
        resolveRef.current = resolve;
        setJob(next);
      }),
    [],
  );

  useLayoutEffect(() => {
    if (!job || !rootRef.current) return;
    const root = rootRef.current;
    const previousTitle = document.title;
    let done = false;

    const cleanup = () => {
      if (done) return;
      done = true;
      document.getElementById(STYLE_ID)?.remove();
      document.title = previousTitle;
      window.removeEventListener("afterprint", cleanup);
      setJob(null);
      resolveRef.current?.();
      resolveRef.current = null;
    };

    void (async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(root.querySelectorAll("img"))
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((r) => {
                img.addEventListener("load", r, { once: true });
                img.addEventListener("error", r, { once: true });
              }),
          ),
      );

      const pages = Array.from(root.querySelectorAll<HTMLElement>("[data-doc-page]"));
      const width = job.template.pageFormat.width;
      let css: string;
      if (job.format === "a4") {
        css = "@page { size: A4; margin: 0; }";
      } else {
        // Une taille de page par page du document : les longues pages ne sont pas découpées
        const heights = pages.map((p) => pxToMmCeil(p.offsetHeight) + 1);
        const max = Math.max(...heights, 1);
        css = [
          `@page { size: ${width} ${max}mm; margin: 0; }`,
          ...heights.map((h, i) => `@page docpage-${i} { size: ${width} ${h}mm; margin: 0; }`),
          ...heights.map((_, i) => `[data-print-portal] [data-doc-page]:nth-child(${i + 1}) { page: docpage-${i}; }`),
        ].join("\n");
      }

      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
      document.title = job.title;

      window.addEventListener("afterprint", cleanup);
      window.print();
      // Chrome bloque pendant la boîte de dialogue ; Safari non : afterprint fait foi, ce délai est un filet
      setTimeout(cleanup, 1000);
    })();
  }, [job]);

  const printNode = job
    ? createPortal(
        <div data-print-portal ref={rootRef}>
          <DocumentView template={job.template} />
        </div>,
        document.body,
      )
    : null;

  return { print, printNode, printing: job !== null };
}
