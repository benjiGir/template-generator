import type { ComponentCategory, PropRole, PropSchema, PropType } from "../types/component";
import type { ComponentNode, EditableField, Template } from "../types/template";
import { fieldKey } from "./fields";

/** Ce dont la détection a besoin du registre de composants */
export interface ComponentInfo {
  label: string;
  category: ComponentCategory;
  schema: readonly PropSchema[];
  /** Groupe du formulaire ouvert par le composant lui-même (« Pied de page ») */
  formGroup?: string;
}
export type ResolveComponent = (type: string) => ComponentInfo | undefined;

/** Un contenu modifiable du template, avec de quoi le situer dans le document */
export interface DetectedField extends EditableField {
  /** « Page 1 · Carte KPI « Chiffre d'affaires » » */
  location: string;
  /** Retenu par la pré-sélection */
  suggested: boolean;
}

/*
 * La détection ne connaît aucun composant par son nom : tout vient du schéma de ses props.
 * Ajouter un composant au registre ne demande donc rien ici ; il suffit de déclarer le rôle
 * de ses textes (`role` dans le schéma, « content » par défaut).
 */

/** Contenus possibles ; les nombres du registre sont des réglages de mise en page (espacement, opacité…) */
const EDITABLE_TYPES = new Set<PropType>(["text", "textarea", "richtext", "list", "image"]);

/** Rôles qui changent d'une édition à l'autre : ils forment la pré-sélection */
const PRESELECTED_ROLES = new Set<PropRole>(["content", "heading"]);

/** Rôles dont la valeur nomme le composant (« Chiffre d'affaires » pour une carte KPI) */
const NAMING_ROLES = new Set<PropRole>(["heading", "name", "section"]);

function roleOf(prop: PropSchema): PropRole {
  return prop.role ?? "content";
}

