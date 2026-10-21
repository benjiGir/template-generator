import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ObjectMark, ObjectTag } from "@/components/ui/ObjectIdentity";
import { HELP_ARTICLES, findArticle } from "@/help/articles";
import { helpPath } from "@/help/context";
import { HelpLink } from "@/help/HelpLink";

/** Questions fréquentes : chacune renvoie à la section qui y répond */
const QUESTIONS: { q: string; to: string }[] = [
  { q: "Pourquoi certaines parties du document ne sont-elles pas modifiables ?", to: "bases#zones-verrouillees" },
  { q: "J'ai ajouté un champ au template, mais mon document ne l'a pas.", to: "atelier#modifier-publie" },
  { q: "Comment repartir du document du mois précédent ?", to: "studio#gerer" },
  { q: "Comment obtenir un PDF sans marges ni en-têtes du navigateur ?", to: "studio#exporter" },
  { q: "Mon travail est-il enregistré ?", to: "bases#sauvegarde" },
  { q: "Que deviennent les documents si je supprime leur template ?", to: "atelier#modifier-publie" },
  { q: "Comment rendre un texte remplissable dans un template ?", to: "atelier#champs" },
];

/** Espace Aide : sommaire des articles, puis un article complet par adresse (/aide/studio#exporter) */
export function HelpPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { hash } = useLocation();
  const article = findArticle(slug);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ancre : la section demandée, sinon le haut de l'article
  useEffect(() => {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    const target = id ? document.getElementById(id) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else scrollRef.current?.scrollTo({ top: 0 });
  }, [slug, hash]);

  return (
    <div className="flex h-full">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-rule px-4 py-8" aria-label="Sommaire de l'aide">
        <Link
          to="/aide"
          className="px-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600 hover:text-ink"
        >
          Aide
        </Link>
        <ul className="mt-3 space-y-4">
          {HELP_ARTICLES.map((a) => (
            <li key={a.slug}>
              <NavLink
                to={helpPath(a.slug)}
                className={({ isActive }) =>
                  `flex items-center gap-2 border-l-[3px] px-2 py-1 text-sm ${isActive ? "border-ink bg-white font-semibold" : "border-transparent font-medium hover:bg-white/60"}`
                }
              >
                {a.kind ? (
                  <ObjectMark kind={a.kind} size={9} />
                ) : (
                  <span className="h-[9px] w-[9px] border border-ink" aria-hidden />
                )}
                {a.title}
              </NavLink>
              {a.slug === slug && (
                <ul className="ml-[22px] mt-1 space-y-0.5 border-l border-rule">
                  {a.sections.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={helpPath(a.slug, s.id)}
                        className={`block py-0.5 pl-3 text-[13px] ${hash === `#${s.id}` ? "font-semibold text-ink" : "text-gray-700 hover:text-ink"}`}
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {article ? (
          <article className="mx-auto max-w-[760px] px-10 pb-24 pt-8">
            <header className="border-b-2 border-ink pb-5">
              {article.kind ? (
                <ObjectTag kind={article.kind}>{article.space}</ObjectTag>
              ) : (
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">
                  Aide
                </span>
              )}
              <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight">{article.title}</h1>
              <p className="text-sm text-gray-700">{article.summary}</p>
            </header>
            {article.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-6 border-b border-rule py-8 last:border-b-0">
                <h2 className="text-xl font-bold tracking-tight">{s.title}</h2>
                {s.body}
              </section>
            ))}
          </article>
        ) : (
          <HelpIndex />
        )}
      </div>
    </div>
  );
}

function HelpIndex() {
  return (
    <div className="mx-auto max-w-[900px] px-10 pb-24 pt-8">
      <header className="border-b-2 border-ink pb-5">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">
          Documentation
        </span>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight">Aide</h1>
        <p className="text-sm text-gray-700">
          Chaque étape expliquée, avec des extraits d'écrans annotés. Dans un parcours, le bouton <strong>Aide</strong>{" "}
          ouvre directement la section de l'étape en cours.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {HELP_ARTICLES.map((a) => (
          <Link
            key={a.slug}
            to={helpPath(a.slug)}
            className="group flex flex-col border border-rule bg-white p-5 transition-colors hover:border-ink"
          >
            <span className="flex items-center gap-2">
              {a.kind ? (
                <ObjectMark kind={a.kind} size={10} />
              ) : (
                <span className="h-2.5 w-2.5 border border-ink" aria-hidden />
              )}
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-gray-600">
                {a.space ?? "Pour commencer"}
              </span>
            </span>
            <span className="mt-2 text-lg font-bold tracking-tight">{a.title}</span>
            <span className="mt-1 text-sm text-gray-700">{a.summary}</span>
            <span className="mt-4 flex items-center gap-1 font-mono text-xs text-gray-600 group-hover:text-ink">
              {a.sections.length} section{a.sections.length > 1 ? "s" : ""}
              <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight">Questions fréquentes</h2>
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {QUESTIONS.map(({ q, to }) => (
            <li key={q} className="flex items-center justify-between gap-4 py-3 text-[15px]">
              <span>{q}</span>
              <span className="shrink-0 text-sm">
                <HelpLink to={to}>Voir la réponse</HelpLink>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
