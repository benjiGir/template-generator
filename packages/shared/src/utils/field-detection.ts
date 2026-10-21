import type { ComponentCategory, PropSchema, PropType } from "../types/component";
import type { ComponentNode, EditableField, Template } from "../types/template";
import { fieldKey } from "./fields";

/** Ce dont la détection a besoin du registre de composants */
export interface ComponentInfo {
  label: string;
  category: ComponentCategory;
  schema: readonly PropSchema[];
}
export type ResolveComponent = (type: string) => ComponentInfo | undefined;

/** Un contenu modifiable du template, avec de quoi le situer dans le document */
export interface DetectedField extends EditableField {
  /** « Page 1 · Carte KPI « Chiffre d'affaires » » */
  location: string;
  /** Retenu par la pré-sélection */
  suggested: boolean;
}

/** Contenus possibles ; les nombres du registre sont des réglages de mise en page (espacement, opacité…) */
const EDITABLE_TYPES = new Set<PropType>(["text", "textarea", "richtext", "list", "image"]);

/** Composants dont le texte sert de titre de section : ils structurent le formulaire */
const SECTION_TITLES: Record<string, string> = {
  "section-header": "text",
  "kpi-row": "sectionTitle",
  "next-section": "title",
};

/** Noms stables : le titre du document, le nom d'un indicateur ou d'un bloc ne changent pas d'une édition à l'autre */
const STABLE_NAMES: Record<string, string> = {
  "title-block": "title",
  "kpi-card": "title",
  "metric-card": "label",
  "detail-block": "title",
};

/** Props dont la valeur nomme le composant (« Chiffre d'affaires » pour une carte KPI) */
const NAMING_PROPS = ["title", "label", "date"];

/**
 * Textes de structure, qui ne changent pas d'une édition à l'autre :
 * titres de section, libellés fixes, identité de marque.
 */
function isStructural(type: string, prop: PropSchema): boolean {
  if (SECTION_TITLES[type] === prop.key) return true;
  if (STABLE_NAMES[type] === prop.key) return true;
  if (/label$/i.test(prop.key) && prop.key !== "label") return true;
  if (type === "page-header") return true;
  if (prop.key === "alt") return true;
  return false;
}

function shorten(text: string, max = 40): string {
  const plain = text
    .replace(/[*_#`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max - 1)}…` : plain;
}

function contextName(node: ComponentNode, info: ComponentInfo): { prop: string; value: string } | null {
  for (const key of NAMING_PROPS) {
    const schema = info.schema.find((s) => s.key === key && s.type === "text");
    const value = node.props[key];
    if (schema && typeof value === "string" && value.trim()) return { prop: key, value: shorten(value) };
  }
  return null;
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

      const titleKey = SECTION_TITLES[node.type];
      const titleValue = titleKey ? node.props[titleKey] : undefined;
      if (typeof titleValue === "string" && titleValue.trim()) {
        section = shorten(titleValue, 50);
        counters = new Map();
      }
      if (node.type === "page-footer") section = "Pied de page";

      const editable = info.schema.filter((s) => EDITABLE_TYPES.has(s.type));
      const name = contextName(node, info);
      const index = (counters.get(node.type) ?? 0) + 1;
      if (editable.length > 0) counters.set(node.type, index);
      const numbered = `${info.label}${index > 1 ? ` ${index}` : ""}`;

      for (const prop of editable) {
        const structural = isStructural(node.type, prop);
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
          suggested: !structural,
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
