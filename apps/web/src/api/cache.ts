import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

/**
 * Ce qu'un changement côté serveur rend obsolète dans le cache, écrit une seule fois.
 * Les hooks de mutation et les sauvegardes automatiques passent tous par ici.
 */
export const cache = {
  /** Un template a changé (contenu, nom, publication) : listes de l'Atelier et du Studio */
  templateChanged(qc: QueryClient, template?: { id: string }) {
    if (template) qc.setQueryData(queryKeys.templates.detail(template.id), template);
    void qc.invalidateQueries({ queryKey: queryKeys.templates.lists() });
  },

  /** Un template a été créé ou supprimé ; une suppression détache aussi ses documents */
  templatesAddedOrRemoved(qc: QueryClient) {
    void qc.invalidateQueries({ queryKey: queryKeys.templates.lists() });
    void qc.invalidateQueries({ queryKey: queryKeys.documents.lists() });
  },

  /** Un document a changé (saisie, nom, export) */
  documentChanged(qc: QueryClient, document?: { id: string }) {
    if (document) qc.setQueryData(queryKeys.documents.detail(document.id), document);
    void qc.invalidateQueries({ queryKey: queryKeys.documents.lists() });
  },

  /** Un document a été créé ou supprimé : le compteur de documents des templates bouge aussi */
  documentsAddedOrRemoved(qc: QueryClient) {
    void qc.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    void qc.invalidateQueries({ queryKey: queryKeys.templates.lists() });
  },

  presetsChanged(qc: QueryClient, preset?: { id: string }) {
    if (preset) qc.setQueryData(queryKeys.presets.detail(preset.id), preset);
    void qc.invalidateQueries({ queryKey: queryKeys.presets.lists() });
  },

  themesChanged(qc: QueryClient) {
    void qc.invalidateQueries({ queryKey: queryKeys.themes.lists() });
  },
};
