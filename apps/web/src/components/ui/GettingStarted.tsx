import { Link } from "react-router-dom";
import { Check } from "lucide-react";
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
    },
    {
      done: hasPublished,
      title: "Le publier",
      text: "Choisissez les champs à remplir, puis publiez : le template devient disponible dans le Studio.",
      action: { to: "/templates", label: "Ouvrir l'Atelier" },
    },
    {
      done: false,
      title: "Produire un document",
      text: "Dans le Studio, remplissez le template et exportez le PDF. À refaire à chaque édition.",
      action: { to: "/documents/new", label: "Créer un document" },
    },
  ];
  const current = steps.findIndex((s) => !s.done);

  return (
    <section className="rounded-xl border border-blue-100 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-900">Bienvenue dans DocForge</h2>
      <p className="mt-1 text-sm text-gray-500">
        La mise en page se conçoit une fois ; le contenu se remplit à chaque édition. Voici les trois étapes.
      </p>
      <ol className="mt-5 grid grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={`rounded-lg border p-4 ${i === current ? "border-blue-300 bg-blue-50/60" : "border-gray-100"}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  step.done ? "bg-emerald-100 text-emerald-700" : i === current ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {step.done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-sm font-semibold ${step.done ? "text-gray-400 line-through" : "text-gray-900"}`}>{step.title}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">{step.text}</p>
            {i === current && (
              <Link
                to={step.action.to}
                className="mt-3 inline-block rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
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
