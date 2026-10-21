import type { TemplatePage } from "@template-generator/shared/types/template";

/**
 * Page d'exemple pour régler le thème d'un template encore vide :
 * elle montre les composants les plus courants dans chacune des couleurs du thème.
 */
export const SAMPLE_PAGE: TemplatePage = {
  id: "sample",
  label: "Exemple",
  children: [
    { id: "s-ph", type: "page-header", props: { brandName: "VOTRE MARQUE", brandSub: "Direction" } },
    { id: "s-tb", type: "title-block", props: { title: "Titre du document", subtitle: "Période — sous-titre" } },
    {
      id: "s-ib",
      type: "intro-box",
      props: { content: "Un **encadré d'introduction** présente le document en quelques lignes." },
    },
    {
      id: "s-kr",
      type: "kpi-row",
      props: { sectionTitle: "Indicateurs clés" },
      children: [
        {
          id: "s-k1",
          type: "kpi-card",
          props: { emoji: "📈", title: "Carte bleue", description: "Couleur de marque.", color: "blue" },
        },
        {
          id: "s-k2",
          type: "kpi-card",
          props: { emoji: "✅", title: "Carte verte", description: "Couleur verte.", color: "green" },
        },
        {
          id: "s-k3",
          type: "kpi-card",
          props: { emoji: "⚠️", title: "Carte ambre", description: "Couleur ambre.", color: "amber" },
        },
      ],
    },
    { id: "s-sh", type: "section-header", props: { text: "Titre de section" } },
    {
      id: "s-db",
      type: "detail-block",
      props: {
        title: "Bloc de détails",
        paragraphs: ["Paragraphe de texte courant, dans la couleur de texte du thème."],
        benefits: ["Bénéfice", "Autre bénéfice"],
        result: "Encadré de résultat, sur le fond des encadrés.",
        color: "blue",
      },
    },
    { id: "s-rb", type: "result-box", props: { text: "Encadré résultat : fond des encadrés et texte courant." } },
    { id: "s-pf", type: "page-footer", props: { text: "Pied de page — texte secondaire" } },
  ],
};
