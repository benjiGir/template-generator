import type { ObjectKind } from "@/components/ui/ObjectIdentity";

/**
 * Les trois parcours de création, déclarés une fois.
 * WorkflowLayout s'en sert pour le stepper, la navigation et l'action finale.
 */
export interface WorkflowStepDef {
  key: string;
  label: string;
  path: (entityId: string) => string;
}

export interface WorkflowDef {
  space: string;
  /** Type d'objet produit : sa couleur et sa forme dans l'en-tête, le stepper et l'action finale */
  kind: ObjectKind;
  listPath: string;
  listLabel: string;
  steps: WorkflowStepDef[];
}

/** Adresses des étapes, à utiliser pour naviguer d'un écran à l'autre */
export const TEMPLATE_PATHS = {
  start: () => "/templates/new",
  theme: (id: string) => `/templates/${id}/theme`,
  build: (id: string) => `/templates/${id}/build`,
  publish: (id: string) => `/templates/${id}/publish`,
};

export const DOCUMENT_PATHS = {
  select: () => "/documents/new",
  fill: (id: string) => `/documents/${id}/fill`,
  preview: (id: string) => `/documents/${id}/preview`,
  export: (id: string) => `/documents/${id}/export`,
};

/** L'identifiant vaut « new » pour un preset en cours de création */
export const PRESET_PATHS = {
  select: () => "/components/new",
  configure: (id: string) => `/components/${id}/configure`,
  save: (id: string) => `/components/${id}/save`,
};

export const TEMPLATE_WORKFLOW: WorkflowDef = {
  space: "Atelier",
  kind: "tpl",
  listPath: "/templates",
  listLabel: "Templates",
  steps: [
    { key: "start", label: "Point de départ", path: TEMPLATE_PATHS.start },
    { key: "theme", label: "Thème", path: TEMPLATE_PATHS.theme },
    { key: "build", label: "Construire", path: TEMPLATE_PATHS.build },
    { key: "publish", label: "Champs et publication", path: TEMPLATE_PATHS.publish },
  ],
};

export const DOCUMENT_WORKFLOW: WorkflowDef = {
  space: "Studio",
  kind: "doc",
  listPath: "/documents",
  listLabel: "Documents",
  steps: [
    { key: "select", label: "Choisir un template", path: DOCUMENT_PATHS.select },
    { key: "fill", label: "Remplir", path: DOCUMENT_PATHS.fill },
    { key: "preview", label: "Relire", path: DOCUMENT_PATHS.preview },
    { key: "export", label: "Exporter", path: DOCUMENT_PATHS.export },
  ],
};

/** L'identifiant vaut « new » pour un preset en cours de création */
export const PRESET_WORKFLOW: WorkflowDef = {
  space: "Bibliothèque",
  kind: "preset",
  listPath: "/components",
  listLabel: "Presets",
  steps: [
    { key: "select", label: "Composant de base", path: PRESET_PATHS.select },
    { key: "configure", label: "Configurer", path: PRESET_PATHS.configure },
    { key: "save", label: "Nommer et ranger", path: PRESET_PATHS.save },
  ],
};
