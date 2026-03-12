import { useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";

export function useExportPdf() {
  const template = useEditorStore((s) => s.template);

  const exportPdf = useCallback(() => {
    if (!template) return;

    const pages = document.querySelectorAll<HTMLElement>("[data-doc-page]");
    if (!pages.length) return;

    // Trouver la hauteur max parmi toutes les pages
    let maxHeight = 0;
    pages.forEach((page) => {
      if (page.offsetHeight > maxHeight) maxHeight = page.offsetHeight;
    });

    // px → mm (1px = 0.2646mm), +2mm de marge de sécurité
    const heightMM = Math.ceil(maxHeight * 0.2646) + 2;
    const widthStr = template.pageFormat.width;

    // Injecter @page dynamique
    document.getElementById("print-page-size")?.remove();
    const styleEl = document.createElement("style");
    styleEl.id = "print-page-size";
    styleEl.textContent = `@page { size: ${widthStr} ${heightMM}mm; margin: 0; }`;
    document.head.appendChild(styleEl);

    window.print();

    setTimeout(() => {
      document.getElementById("print-page-size")?.remove();
    }, 1000);
  }, [template]);

  return { exportPdf };
}
