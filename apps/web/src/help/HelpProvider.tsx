import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ExternalLink, X } from "lucide-react";
import { ObjectTag } from "@/components/ui/ObjectIdentity";
import { findArticle } from "./articles";
import { HelpContext, InHelpPanelContext, helpPath } from "./context";

interface Target {
  slug: string;
  sectionId?: string;
}

/** Fournit l'ouverture du panneau d'aide à toute l'application */
export function HelpProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Target | null>(null);
  const open = useCallback((slug: string, sectionId?: string) => setTarget({ slug, sectionId }), []);

  return (
    <HelpContext.Provider value={{ open }}>
      {children}
      {target && <HelpPanel target={target} onNavigate={setTarget} onClose={() => setTarget(null)} />}
    </HelpContext.Provider>
  );
}

/**
 * Aide contextuelle : une section de l'aide dans un panneau latéral, par-dessus l'écran en cours.
 * Le travail en cours reste en place ; l'aide complète s'ouvre dans un nouvel onglet.
 */
function HelpPanel({ target, onNavigate, onClose }: { target: Target; onNavigate: (t: Target) => void; onClose: () => void }) {
  const article = findArticle(target.slug);
  const section = article?.sections.find((s) => s.id === target.sectionId) ?? article?.sections[0];
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [target]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!article || !section) return null;

  return (
    <div className="fixed inset-0 z-[950] flex justify-end bg-ink/20" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-panel-title"
        className="flex h-full w-[520px] max-w-full flex-col border-l-2 border-ink bg-paper"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 border-b border-rule px-5 py-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">Aide</span>
          {article.kind && <ObjectTag kind={article.kind}>{article.space}</ObjectTag>}
          <a
            href={helpPath(article.slug, section.id)}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-1 font-mono text-xs text-gray-700 hover:text-ink hover:underline"
            title="Ouvrir l'aide complète dans un nouvel onglet"
          >
            Toute l'aide
            <ExternalLink size={12} />
          </a>
          <button ref={closeRef} onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-white hover:text-ink" aria-label="Fermer l'aide">
            <X size={16} />
          </button>
        </header>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 pb-10 pt-5">
          <p className="text-xs text-gray-600">{article.title}</p>
          <h2 id="help-panel-title" className="mt-1 text-xl font-bold tracking-tight">{section.title}</h2>
          <InHelpPanelContext.Provider value={true}>{section.body}</InHelpPanelContext.Provider>

          {article.sections.length > 1 && (
            <nav className="mt-8 border-t border-rule pt-4" aria-label="Dans cet article">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">Dans cet article</p>
              <ul className="mt-2 space-y-0.5">
                {article.sections.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => onNavigate({ slug: article.slug, sectionId: s.id })}
                      aria-current={s.id === section.id ? "true" : undefined}
                      className={`w-full border-l-[3px] px-2 py-1 text-left text-sm ${
                        s.id === section.id ? "border-ink font-semibold text-ink" : "border-transparent text-gray-700 hover:text-ink hover:underline"
                      }`}
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </aside>
    </div>
  );
}
