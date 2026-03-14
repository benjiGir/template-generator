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
  createdAt: string;
}