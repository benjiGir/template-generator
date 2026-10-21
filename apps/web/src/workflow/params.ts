import { useParams } from "react-router-dom";

/**
 * Paramètre d'URL que la route garantit (`/documents/:id/...`). S'il manque, la route est mal déclarée :
 * l'erreur est levée tout de suite (écran d'erreur) plutôt que de laisser circuler un identifiant vide.
 */
export function useRouteParam(name: string): string {
  const value = useParams()[name];
  if (!value) throw new Error(`Paramètre d'URL « ${name} » absent : la route ne correspond pas à l'écran`);
  return value;
}
