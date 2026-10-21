import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { KIND_STYLES, ObjectMark } from "@/components/ui/ObjectIdentity";
import { TOUR_ENDINGS, TOUR_PROFILES, TOUR_STEPS, type TourProfile } from "./tourSteps";

const STORAGE_KEY = "docforge-tour";

/** La visite a-t-elle déjà été vue (terminée ou passée) dans ce navigateur ? */
function tourSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    // Stockage indisponible (navigation privée…) : on ne s'impose pas à chaque visite
    return true;
  }
}

function markTourSeen(outcome: "done" | "skipped") {
  try {
    localStorage.setItem(STORAGE_KEY, outcome);
  } catch {
    // préférence non mémorisée : sans conséquence
  }
}

interface OnboardingContext {
  /** Relance la visite depuis l'accueil */
  start: () => void;
}

const Context = createContext<OnboardingContext | null>(null);

export function useOnboarding(): OnboardingContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useOnboarding doit être utilisé sous <OnboardingProvider>");
  return ctx;
}

/**
 * Visite guidée de première utilisation : proposée au premier passage sur l'accueil,
 * passable à tout moment, relançable depuis la navigation.
 */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  // Première utilisation : on attend d'être sur l'accueil (pas au milieu d'un workflow ouvert par lien)
  useEffect(() => {
    if (location.pathname !== "/" || active || tourSeen()) return;
    const timer = setTimeout(() => setActive(true), 400);
    return () => clearTimeout(timer);
  }, [location.pathname, active]);

  const start = useCallback(() => {
    if (location.pathname !== "/") navigate("/");
    setActive(true);
  }, [location.pathname, navigate]);

  const close = (outcome: "done" | "skipped") => {
    markTourSeen(outcome);
    setActive(false);
  };

  return (
    <Context.Provider value={{ start }}>
      {children}
      {active && location.pathname === "/" && (
        <Tour
          onSkip={() => close("skipped")}
          onFinish={(to) => {
            close("done");
            if (to) navigate(to);
          }}
        />
      )}
    </Context.Provider>
  );
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOT_PADDING = 6;
const CARD_WIDTH = 340;

