import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button, buttonClasses } from "./Button";

/**
 * Écran affiché quand un écran plante au rendu : un message clair et deux issues,
 * plutôt que la page d'erreur brute du routeur. Le détail technique reste disponible.
 */
export function RouteError() {
  const error = useRouteError();
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : String(error);

  return (
    <div className="flex h-full items-center justify-center bg-paper p-8">
      <div className="w-full max-w-lg border border-ink bg-white p-6">
        <div className="flex items-center gap-2 text-danger-strong">
          <AlertTriangle size={18} />
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em]">Erreur</p>
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight">Cet écran n'a pas pu s'afficher</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Votre travail déjà enregistré n'est pas perdu. Rechargez la page ; si le problème revient, repartez de
          l'accueil.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <Button variant="primary" icon={<RotateCw size={14} />} onClick={() => window.location.reload()}>
            Recharger la page
          </Button>
          <Link to="/" reloadDocument className={buttonClasses()}>
            Retour à l'accueil
          </Link>
        </div>
        <details className="mt-5 text-xs text-ink-muted">
          <summary className="cursor-pointer select-none">Détail technique</summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap bg-paper p-2 font-mono">{detail}</pre>
        </details>
      </div>
    </div>
  );
}
