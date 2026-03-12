import type { Template } from "./template";

/** Preset de composant sauvegardé */
export interface ComponentPreset {
  id: string;
  baseType: string;
  label: string;
  description?: string;
  defaultProps: Record<string, unknown>;
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