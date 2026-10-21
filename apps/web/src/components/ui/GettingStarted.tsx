import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { KIND_STYLES, ObjectMark, type ObjectKind } from "./ObjectIdentity";
import type { TemplateSummary } from "@/api/client";

interface Props {
  templates: TemplateSummary[];
  documentCount: number;
}

/**
 * Accueil d'une application encore vide : les trois étapes, l'étape en cours mise en avant.
 * Rien n'est affiché dès qu'un premier document existe.
 */
export function GettingStarted({ templates, documentCount }: Props) {
  if (documentCount > 0) return null;
  const hasTemplate = templates.length > 0;
  const hasPublished = templates.some((t) => t.published);

  const steps = [
    {
      done: hasTemplate,
      title: "Concevoir un template",
      text: "Dans l'Atelier, assemblez la mise en page d'un type de document (rapport, revue…).",
      action: { to: "/templates/new", label: "Créer un template" },
      kind: "tpl" as ObjectKind,
    },
    {
      done: hasPublished,
      title: "Le publier",
      text: "Choisissez les champs à remplir, puis publiez : le template devient disponible dans le Studio.",
      action: { to: "/templates", label: "Ouvrir l'Atelier" },
      kind: "tpl" as ObjectKind,
    },
    {
      done: false,
      title: "Produire un document",
      text: "Dans le Studio, remplissez le template et exportez le PDF. À refaire à chaque édition.",
      action: { to: "/documents/new", label: "Créer un document" },
      kind: "doc" as ObjectKind,
    },
  ];
  const current = steps.findIndex((s) => !s.done);

  return (
    <section className="border-2 border-ink bg-white p-6">
      <h2 className="text-lg font-bold">Bienvenue dans DocForge</h2>
      <p className="mt-1 text-sm text-gray-700">
        La mise en page se conçoit une fois dans un <strong>template</strong> ; chaque <strong>document</strong> n'en
        remplit que le contenu. Voici les trois étapes.
      </p>
      <ol className="mt-5 grid grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={`border border-t-4 p-4 ${KIND_STYLES[step.kind].borderTop} ${
              i === current
                ? `border-x-rule border-b-rule ${KIND_STYLES[step.kind].tint}`
                : "border-x-rule border-b-rule"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-gray-700">{String(i + 1).padStart(2, "0")}</span>
              <ObjectMark kind={step.kind} size={9} />
              <span className={`text-sm font-semibold ${step.done ? "text-gray-500 line-through" : "text-ink"}`}>
                {step.title}
              </span>
              {step.done && <Check size={13} strokeWidth={3} aria-label="fait" />}
            </div>
            <p className="mt-2 text-xs text-gray-700">{step.text}</p>
            {i === current && (
              <Link
                to={step.action.to}
                className={`mt-3 inline-block rounded-sm px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95 ${KIND_STYLES[step.kind].bg}`}
              >
                {step.action.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
