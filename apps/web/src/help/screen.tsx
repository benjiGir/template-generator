import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Morceaux d'écrans de l'aide : des extraits d'interface redessinés avec les styles de l'application,
 * et non des captures. Ils suivent ainsi l'interface et restent nets à toutes les tailles.
 * Les repères numérotés renvoient à la légende placée sous l'extrait.
 */

/**
 * Repère numéroté. Sans position, il se place dans le flux, juste à côté de l'élément désigné
 * (le plus sûr pour ne rien masquer) ; avec `at`, il est posé par-dessus l'extrait.
 */
export function Mark({ n, at }: { n: number; at?: CSSProperties }) {
  const circle =
    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[11px] font-semibold not-italic text-paper ring-2 ring-paper";
  if (!at)
    return (
      <span aria-hidden className={`inline-flex align-middle ${circle}`}>
        {n}
      </span>
    );
  return (
    <span aria-hidden className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${circle}`} style={at}>
      {n}
    </span>
  );
}

/** Largeur de dessin des extraits : ils sont réduits pour tenir dans un conteneur plus étroit (panneau d'aide) */
const DESIGN_WIDTH = 680;

/** Échelle pour faire tenir la largeur de dessin dans l'élément observé */
function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / DESIGN_WIDTH));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, scale };
}

/** Extrait d'écran : un cadre, une étiquette d'emplacement et une légende numérotée */
export function Figure({
  where,
  legend,
  children,
  height = 240,
}: {
  /** Où l'on se trouve dans l'application (« Studio · 02 Remplir ») */
  where: string;
  legend: ReactNode[];
  children: ReactNode;
  /** Hauteur à la largeur de dessin */
  height?: number;
}) {
  const { ref, scale } = useFitScale();
  return (
    <figure className="my-5">
      <div className="border border-ink bg-white">
        <div className="flex items-center gap-2 border-b border-rule bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
          <span className="h-1.5 w-1.5 bg-ink" aria-hidden />
          {where}
        </div>
        <div ref={ref} aria-hidden className="select-none overflow-hidden" style={{ height: height * scale }}>
          <div
            className="relative origin-top-left overflow-hidden"
            style={{ width: DESIGN_WIDTH, height, transform: `scale(${scale})` }}
          >
            {children}
          </div>
        </div>
      </div>
      <figcaption>
        <ol className="mt-3 space-y-1.5">
          {legend.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[11px] font-semibold text-paper">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

/** Ligne de texte factice */
export function Line({ w = "100%", tone = "bg-rule-strong", h = 5 }: { w?: string; tone?: string; h?: number }) {
  return <span className={`block ${tone}`} style={{ width: w, height: h }} />;
}

/** Petit libellé d'interface */
export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`block text-[10px] leading-tight text-ink-soft ${className}`}>{children}</span>;
}

/** Libellé en chasse fixe, capitales (titres de groupes, étiquettes) */
export function MonoLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`block font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted ${className}`}
    >
      {children}
    </span>
  );
}

/** Champ de saisie factice */
export function Input({
  value,
  placeholder,
  className = "",
}: {
  value?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <span
      className={`block truncate border border-rule-strong bg-white px-1.5 py-1 text-[10px] ${value ? "text-ink" : "text-ink-faint"} ${className}`}
    >
      {value ?? placeholder ?? " "}
    </span>
  );
}

/** Bouton factice */
export function Btn({
  children,
  tone = "ink",
  className = "",
}: {
  children: ReactNode;
  tone?: "ink" | "outline" | "doc" | "tpl" | "preset" | "ghost";
  className?: string;
}) {
  const tones = {
    ink: "bg-ink text-paper",
    outline: "border border-ink text-ink",
    doc: "bg-doc text-white",
    tpl: "bg-tpl text-white",
    preset: "bg-preset text-white",
    ghost: "text-ink-muted",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[10px] font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Stepper d'un workflow, tel qu'il apparaît dans l'en-tête */
export function MiniStepper({ steps, current, accent }: { steps: string[]; current: number; accent: string }) {
  return (
    <span className="flex items-center gap-3">
      {steps.map((s, i) => (
        <span
          key={s}
          className={`flex items-center gap-1 border-b-2 pb-0.5 text-[10px] ${i === current ? `${accent} font-semibold text-ink` : "border-transparent text-ink-subtle"}`}
        >
          <span className="font-mono text-[9px]">{String(i + 1).padStart(2, "0")}</span>
          {(i === current || steps.length <= 4) && <span className="whitespace-nowrap">{s}</span>}
        </span>
      ))}
    </span>
  );
}

/**
 * Page de document miniature : bandeau de titre, indicateurs, deux colonnes, encadré.
 * `zone` décrit le rendu d'une zone : normal, champ remplissable (pointillés), surlignée, verrouillée.
 */
export type ZoneLook = "plain" | "field" | "active" | "locked" | "pick" | "warn";

const ZONE_STYLES: Record<ZoneLook, string> = {
  plain: "",
  field: "outline outline-1 outline-dashed outline-doc outline-offset-1",
  active: "outline outline-2 outline-doc outline-offset-1 bg-doc-tint/60",
  locked: "",
  pick: "outline outline-1 outline-dashed outline-tpl outline-offset-1",
  warn: "outline outline-2 outline-warn outline-offset-1 bg-warn-tint",
};

const NO_ZONES = {};

export function MiniPage({
  zones = NO_ZONES,
  dense = false,
  className = "",
  style,
}: {
  zones?: Partial<Record<"title" | "intro" | "kpis" | "left" | "right" | "box", ZoneLook>>;
  /** Vignette très petite : marges et espacements réduits */
  dense?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const z = (k: keyof typeof zones) => ZONE_STYLES[zones[k] ?? "plain"];
  return (
    <div
      className={`flex flex-col bg-white shadow-[0_1px_3px_rgba(22,22,26,0.18)] ${dense ? "gap-1.5 p-2" : "gap-2 p-3"} ${className}`}
      style={style}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[7px] font-bold tracking-wide text-ink">KOMITY</span>
        <Line w="30%" h={3} tone="bg-rule" />
      </div>
      <div className={z("title")}>
        <span className="block text-[11px] font-bold leading-tight text-ink">Bilan mensuel</span>
        <Line w="35%" h={3} tone="bg-rule-strong" />
      </div>
      <div className={`space-y-1 border-l-2 border-ink/70 bg-paper px-2 py-1.5 ${z("intro")}`}>
        <Line w="95%" h={3} />
        <Line w="70%" h={3} />
      </div>
      <div className={`grid grid-cols-4 gap-1 ${z("kpis")}`}>
        {["bg-tpl-tint", "bg-preset-tint", "bg-warn-tint", "bg-danger-tint"].map((t) => (
          <span key={t} className={`block space-y-1 p-1 ${t}`}>
            <Line w="60%" h={3} tone="bg-ink-subtle" />
            <Line w="85%" h={2} tone="bg-rule-strong" />
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className={`space-y-1 border border-rule p-1.5 ${z("left")}`}>
          <Line w="40%" h={3} tone="bg-preset" />
          <Line w="90%" h={2.5} />
          <Line w="75%" h={2.5} />
          <Line w="82%" h={2.5} />
        </div>
        <div className={`space-y-1 border border-rule p-1.5 ${z("right")}`}>
          <Line w="45%" h={3} tone="bg-warn" />
          <Line w="88%" h={2.5} />
          <Line w="64%" h={2.5} />
          <Line w="80%" h={2.5} />
        </div>
      </div>
      <div className={`space-y-1 bg-paper p-1.5 ${z("box")}`}>
        <Line w="30%" h={3} tone="bg-ink-subtle" />
        <Line w="85%" h={2.5} />
        <Line w="60%" h={2.5} />
      </div>
    </div>
  );
}

/** Le plan de travail derrière les pages (comme dans les aperçus de l'application) */
export function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`h-full bg-table ${className}`}>{children}</div>;
}
