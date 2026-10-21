import type { ReactNode } from "react";

/**
 * Identité visuelle des trois types d'objets : une couleur ET une forme chacun,
 * pour qu'on les distingue même sans percevoir la couleur.
 *  - document : carré plein, orange — la feuille remplie (Studio)
 *  - template : contour en pointillés, cobalt — le plan (Atelier)
 *  - preset   : rond, vert — la pièce préréglée (Bibliothèque)
 */
export type ObjectKind = "doc" | "tpl" | "preset";

/** Classes complètes (Tailwind ne repère que des noms de classe entiers) */
export const KIND_STYLES: Record<
  ObjectKind,
  { text: string; bg: string; border: string; borderTop: string; tint: string; label: string }
> = {
  doc: {
    text: "text-doc-strong",
    bg: "bg-doc",
    border: "border-doc",
    borderTop: "border-t-doc",
    tint: "bg-doc-tint",
    label: "Document",
  },
  tpl: {
    text: "text-tpl",
    bg: "bg-tpl",
    border: "border-tpl",
    borderTop: "border-t-tpl",
    tint: "bg-tpl-tint",
    label: "Template",
  },
  preset: {
    text: "text-preset",
    bg: "bg-preset",
    border: "border-preset",
    borderTop: "border-t-preset",
    tint: "bg-preset-tint",
    label: "Preset",
  },
};

export function ObjectMark({ kind, size = 10 }: { kind: ObjectKind; size?: number }) {
  const shape =
    kind === "doc" ? "bg-doc" : kind === "tpl" ? "border-2 border-dashed border-tpl" : "rounded-full bg-preset";
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 box-border ${shape}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Étiquette de type (« DOCUMENTS », « TEMPLATE »…) en tête de section ou d'écran */
export function ObjectTag({ kind, children }: { kind: ObjectKind; children?: string }) {
  const style =
    kind === "doc"
      ? "bg-doc text-white"
      : kind === "tpl"
        ? "border-[1.5px] border-dashed border-tpl text-tpl"
        : "rounded-full bg-preset text-white";
  return (
    <span
      className={`inline-block px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${style}`}
    >
      {children ?? KIND_STYLES[kind].label}
    </span>
  );
}

const BLUEPRINT_GRID = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
  backgroundSize: "8px 8px",
};

/** Fond « plan » (grille blanche sur cobalt) sous la miniature d'un template */
export function BlueprintFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-tpl ${className}`} style={BLUEPRINT_GRID}>
      {children}
    </div>
  );
}

/** Vignette abstraite d'un template : tracé blanc, champs en pointillés */
export function BlueprintGlyph() {
  return (
    <div
      aria-hidden="true"
      className="box-border flex h-12 w-9 flex-col gap-[3px] bg-tpl p-[5px]"
      style={{ ...BLUEPRINT_GRID, backgroundSize: "6px 6px" }}
    >
      <div className="h-1 w-3/5 border border-white" />
      <div className="h-1.5 border border-dashed border-white/90" />
      <div className="flex gap-0.5">
        <div className="h-[7px] flex-1 border border-dashed border-white/90" />
        <div className="h-[7px] flex-1 border border-dashed border-white/90" />
      </div>
      <div className="h-1.5 border border-dashed border-white/90" />
    </div>
  );
}

/** Le template d'origine d'un document, en une ligne */
export function TemplateRef({ name }: { name: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-ink-soft">
      <ObjectMark kind="tpl" size={9} />
      <span className="truncate">Template : {name}</span>
    </span>
  );
}
