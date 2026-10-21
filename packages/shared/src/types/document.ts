import type { PublishedVersion } from "./template";
import type { ComponentCategory } from "./component";

/** Ce qu'un document garde de son template : la version publiée qui l'a créé */
export type DocumentSnapshot = PublishedVersion;

/** Preset de composant sauvegardé */
export interface ComponentPreset {
  id: string;
  baseType: string;
  label: string;
  description: string | null;
  defaultProps: Record<string, unknown>;
  category: ComponentCategory | null;
  createdAt: string;
}

/** Document généré (template + données) */
export interface Document {
  id: string;
  /** null si le template a été supprimé depuis : le document garde son snapshot */
  templateId: string | null;
  name: string;
  data: Record<string, unknown>;
  templateSnapshot: DocumentSnapshot;
  status: "draft" | "finalized";
  completionPercent: number;
  exportedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

/** Statut affiché d'un document : un document finalisé puis modifié n'est plus « à jour » */
export type DocumentDisplayStatus = "draft" | "finalized" | "modified-after-export";
