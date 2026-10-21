import { describe, it, expect } from "vitest";
import {
  detectFields,
  reconcileFields,
  suggestedFields,
  groupOrder,
  normalizeFieldOrder,
  type ComponentInfo,
} from "./field-detection";
import type { ComponentNode, TemplatePage } from "../types/template";
import type { PropValues } from "../types/component";

const DEFS: Record<string, ComponentInfo> = {
  "page-header": {
    label: "En-tête de page",
    category: "decoration",
    schema: [{ key: "brandName", label: "Marque", type: "text", defaultValue: "" }],
  },
  "title-block": {
    label: "Bloc titre",
    category: "content",
    schema: [
      { key: "title", label: "Titre", type: "text", defaultValue: "" },
      { key: "subtitle", label: "Sous-titre", type: "text", defaultValue: "" },
    ],
  },
  "section-header": {
    label: "En-tête de section",
    category: "content",
    schema: [{ key: "text", label: "Texte", type: "text", defaultValue: "" }],
  },
  "kpi-row": {
    label: "Ligne de KPIs",
    category: "data",
    schema: [{ key: "sectionTitle", label: "Titre de section", type: "text", defaultValue: "" }],
  },
  "kpi-card": {
    label: "Carte KPI",
    category: "data",
    schema: [
      { key: "emoji", label: "Emoji", type: "emoji", defaultValue: "" },
      { key: "title", label: "Titre", type: "text", defaultValue: "" },
      { key: "description", label: "Description", type: "textarea", defaultValue: "" },
    ],
  },
  "detail-block": {
    label: "Bloc de détails",
    category: "content",
    schema: [
      { key: "title", label: "Titre", type: "text", defaultValue: "" },
      { key: "benefitsLabel", label: "Label bénéfices", type: "text", defaultValue: "" },
      { key: "result", label: "Résultat", type: "textarea", defaultValue: "" },
    ],
  },
  "result-box": {
    label: "Encadré résultat",
    category: "content",
    schema: [{ key: "text", label: "Texte", type: "textarea", defaultValue: "" }],
  },
};
const resolve = (type: string) => DEFS[type];

function n(id: string, type: string, props: PropValues = {}, children?: ComponentNode[]): ComponentNode {
  return { id, type, props, children };
}

const PAGES: TemplatePage[] = [
  {
    id: "p1",
    children: [
      n("ph", "page-header", { brandName: "KOMITY" }),
      n("tb", "title-block", { title: "Rapport", subtitle: "Q1 2026" }),
      n("kr", "kpi-row", { sectionTitle: "Indicateurs clés" }, [
        n("k1", "kpi-card", { title: "Chiffre d'affaires", description: "1,2 M€" }),
        n("k2", "kpi-card", { title: "Marge", description: "67 %" }),
      ]),
      n("sh", "section-header", { text: "Analyse détaillée" }),
      n("d1", "detail-block", { title: "Revenus", benefitsLabel: "Bénéfices", result: "OK" }),
      n("r1", "result-box", { text: "a" }),
      n("r2", "result-box", { text: "b" }),
    ],
  },
];

describe("detectFields", () => {
  const fields = detectFields({ pages: PAGES }, resolve);
  const byKey = (k: string) => {
    const field = fields.find((f) => `${f.nodeId}.${f.propKey}` === k);
    if (!field) throw new Error(`Champ ${k} non détecté`);
    return field;
  };

  it("exclut les textes de structure de la pré-sélection", () => {
    expect(byKey("ph.brandName").suggested).toBe(false);
    expect(byKey("kr.sectionTitle").suggested).toBe(false);
    expect(byKey("sh.text").suggested).toBe(false);
    expect(byKey("d1.benefitsLabel").suggested).toBe(false);
    expect(byKey("tb.title").suggested).toBe(false);
    expect(byKey("k1.title").suggested).toBe(false);
    expect(byKey("d1.title").suggested).toBe(false);
    expect(byKey("tb.subtitle").suggested).toBe(true);
    expect(byKey("k1.description").suggested).toBe(true);
  });

  it("ne propose ni les emojis ni les réglages numériques", () => {
    expect(fields.some((f) => f.propKey === "emoji")).toBe(false);
    const withGrid = detectFields({ pages: [{ id: "p", children: [n("g", "grid", { gap: 12 })] }] }, (t) =>
      t === "grid"
        ? {
            label: "Grille",
            category: "layout",
            schema: [{ key: "gap", label: "Gap", type: "number", defaultValue: 12 }],
          }
        : undefined,
    );
    expect(withGrid).toHaveLength(0);
  });

  it("nomme les champs par leur contexte", () => {
    expect(byKey("k1.description").label).toBe("Chiffre d'affaires — Description");
    expect(byKey("k2.title").label).toBe("Carte KPI 2 — Titre");
    expect(byKey("d1.result").label).toBe("Revenus — Résultat");
    expect(byKey("r1.text").label).toBe("Encadré résultat");
    expect(byKey("r2.text").label).toBe("Encadré résultat 2");
  });

  it("groupe selon les titres de section du document", () => {
    expect(byKey("tb.subtitle").group).toBe("En-tête");
    expect(byKey("k1.description").group).toBe("Indicateurs clés");
    expect(byKey("d1.result").group).toBe("Analyse détaillée");
  });

  it("situe chaque champ dans le document", () => {
    expect(byKey("k1.description").location).toBe("Page 1 · Carte KPI « Chiffre d'affaires »");
  });

  it("propose une pré-sélection ordonnée", () => {
    const suggested = suggestedFields(fields);
    expect(suggested.every((f, i) => f.order === i)).toBe(true);
    expect(groupOrder(suggested)).toEqual(["En-tête", "Indicateurs clés", "Analyse détaillée"]);
  });
});

describe("reconcileFields", () => {
  const detected = detectFields({ pages: PAGES }, resolve);

  it("garde les réglages du concepteur et ignore les composants disparus", () => {
    const stored = [
      {
        nodeId: "k1",
        propKey: "description",
        label: "CA du trimestre",
        type: "text" as const,
        defaultValue: "",
        required: true,
        group: "KPIs",
        order: 1,
      },
      {
        nodeId: "gone",
        propKey: "text",
        label: "Disparu",
        type: "text" as const,
        defaultValue: "",
        required: false,
        order: 0,
      },
    ];
    const { retained, excluded } = reconcileFields(stored, detected);
    expect(retained).toHaveLength(1);
    expect(retained[0]).toMatchObject({
      label: "CA du trimestre",
      required: true,
      group: "KPIs",
      type: "textarea",
      defaultValue: "1,2 M€",
      order: 0,
    });
    expect(excluded.some((f) => f.nodeId === "k1" && f.propKey === "description")).toBe(false);
    expect(excluded.length).toBe(detected.length - 1);
  });
});

describe("normalizeFieldOrder", () => {
  it("regroupe les champs d'un même groupe et renumérote", () => {
    const f = (key: string, group: string | undefined, order: number) => ({
      nodeId: key,
      propKey: "p",
      label: key,
      type: "text" as const,
      defaultValue: "",
      required: false,
      group,
      order,
    });
    const result = normalizeFieldOrder([f("a", "A", 0), f("b", "B", 1), f("c", "A", 2), f("d", undefined, 3)]);
    expect(result.map((x) => [x.nodeId, x.order])).toEqual([
      ["a", 0],
      ["c", 1],
      ["b", 2],
      ["d", 3],
    ]);
  });
});
