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

export const TEMPLATE_WORKFLOW: WorkflowDef = {
  space: "Atelier",
  kind: "tpl",
  listPath: "/templates",
  listLabel: "Templates",
  steps: [
    { key: "start", label: "Point de départ", path: () => "/templates/new" },
    { key: "theme", label: "Thème", path: (id) => `/templates/${id}/theme` },
    { key: "build", label: "Construire", path: (id) => `/templates/${id}/build` },
    { key: "publish", label: "Champs et publication", path: (id) => `/templates/${id}/publish` },
  ],
};

export const DOCUMENT_WORKFLOW: WorkflowDef = {
  space: "Studio",
  kind: "doc",
  listPath: "/documents",
  listLabel: "Documents",
  steps: [
    { key: "select", label: "Choisir un template", path: () => "/documents/new" },
    { key: "fill", label: "Remplir", path: (id) => `/documents/${id}/fill` },
    { key: "preview", label: "Relire", path: (id) => `/documents/${id}/preview` },
    { key: "export", label: "Exporter", path: (id) => `/documents/${id}/export` },
  ],
};

/** L'identifiant vaut « new » pour un preset en cours de création */
export const PRESET_WORKFLOW: WorkflowDef = {
  space: "Bibliothèque",
  kind: "preset",
  listPath: "/components",
  listLabel: "Presets",
  steps: [
    { key: "select", label: "Composant de base", path: () => "/components/new" },
    { key: "configure", label: "Configurer", path: (id) => `/components/${id}/configure` },
    { key: "save", label: "Nommer et ranger", path: (id) => `/components/${id}/save` },
  ],
};