function shorten(text: string, max = 40): string {
  const plain = text
    .replace(/[*_#`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max - 1)}…` : plain;
}

/** Le premier texte non vide qui nomme le composant, dans l'ordre du schéma */
function contextName(node: ComponentNode, info: ComponentInfo): { prop: string; value: string } | null {
  for (const prop of info.schema) {
    if (!NAMING_ROLES.has(roleOf(prop)) || prop.type !== "text") continue;
    const value = node.props[prop.key];
    if (typeof value === "string" && value.trim()) return { prop: prop.key, value: shorten(value) };
  }
  return null;
}

/** Titre de section porté par le composant, s'il en a un */
function sectionTitle(node: ComponentNode, info: ComponentInfo): string | null {
  const prop = info.schema.find((p) => roleOf(p) === "section");
  const value = prop ? node.props[prop.key] : undefined;
  return typeof value === "string" && value.trim() ? shorten(value, 50) : null;
}

/**
 * Liste tous les contenus modifiables du template, dans l'ordre du document,
 * avec un libellé lisible, un groupe déduit des titres de section et une pré-sélection.
 */
export function detectFields(template: Pick<Template, "pages">, resolve: ResolveComponent): DetectedField[] {
  const fields: DetectedField[] = [];
  let order = 0;

  template.pages.forEach((page, pageIndex) => {
    const pageLabel = page.label?.trim() || `Page ${pageIndex + 1}`;
    let section: string | null = pageIndex === 0 ? "En-tête" : pageLabel;
    // Numérotation des composants sans nom (« Encadré résultat 2 ») au sein d'une section
    let counters = new Map<string, number>();

    const visit = (node: ComponentNode) => {
      const info = resolve(node.type);
      if (!info) return;

      const title = sectionTitle(node, info);
      if (title) {
        section = title;
        counters = new Map();
      }
      if (info.formGroup) section = info.formGroup;

      const editable = info.schema.filter((s) => EDITABLE_TYPES.has(s.type));
      const name = contextName(node, info);
      const index = (counters.get(node.type) ?? 0) + 1;
      if (editable.length > 0) counters.set(node.type, index);
      const numbered = `${info.label}${index > 1 ? ` ${index}` : ""}`;

      for (const prop of editable) {
        let label: string;
        if (editable.length === 1) label = name && name.prop !== prop.key ? name.value : numbered;
        else if (name && name.prop !== prop.key) label = `${name.value} — ${prop.label}`;
        else label = `${numbered} — ${prop.label}`;

        fields.push({
          nodeId: node.id,
          propKey: prop.key,
          label,
          type: prop.type,
          defaultValue: node.props[prop.key] ?? prop.defaultValue,
          required: prop.required ?? false,
          group: section ?? undefined,
          order: order++,
          location: `${pageLabel} · ${info.label}${name ? ` « ${name.value} »` : ""}`,
          suggested: PRESELECTED_ROLES.has(roleOf(prop)),
        });
      }

      node.children?.forEach(visit);
    };

    page.children.forEach(visit);
  });

  // Deux libellés identiques dans un même groupe seraient ambigus pour le contributeur
  const seen = new Map<string, number>();
  for (const f of fields) {
    const k = `${f.group}::${f.label}`;
    const n = (seen.get(k) ?? 0) + 1;
    seen.set(k, n);
    if (n > 1) f.label = `${f.label} (${n})`;
  }

  return fields;
}

/** Pré-sélection : les contenus non structurels, avec leurs libellés et groupes proposés */
export function suggestedFields(detected: DetectedField[]): EditableField[] {
  return detected.filter((f) => f.suggested).map((f, i) => toEditable(f, i));
}

export function toEditable(f: DetectedField, order: number): EditableField {
  return {
    nodeId: f.nodeId,
    propKey: f.propKey,
    label: f.label,
    type: f.type,
    defaultValue: f.defaultValue,
    required: f.required,
    group: f.group,
    order,
  };
}

export interface ReconciledFields {
  /** Champs retenus, dans l'ordre du formulaire, enrichis de leur emplacement */
  retained: (EditableField & { location: string })[];
  /** Contenus modifiables non retenus, dans l'ordre du document */
  excluded: DetectedField[];
}

/**
 * Confronte la configuration enregistrée au template actuel :
 * les réglages du concepteur sont conservés, les champs dont le composant a disparu sont ignorés.
 */
export function reconcileFields(stored: EditableField[], detected: DetectedField[]): ReconciledFields {
  const byKey = new Map(detected.map((f) => [fieldKey(f), f]));
  const retained = stored
    .toSorted((a, b) => a.order - b.order)
    .flatMap((field) => {
      const detectedField = byKey.get(fieldKey(field));
      return detectedField ? [{ field, detected: detectedField }] : [];
    })
    .map(({ field, detected: d }, i) => ({
      ...field,
      type: d.type,
      defaultValue: d.defaultValue,
      order: i,
      location: d.location,
    }));
  const retainedKeys = new Set(retained.map(fieldKey));
  return { retained, excluded: detected.filter((f) => !retainedKeys.has(fieldKey(f))) };
}

/** Groupes dans l'ordre du formulaire, par première apparition (null = champs sans groupe) */
export function groupOrder(fields: EditableField[]): (string | null)[] {
  const groups: (string | null)[] = [];
  for (const f of fields.toSorted((a, b) => a.order - b.order)) {
    const g = f.group ?? null;
    if (!groups.includes(g)) groups.push(g);
  }
  return groups;
}

/**
 * Rend les champs d'un même groupe contigus et renumérote l'ordre :
 * c'est l'ordre dans lequel le Studio affiche le formulaire.
 */
export function normalizeFieldOrder(fields: EditableField[]): EditableField[] {
  const sorted = fields.toSorted((a, b) => a.order - b.order);
  return groupOrder(sorted)
    .flatMap((g) => sorted.filter((f) => (f.group ?? null) === g))
    .map((f, i) => ({ ...f, order: i }));
}
