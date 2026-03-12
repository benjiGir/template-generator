import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { templates } from "../db/schema";
import type { Template } from "@template-generator/shared/types/template";
import { DEFAULT_THEME, DEFAULT_PAGE_FORMAT } from "@template-generator/shared/types/template";

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const db = drizzle(pool);

const komityTemplate: Omit<Template, "id" | "createdAt" | "updatedAt"> = {
  name: "KOMITY — Chantiers Techniques",
  description: "Template de revue des chantiers techniques mensuels",
  theme: {
    ...DEFAULT_THEME,
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#2563EB",
      accent: "#3B82F6",
    },
  },
  pageFormat: DEFAULT_PAGE_FORMAT,
  pages: [
    {
      id: "page-1",
      label: "Page 1 — Vue d'ensemble",
      children: [
        {
          id: "ph-1",
          type: "page-header",
          props: { brandName: "KOMITY", brandSub: "Chantiers Techniques", showChevron: true },
        },
        {
          id: "tb-1",
          type: "title-block",
          props: {
            title: "Revue des Chantiers Techniques",
            subtitle: "Bilan mensuel — Janvier 2025",
          },
        },
        {
          id: "ib-1",
          type: "intro-box",
          props: {
            content:
              "Ce document présente l'avancement des **chantiers techniques** du mois. Il couvre les livraisons réalisées, les indicateurs clés et les prochaines étapes.",
            accentColor: "#2563EB",
          },
        },
        {
          id: "kr-1",
          type: "kpi-row",
          props: { sectionTitle: "Indicateurs du mois" },
          children: [
            {
              id: "kc-1",
              type: "kpi-card",
              props: {
                emoji: "✅",
                title: "Tâches terminées",
                description: "Toutes les tâches planifiées ont été livrées dans les délais.",
                color: "green",
              },
            },
            {
              id: "kc-2",
              type: "kpi-card",
              props: {
                emoji: "⚡",
                title: "Vélocité",
                description: "+18% par rapport au mois précédent.",
                color: "blue",
              },
            },
            {
              id: "kc-3",
              type: "kpi-card",
              props: {
                emoji: "🐛",
                title: "Bugs résolus",
                description: "12 bugs critiques corrigés en production.",
                color: "amber",
              },
            },
            {
              id: "kc-4",
              type: "kpi-card",
              props: {
                emoji: "🚀",
                title: "Déploiements",
                description: "4 déploiements sans incident.",
                color: "blue",
              },
            },
          ],
        },
        {
          id: "db-1",
          type: "detail-block",
          props: {
            title: "Refonte du système d'authentification",
            color: "blue",
            paragraphs: [
              "Migration complète vers JWT avec refresh tokens.",
              "Mise en place du SSO avec le provider existant.",
            ],
            benefitsLabel: "Bénéfices",
            benefits: ["Sécurité renforcée", "Session persistante", "Compatibilité mobile"],
            result: "Livré en production le 15 janvier. Aucun incident signalé.",
            suite: "Audit de sécurité prévu en février.",
          },
        },
        {
          id: "pf-1",
          type: "page-footer",
          props: { text: "KOMITY — Document confidentiel — Janvier 2025" },
        },
      ],
    },
    {
      id: "page-2",
      label: "Page 2 — Chantiers & Suite",
      children: [
        {
          id: "ph-2",
          type: "page-header",
          props: { brandName: "KOMITY", brandSub: "Chantiers Techniques", showChevron: true },
        },
        {
          id: "sh-1",
          type: "section-header",
          props: { text: "Chantiers en cours" },
        },
        {
          id: "tg-1",
          type: "two-column-grid",
          props: { gap: 16 },
          children: [
            {
              id: "db-2",
              type: "detail-block",
              props: {
                title: "Optimisation des performances API",
                color: "green",
                paragraphs: ["Mise en cache Redis sur les endpoints critiques."],
                benefitsLabel: "Gains mesurés",
                benefits: ["P99 < 200ms", "Réduction charge DB 40%"],
                result: "En cours — 70% réalisé.",
                suite: "Finalisation prévue semaine 5.",
              },
            },
            {
              id: "db-3",
              type: "detail-block",
              props: {
                title: "Mise à jour infrastructure",
                color: "amber",
                paragraphs: ["Migration Kubernetes vers la version 1.29."],
                benefitsLabel: "Bénéfices",
                benefits: ["Support LTS garanti", "Nouvelles features réseau"],
                result: "Planifié — démarrage semaine 4.",
                suite: "Fenêtre de maintenance réservée.",
              },
            },
          ],
        },
        {
          id: "ns-1",
          type: "next-section",
          props: {
            title: "Et pour la suite ?",
            intro: "Les priorités techniques pour le prochain mois sont les suivantes :",
            items: [
              "Finaliser l'optimisation des performances API",
              "Démarrer la migration infrastructure Kubernetes",
              "Lancer le chantier observabilité (OpenTelemetry)",
              "Réviser la stratégie de tests E2E",
            ],
            summary: "4 chantiers planifiés pour février 2025.",
          },
        },
        {
          id: "pf-2",
          type: "page-footer",
          props: { text: "KOMITY — Document confidentiel — Janvier 2025" },
        },
      ],
    },
  ],
};

const existing = await db.select({ id: templates.id }).from(templates).limit(1);

if (existing.length > 0) {
  console.log("DB déjà seedée, rien à faire.");
} else {
  await db.insert(templates).values(komityTemplate as typeof templates.$inferInsert);
  console.log("Template KOMITY inséré.");
}

await pool.end();