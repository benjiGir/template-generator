import type { ObjectKind } from "@/components/ui/ObjectIdentity";

/** Section d'aide de chaque étape des parcours (type d'objet produit → clé d'étape → article#section) */
const STEP_HELP: Record<ObjectKind, Record<string, string>> = {
  doc: {
    select: "studio#choisir",
    fill: "studio#remplir",
    preview: "studio#relire",
    export: "studio#exporter",
  },
  tpl: {
    start: "atelier#point-de-depart",
    theme: "atelier#theme",
    build: "atelier#construire",
    publish: "atelier#champs",
  },
  preset: {
    select: "bibliotheque#preset",
    configure: "bibliotheque#preset",
    save: "bibliotheque#preset",
  },
};

export function stepHelp(kind: ObjectKind, stepKey: string): { slug: string; sectionId?: string } | undefined {
  const target = STEP_HELP[kind][stepKey];
  if (!target) return undefined;
  const [slug = "", sectionId] = target.split("#");
  return { slug, sectionId };
}
