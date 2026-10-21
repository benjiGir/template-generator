import type { Template } from "./template";
import type { ComponentCategory } from "./component";

/** Preset de composant sauvegardé */
export interface ComponentPreset {
  id: string;
  baseType: string;
  label: string;
  description?: string;
  defaultProps: Record<string, unknown>;
  category?: ComponentCategory;
  createdAt: string;
}

/** Document généré (template + données) */
export interface Document {
  id: string;
  templateId: string;
  name: string;
  data: Record<string, unknown>;
  templateSnapshot: Template;
  status: "draft" | "finalized";
  completionPercent: number;
  exportedAt?: string | null;
  updatedAt: string;
  createdAt: string;
}

/** Statut affiché d'un document : un document finalisé puis modifié n'est plus « à jour » */
export type DocumentDisplayStatus = "draft" | "finalized" | "modified-after-export";
