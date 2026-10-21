import { useEffect, useRef } from "react";
import { ExternalLink, X } from "lucide-react";
import { ObjectTag } from "@/components/ui/ObjectIdentity";
import { IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { findArticle } from "./articles";
import { InHelpPanelContext, helpPath, type HelpTarget } from "./context";

/**
 * Aide contextuelle : une section de l'aide dans un panneau latéral, par-dessus l'écran en cours.
 * Le travail en cours reste en place ; l'aide complète s'ouvre dans un nouvel onglet.
 */
export function HelpPanel({
  target,
  onNavigate,
  onClose,
}: {
  target: HelpTarget;
  onNavigate: (t: HelpTarget) => void;
  onClose: () => void;
}) {
  const article = findArticle(target.slug);
  const section = article?.sections.find((s) => s.id === target.sectionId) ?? article?.sections[0];
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [target]);

  if (!article || !section) return null;

  return (
    <Dialog placement="side" labelledBy="help-panel-title" initialFocus={closeRef} onClose={onClose}>
      <div className="flex h-full flex-col">
        <header className="flex items-center gap-3 border-b border-rule px-5 py-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Aide</span>
          {article.kind && <ObjectTag kind={article.kind}>{article.space}</ObjectTag>}
          <a
            href={helpPath(article.slug, section.id)}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-1 font-mono text-xs text-ink-soft hover:text-ink hover:underline"
            title="Ouvrir l'aide complète dans un nouvel onglet"
          >
            Toute l'aide
            <ExternalLink size={12} />
          </a>
          <IconButton ref={closeRef} label="Fermer l'aide" icon={<X size={16} />} size="sm" onClick={onClose} />
        </header>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 pb-10 pt-5">
          <p className="text-xs text-ink-muted">{article.title}</p>
          <h2 id="help-panel-title" className="mt-1 text-xl font-bold tracking-tight">
            {section.title}
          </h2>
          <InHelpPanelContext.Provider value={true}>{section.body}</InHelpPanelContext.Provider>

          {article.sections.length > 1 && (
            <nav className="mt-8 border-t border-rule pt-4" aria-label="Dans cet article">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Dans cet article
              </p>
              <ul className="mt-2 space-y-0.5">
                {article.sections.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => onNavigate({ slug: article.slug, sectionId: s.id })}
                      aria-current={s.id === section.id ? "true" : undefined}
                      className={`w-full border-l-[3px] px-2 py-1 text-left text-sm ${
                        s.id === section.id
                          ? "border-ink font-semibold text-ink"
                          : "border-transparent text-ink-soft hover:text-ink hover:underline"
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
      </div>
    </Dialog>
  );
}