function Tour({ onSkip, onFinish }: { onSkip: () => void; onFinish: (to?: string) => void }) {
  const [profile, setProfile] = useState<TourProfile | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const steps = profile ? TOUR_STEPS[profile] : [];
  const step = profile ? steps[index] : undefined;
  const isLast = profile !== null && index === steps.length - 1;

  // Élément à mettre en lumière : le premier repère présent, amené à l'écran puis mesuré
  useLayoutEffect(() => {
    if (!step) {
      setRect(null);
      return;
    }
    const el = step.target.map((t) => document.querySelector<HTMLElement>(`[data-tour="${t}"]`)).find(Boolean) ?? null;
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: "center", inline: "nearest" });
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step]);

  useLayoutEffect(() => {
    setCardHeight(cardRef.current?.offsetHeight ?? 0);
  });

  const next = () => {
    if (!profile) return;
    if (isLast) onFinish();
    else setIndex((i) => i + 1);
  };
  const previous = () => {
    if (index === 0) setProfile(null);
    else setIndex((i) => i - 1);
  };

  useEffect(() => {
    primaryRef.current?.focus();
  }, [profile, index]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
      if (!profile) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Position de la bulle : à droite des éléments étroits (navigation), sinon dessous ou dessus
  const cardStyle = (() => {
    if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } as const;
    const gap = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.left + rect.width + gap + CARD_WIDTH < vw && rect.width < 320) {
      const top = Math.min(Math.max(12, rect.top + rect.height / 2 - cardHeight / 2), vh - cardHeight - 12);
      return { top, left: rect.left + rect.width + SPOT_PADDING + gap };
    }
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - CARD_WIDTH / 2), vw - CARD_WIDTH - 12);
    const below = rect.top + rect.height + SPOT_PADDING + gap;
    if (below + cardHeight < vh) return { top: below, left };
    return { top: Math.max(12, rect.top - SPOT_PADDING - gap - cardHeight), left };
  })();

  return (
    <div className="fixed inset-0 z-[1100]" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* Voile ; la découpe autour de l'élément est faite par l'ombre de la mise en lumière */}
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-xl transition-all duration-200"
          style={{
            top: rect.top - SPOT_PADDING,
            left: rect.left - SPOT_PADDING,
            width: rect.width + SPOT_PADDING * 2,
            height: rect.height + SPOT_PADDING * 2,
            boxShadow: "0 0 0 9999px rgba(22,22,26,0.55), 0 0 0 2px rgba(247,245,240,0.95)",
          }}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-slate-900/55" />
      )}

      <div
        ref={cardRef}
        className="absolute rounded-xl bg-white p-5 shadow-2xl transition-[top,left] duration-200"
        style={{ width: profile ? CARD_WIDTH : 460, ...cardStyle }}
      >
        <button
          onClick={onSkip}
          className="absolute right-3 top-3 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Passer le tutoriel"
          title="Passer le tutoriel (Échap)"
        >
          <X size={16} />
        </button>

        {!profile ? (
          <>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-700">
              Première visite
            </p>
            <h2 id="tour-title" className="mt-1 text-lg font-semibold text-gray-900">
              Bienvenue dans DocForge
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              DocForge sépare la forme du fond : un <strong>template</strong> fixe la mise en page une fois pour toutes,
              et chaque <strong>document</strong> n'en remplit que le contenu, jusqu'à l'export PDF.
            </p>
            <p className="mt-4 text-sm font-medium text-gray-800">Que venez-vous faire ?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TOUR_PROFILES.map((p, i) => (
                <button
                  key={p.key}
                  ref={i === 0 ? primaryRef : undefined}
                  onClick={() => {
                    setProfile(p.key);
                    setIndex(0);
                  }}
                  className="flex flex-col items-start gap-1.5 border border-rule p-3 text-left transition-colors hover:border-ink hover:bg-paper focus:outline-none focus:ring-2 focus:ring-ink"
                >
                  <ObjectMark kind={p.key === "contributor" ? "doc" : "tpl"} size={14} />
                  <span className="text-sm font-semibold text-gray-900">{p.title}</span>
                  <span className="text-xs text-gray-500">{p.hint}</span>
                </button>
              ))}
            </div>
            <button onClick={onSkip} className="mt-4 text-xs text-gray-500 hover:text-gray-800 hover:underline">
              Passer le tutoriel
            </button>
          </>
        ) : step ? (
          <>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-700">
              Étape {index + 1} sur {steps.length}
            </p>
            <h2 id="tour-title" className="mt-1 pr-6 text-base font-semibold text-gray-900">
              {step.title}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">{step.body}</p>

            <div className="mt-4 flex items-center gap-1" aria-hidden>
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-ink" : "w-1.5 bg-rule"}`}
                />
              ))}
            </div>

            {isLast ? (
              // Dernière étape : l'action proposée sur toute la largeur, quelle que soit la longueur de son libellé
              <div className="mt-4 space-y-2">
                <button
                  ref={primaryRef}
                  onClick={() => onFinish(TOUR_ENDINGS[profile].to)}
                  className={`w-full rounded-sm px-3 py-2 text-sm font-semibold text-white hover:brightness-95 ${KIND_STYLES[profile === "contributor" ? "doc" : "tpl"].bg} focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1`}
                >
                  {TOUR_ENDINGS[profile].label}
                </button>
                <div className="flex items-center justify-between">
                  <button
                    onClick={previous}
                    className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    <ArrowLeft size={13} />
                    Précédent
                  </button>
                  <button
                    onClick={() => onFinish()}
                    className="rounded-md px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Terminer sans rien créer
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between gap-2">
                <button onClick={onSkip} className="text-xs text-gray-500 hover:text-gray-800 hover:underline">
                  Passer
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={previous}
                    className="flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowLeft size={13} />
                    Précédent
                  </button>
                  <button
                    ref={primaryRef}
                    onClick={next}
                    className="flex items-center gap-1 rounded-sm bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1"
                  >
                    Suivant
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
