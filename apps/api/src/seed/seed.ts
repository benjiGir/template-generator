import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { templates, componentPresets, themes, documents } from "../db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_PAGE_FORMAT } from "@template-generator/shared/types/template";
import {
  KOMITY_BLUE,
  MINIMAL_LIGHT,
  MINIMAL_DARK,
  CORPORATE_GRAY,
  VIBRANT_GRADIENT,
  BUILTIN_THEMES,
} from "@template-generator/shared/themes/presets";
import type { Template } from "@template-generator/shared/types/template";

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const db = drizzle(pool);

// ─── Thèmes ────────────────────────────────────────────────────────────────

console.log("\n── Thèmes ──");
for (const theme of BUILTIN_THEMES) {
  const existing = await db.select().from(themes).where(eq(themes.name, theme.name));
  if (existing.length === 0) {
    await db.insert(themes).values({ name: theme.name, theme, isBuiltin: true });
    console.log(`  ✓ Thème inséré : ${theme.name}`);
  } else {
    console.log(`  — Thème déjà présent : ${theme.name}`);
  }
}

// ─── Templates ─────────────────────────────────────────────────────────────

console.log("\n── Templates ──");

type TemplateInsert = Omit<Template, "id" | "createdAt" | "updatedAt">;

const TEMPLATES: TemplateInsert[] = [
  // 1 — Chantiers Techniques (KOMITY Blue)
  {
    name: "KOMITY — Chantiers Techniques",
    description: "Revue mensuelle des chantiers techniques : livraisons, indicateurs et prochaines étapes.",
    theme: KOMITY_BLUE,
    pageFormat: DEFAULT_PAGE_FORMAT,
    published: true,
    tags: ["technique", "mensuel", "komity"],
    editableFields: [
      { nodeId: "tb-1", propKey: "subtitle", label: "Période (ex. Bilan mensuel — Janvier 2025)", type: "text", defaultValue: "", required: true, group: "En-tête", order: 0 },
      { nodeId: "ib-1", propKey: "content", label: "Introduction", type: "richtext", defaultValue: "", required: false, group: "En-tête", order: 1 },
      { nodeId: "kc-1", propKey: "description", label: "KPI — Tâches terminées", type: "text", defaultValue: "", required: false, group: "KPIs", order: 2 },
      { nodeId: "kc-2", propKey: "description", label: "KPI — Vélocité", type: "text", defaultValue: "", required: false, group: "KPIs", order: 3 },
      { nodeId: "kc-3", propKey: "description", label: "KPI — Bugs résolus", type: "text", defaultValue: "", required: false, group: "KPIs", order: 4 },
      { nodeId: "kc-4", propKey: "description", label: "KPI — Déploiements", type: "text", defaultValue: "", required: false, group: "KPIs", order: 5 },
      { nodeId: "db-1", propKey: "result", label: "Chantier principal — Résultat", type: "text", defaultValue: "", required: false, group: "Chantiers", order: 6 },
      { nodeId: "pf-1", propKey: "text", label: "Pied de page", type: "text", defaultValue: "", required: false, group: "Mise en page", order: 7 },
    ],
    pages: [
      {
        id: "page-1",
        label: "Vue d'ensemble",
        children: [
          { id: "ph-1", type: "page-header", props: { brandName: "KOMITY", brandSub: "Chantiers Techniques", showChevron: true } },
          { id: "tb-1", type: "title-block", props: { title: "Revue des Chantiers Techniques", subtitle: "Bilan mensuel — Janvier 2025" } },
          { id: "ib-1", type: "intro-box", props: { content: "Ce document présente l'avancement des **chantiers techniques** du mois.", accentColor: "#2563EB" } },
          {
            id: "kr-1", type: "kpi-row", props: { sectionTitle: "Indicateurs du mois" },
            children: [
              { id: "kc-1", type: "kpi-card", props: { emoji: "✅", title: "Tâches terminées", description: "Toutes les tâches planifiées livrées.", color: "green" } },
              { id: "kc-2", type: "kpi-card", props: { emoji: "⚡", title: "Vélocité", description: "+18% vs mois précédent.", color: "blue" } },
              { id: "kc-3", type: "kpi-card", props: { emoji: "🐛", title: "Bugs résolus", description: "12 bugs critiques corrigés.", color: "amber" } },
              { id: "kc-4", type: "kpi-card", props: { emoji: "🚀", title: "Déploiements", description: "4 déploiements sans incident.", color: "blue" } },
            ],
          },
          { id: "db-1", type: "detail-block", props: { title: "Refonte système d'authentification", color: "blue", paragraphs: ["Migration complète vers JWT avec refresh tokens.", "Mise en place du SSO."], benefitsLabel: "Bénéfices", benefits: ["Sécurité renforcée", "Session persistante", "Compatibilité mobile"], result: "Livré en production le 15 janvier.", suite: "Audit de sécurité prévu en février." } },
          { id: "pf-1", type: "page-footer", props: { text: "KOMITY — Document confidentiel — Janvier 2025" } },
        ],
      },
      {
        id: "page-2",
        label: "Chantiers & Suite",
        children: [
          { id: "ph-2", type: "page-header", props: { brandName: "KOMITY", brandSub: "Chantiers Techniques", showChevron: true } },
          { id: "sh-1", type: "section-header", props: { text: "Chantiers en cours" } },
          {
            id: "tg-1", type: "two-column-grid", props: { gap: 16 },
            children: [
              { id: "db-2", type: "detail-block", props: { title: "Optimisation performances API", color: "green", paragraphs: ["Mise en cache Redis sur les endpoints critiques."], benefitsLabel: "Gains", benefits: ["P99 < 200ms", "Charge DB -40%"], result: "En cours — 70% réalisé.", suite: "Finalisation semaine 5." } },
              { id: "db-3", type: "detail-block", props: { title: "Mise à jour infrastructure", color: "amber", paragraphs: ["Migration Kubernetes 1.29."], benefitsLabel: "Bénéfices", benefits: ["Support LTS", "Nouvelles features réseau"], result: "Planifié — démarrage semaine 4.", suite: "Fenêtre de maintenance réservée." } },
            ],
          },
          { id: "ns-1", type: "next-section", props: { title: "Et pour la suite ?", intro: "Les priorités pour le prochain mois :", items: ["Finaliser l'optimisation API", "Démarrer la migration K8s", "Lancer le chantier observabilité", "Réviser la stratégie tests E2E"], summary: "4 chantiers planifiés pour février 2025." } },
          { id: "pf-2", type: "page-footer", props: { text: "KOMITY — Document confidentiel — Janvier 2025" } },
        ],
      },
    ],
  },

  // 2 — Bilan RH Mensuel (Minimal Light)
  {
    name: "RH — Bilan Mensuel",
    description: "Tableau de bord RH mensuel : effectifs, recrutements, absences et actions prioritaires.",
    theme: MINIMAL_LIGHT,
    pageFormat: DEFAULT_PAGE_FORMAT,
    published: true,
    tags: ["rh", "mensuel", "effectifs"],
    editableFields: [
      { nodeId: "rh-tb-1", propKey: "subtitle", label: "Période", type: "text", defaultValue: "", required: true, group: "En-tête", order: 0 },
      { nodeId: "rh-kc-1", propKey: "description", label: "KPI — Effectif total", type: "text", defaultValue: "", required: false, group: "KPIs", order: 1 },
      { nodeId: "rh-kc-2", propKey: "description", label: "KPI — Recrutements", type: "text", defaultValue: "", required: false, group: "KPIs", order: 2 },
      { nodeId: "rh-kc-3", propKey: "description", label: "KPI — Taux absentéisme", type: "text", defaultValue: "", required: false, group: "KPIs", order: 3 },
      { nodeId: "rh-kc-4", propKey: "description", label: "KPI — Satisfaction", type: "text", defaultValue: "", required: false, group: "KPIs", order: 4 },
      { nodeId: "rh-ns-1", propKey: "items", label: "Actions prioritaires", type: "list", defaultValue: [], required: false, group: "Synthèse", order: 5 },
    ],
    pages: [
      {
        id: "rh-page-1",
        label: "Tableau de bord RH",
        children: [
          { id: "rh-ph-1", type: "page-header", props: { brandName: "KOMITY", brandSub: "Ressources Humaines", showChevron: false } },
          { id: "rh-tb-1", type: "title-block", props: { title: "Bilan RH Mensuel", subtitle: "Janvier 2025" } },
          { id: "rh-ib-1", type: "intro-box", props: { content: "Synthèse des indicateurs RH du mois : effectifs, mouvements de personnel, absences et satisfaction collaborateurs.", accentColor: "#6366F1" } },
          {
            id: "rh-kr-1", type: "kpi-row", props: { sectionTitle: "Indicateurs clés RH" },
            children: [
              { id: "rh-kc-1", type: "kpi-card", props: { emoji: "👥", title: "Effectif total", description: "142 collaborateurs actifs.", color: "blue" } },
              { id: "rh-kc-2", type: "kpi-card", props: { emoji: "🎯", title: "Recrutements", description: "3 postes pourvus ce mois.", color: "green" } },
              { id: "rh-kc-3", type: "kpi-card", props: { emoji: "📅", title: "Absentéisme", description: "3,2% — en baisse vs décembre.", color: "amber" } },
              { id: "rh-kc-4", type: "kpi-card", props: { emoji: "⭐", title: "Satisfaction", description: "eNPS : +42 (enquête jan.)", color: "green" } },
            ],
          },
          { id: "rh-sh-1", type: "section-header", props: { text: "Mouvements du mois" } },
          {
            id: "rh-tg-1", type: "two-column-grid", props: { gap: 16 },
            children: [
              { id: "rh-db-1", type: "detail-block", props: { title: "Entrées", color: "green", paragraphs: ["3 nouvelles recrues intégrées : 2 développeurs et 1 chargée de projet."], benefitsLabel: "Profils", benefits: ["Dev Backend (Nodejs)", "Dev Frontend (React)", "Chargée de projet digital"], result: "Intégration réussie pour les 3 collaborateurs.", suite: "Période d'essai de 3 mois en cours." } },
              { id: "rh-db-2", type: "detail-block", props: { title: "Sorties & Mobilités", color: "amber", paragraphs: ["1 départ volontaire, 1 promotion interne."], benefitsLabel: "Détail", benefits: ["Départ : fin de contrat CDD", "Promotion : Team Lead Engineering"], result: "Plan de succession activé pour le poste ouvert.", suite: "Recrutement ouvert — objectif fin février." } },
            ],
          },
          { id: "rh-ns-1", type: "next-section", props: { title: "Actions prioritaires", intro: "Les chantiers RH du mois prochain :", items: ["Finaliser le recrutement Backend ouvert", "Lancer la campagne d'entretiens annuels", "Déployer le nouveau module de formation", "Préparer le bilan social annuel"], summary: "4 actions RH planifiées pour février." } },
          { id: "rh-pf-1", type: "page-footer", props: { text: "KOMITY — Ressources Humaines — Confidentiel — Janvier 2025" } },
        ],
      },
    ],
  },

  // 3 — Rapport Financier Trimestriel (Corporate Gray)
  {
    name: "Finance — Rapport Trimestriel",
    description: "Rapport de performance financière trimestrielle : revenus, dépenses, marges et projections.",
    theme: CORPORATE_GRAY,
    pageFormat: DEFAULT_PAGE_FORMAT,
    published: true,
    tags: ["finance", "trimestriel", "performance"],
    editableFields: [
      { nodeId: "fi-tb-1", propKey: "subtitle", label: "Trimestre", type: "text", defaultValue: "", required: true, group: "En-tête", order: 0 },
      { nodeId: "fi-kc-1", propKey: "description", label: "KPI — Chiffre d'affaires", type: "text", defaultValue: "", required: true, group: "KPIs", order: 1 },
      { nodeId: "fi-kc-2", propKey: "description", label: "KPI — Marge brute", type: "text", defaultValue: "", required: true, group: "KPIs", order: 2 },
      { nodeId: "fi-kc-3", propKey: "description", label: "KPI — Nouveaux clients", type: "text", defaultValue: "", required: false, group: "KPIs", order: 3 },
      { nodeId: "fi-kc-4", propKey: "description", label: "KPI — MRR", type: "text", defaultValue: "", required: false, group: "KPIs", order: 4 },
      { nodeId: "fi-db-1", propKey: "result", label: "Analyse revenus — Résultat", type: "text", defaultValue: "", required: false, group: "Analyse", order: 5 },
      { nodeId: "fi-db-2", propKey: "result", label: "Analyse dépenses — Résultat", type: "text", defaultValue: "", required: false, group: "Analyse", order: 6 },
    ],
    pages: [
      {
        id: "fi-page-1",
        label: "Performance financière",
        children: [
          { id: "fi-ph-1", type: "page-header", props: { brandName: "KOMITY", brandSub: "Direction Financière", showChevron: false } },
          { id: "fi-tb-1", type: "title-block", props: { title: "Rapport Financier Trimestriel", subtitle: "Q1 2025 — Janvier · Février · Mars" } },
          { id: "fi-ib-1", type: "intro-box", props: { content: "Ce rapport présente les résultats financiers du **premier trimestre 2025** et les projections pour le trimestre suivant.", accentColor: "#1D4ED8" } },
          {
            id: "fi-kr-1", type: "kpi-row", props: { sectionTitle: "Indicateurs financiers clés" },
            children: [
              { id: "fi-kc-1", type: "kpi-card", props: { emoji: "💰", title: "Chiffre d'affaires", description: "€ 1,24M — +12% vs Q1 2024.", color: "green" } },
              { id: "fi-kc-2", type: "kpi-card", props: { emoji: "📈", title: "Marge brute", description: "67% — stable vs objectif.", color: "blue" } },
              { id: "fi-kc-3", type: "kpi-card", props: { emoji: "🏢", title: "Nouveaux clients", description: "14 comptes signés ce trimestre.", color: "green" } },
              { id: "fi-kc-4", type: "kpi-card", props: { emoji: "🔄", title: "MRR", description: "€ 98K — objectif Q2 : € 115K.", color: "blue" } },
            ],
          },
          { id: "fi-sh-1", type: "section-header", props: { text: "Analyse détaillée" } },
          {
            id: "fi-tg-1", type: "two-column-grid", props: { gap: 16 },
            children: [
              { id: "fi-db-1", type: "detail-block", props: { title: "Revenus", color: "green", paragraphs: ["Croissance portée par le segment Enterprise (+28%) et les nouveaux contrats annuels."], benefitsLabel: "Sources", benefits: ["SaaS récurrent : 72%", "Services : 18%", "Marketplace : 10%"], result: "Objectif Q1 atteint à 103%.", suite: "Accélération prévue sur le canal partenaires." } },
              { id: "fi-db-2", type: "detail-block", props: { title: "Dépenses", color: "amber", paragraphs: ["Légère surconsommation sur le poste R&D (+€ 18K) liée aux recrutements."], benefitsLabel: "Répartition", benefits: ["R&D : 38%", "Commercial : 25%", "G&A : 22%", "Marketing : 15%"], result: "Ratio dépenses/CA : 61% (vs 63% Q1 2024).", suite: "Plan d'optimisation G&A lancé pour Q2." } },
            ],
          },
          { id: "fi-ns-1", type: "next-section", props: { title: "Projections Q2", intro: "Les objectifs financiers pour le deuxième trimestre :", items: ["Atteindre € 115K MRR fin juin", "Signer 20 nouveaux comptes Enterprise", "Réduire le ratio G&A à 18%", "Lancer la facturation annuelle anticipée"], summary: "Objectif CA Q2 : € 1,45M (+17% vs Q2 2024)." } },
          { id: "fi-pf-1", type: "page-footer", props: { text: "KOMITY — Direction Financière — Strictement Confidentiel — Q1 2025" } },
        ],
      },
    ],
  },

  // 4 — Release Notes Produit (Vibrant) — non publié
  {
    name: "Produit — Release Notes",
    description: "Notes de version produit : nouvelles fonctionnalités, améliorations et corrections.",
    theme: VIBRANT_GRADIENT,
    pageFormat: DEFAULT_PAGE_FORMAT,
    published: false,
    tags: ["produit", "release", "changelog"],
    editableFields: [],
    pages: [
      {
        id: "rn-page-1",
        label: "Release Notes",
        children: [
          { id: "rn-ph-1", type: "page-header", props: { brandName: "KOMITY", brandSub: "Product Updates", showChevron: true } },
          { id: "rn-tb-1", type: "title-block", props: { title: "Release Notes", subtitle: "Version 3.4 — Mars 2025" } },
          { id: "rn-ib-1", type: "intro-box", props: { content: "La version **3.4** apporte de nouvelles fonctionnalités majeures, des améliorations de performance et des corrections importantes.", accentColor: "#7C3AED" } },
          {
            id: "rn-kr-1", type: "kpi-row", props: { sectionTitle: "Cette version en chiffres" },
            children: [
              { id: "rn-kc-1", type: "kpi-card", props: { emoji: "✨", title: "Nouvelles features", description: "8 fonctionnalités majeures ajoutées.", color: "blue" } },
              { id: "rn-kc-2", type: "kpi-card", props: { emoji: "⚡", title: "Perf.", description: "Temps de chargement réduit de 35%.", color: "green" } },
              { id: "rn-kc-3", type: "kpi-card", props: { emoji: "🐛", title: "Corrections", description: "23 bugs corrigés.", color: "amber" } },
              { id: "rn-kc-4", type: "kpi-card", props: { emoji: "🔒", title: "Sécurité", description: "2 CVE patchés.", color: "green" } },
            ],
          },
          { id: "rn-sh-1", type: "section-header", props: { text: "Fonctionnalités majeures" } },
          { id: "rn-db-1", type: "detail-block", props: { title: "Éditeur de templates v2", color: "blue", paragraphs: ["Refonte complète de l'éditeur avec glisser-déposer, prévisualisation en temps réel et gestion multi-pages."], benefitsLabel: "Nouveautés", benefits: ["Drag & drop entre pages", "Prévisualisation instantanée", "Export PDF amélioré", "Thèmes personnalisables"], result: "Disponible pour tous les plans dès la mise à jour.", suite: "Tutoriels vidéo publiés dans le centre d'aide." } },
          { id: "rn-pf-1", type: "page-footer", props: { text: "KOMITY — Release Notes v3.4 — Mars 2025" } },
        ],
      },
    ],
  },

  // 5 — Rapport Post-Mortem (Minimal Dark)
  {
    name: "Incident — Rapport Post-Mortem",
    description: "Rapport post-mortem d'incident : chronologie, analyse des causes et plan d'action.",
    theme: MINIMAL_DARK,
    pageFormat: DEFAULT_PAGE_FORMAT,
    published: true,
    tags: ["incident", "post-mortem", "ops"],
    editableFields: [
      { nodeId: "pm-tb-1", propKey: "subtitle", label: "Identifiant et date de l'incident", type: "text", defaultValue: "", required: true, group: "En-tête", order: 0 },
      { nodeId: "pm-kc-1", propKey: "description", label: "KPI — Durée de l'incident", type: "text", defaultValue: "", required: true, group: "Impact", order: 1 },
      { nodeId: "pm-kc-2", propKey: "description", label: "KPI — Services impactés", type: "text", defaultValue: "", required: true, group: "Impact", order: 2 },
      { nodeId: "pm-kc-3", propKey: "description", label: "KPI — Utilisateurs affectés", type: "text", defaultValue: "", required: true, group: "Impact", order: 3 },
      { nodeId: "pm-kc-4", propKey: "description", label: "KPI — Sévérité", type: "text", defaultValue: "", required: true, group: "Impact", order: 4 },
      { nodeId: "pm-db-1", propKey: "result", label: "Cause racine", type: "textarea", defaultValue: "", required: true, group: "Analyse", order: 5 },
      { nodeId: "pm-ns-1", propKey: "items", label: "Actions correctives", type: "list", defaultValue: [], required: true, group: "Plan d'action", order: 6 },
    ],
    pages: [
      {
        id: "pm-page-1",
        label: "Analyse & Plan d'action",
        children: [
          { id: "pm-ph-1", type: "page-header", props: { brandName: "KOMITY", brandSub: "SRE / Ops", showChevron: false } },
          { id: "pm-tb-1", type: "title-block", props: { title: "Rapport Post-Mortem", subtitle: "INC-2025-0042 — 8 février 2025" } },
          { id: "pm-ib-1", type: "intro-box", props: { content: "Ce document analyse l'incident **INC-2025-0042** survenu le 8 février 2025. Il présente la chronologie, les causes racines identifiées et le plan d'action correctif.", accentColor: "#818CF8" } },
          {
            id: "pm-kr-1", type: "kpi-row", props: { sectionTitle: "Impact de l'incident" },
            children: [
              { id: "pm-kc-1", type: "kpi-card", props: { emoji: "⏱️", title: "Durée", description: "2h14 d'interruption partielle.", color: "amber" } },
              { id: "pm-kc-2", type: "kpi-card", props: { emoji: "🔧", title: "Services impactés", description: "API Gateway + Auth Service.", color: "amber" } },
              { id: "pm-kc-3", type: "kpi-card", props: { emoji: "👤", title: "Utilisateurs affectés", description: "~340 comptes Enterprise.", color: "amber" } },
              { id: "pm-kc-4", type: "kpi-card", props: { emoji: "🚨", title: "Sévérité", description: "SEV-2 (dégradation partielle).", color: "amber" } },
            ],
          },
          { id: "pm-sh-1", type: "section-header", props: { text: "Analyse des causes" } },
          {
            id: "pm-tg-1", type: "two-column-grid", props: { gap: 16 },
            children: [
              { id: "pm-db-1", type: "detail-block", props: { title: "Cause racine", color: "amber", paragraphs: ["Expiration non anticipée d'un certificat TLS interne utilisé par le service d'authentification.", "L'alerte de renouvellement automatique avait été désactivée lors d'une migration en novembre 2024."], benefitsLabel: "Facteurs contributifs", benefits: ["Absence d'alerte J-30", "Pas de test de validité en CI", "Runbook non à jour"], result: "Certificat renouvelé manuellement à 14h32. Service rétabli à 14h47.", suite: "Automatisation du renouvellement à déployer." } },
              { id: "pm-db-2", type: "detail-block", props: { title: "Chronologie", color: "blue", paragraphs: ["12:18 — Premières erreurs 401 détectées.", "12:33 — Alerte PagerDuty déclenchée.", "13:05 — Cause identifiée par l'équipe SRE.", "14:32 — Certificat renouvelé.", "14:47 — Monitoring nominal."], benefitsLabel: "Temps clés", benefits: ["MTTD : 15 min", "MTTI : 32 min", "MTTR : 2h14"], result: "RCA complète validée le 10 février.", suite: "Revue post-incident planifiée." } },
            ],
          },
          { id: "pm-ns-1", type: "next-section", props: { title: "Plan d'action", intro: "Les mesures correctives à mettre en œuvre :", items: ["Automatiser le renouvellement des certificats (cert-manager)", "Ajouter une alerte J-30 et J-7 sur tous les certificats", "Mettre à jour le runbook d'incident Auth", "Ajouter un check de validité certificat dans la CI", "Réviser la checklist de migration des services"], summary: "5 actions — deadline : 28 février 2025." } },
          { id: "pm-pf-1", type: "page-footer", props: { text: "KOMITY — SRE — Post-Mortem INC-2025-0042 — Confidentiel" } },
        ],
      },
    ],
  },
];

const insertedTemplates: Array<{ id: string; template: TemplateInsert }> = [];

for (const tpl of TEMPLATES) {
  const existing = await db.select({ id: templates.id }).from(templates).where(eq(templates.name, tpl.name));
  if (existing.length === 0) {
    const [row] = await db.insert(templates).values(tpl as typeof templates.$inferInsert).returning({ id: templates.id });
    insertedTemplates.push({ id: row!.id, template: tpl });
    console.log(`  ✓ Template inséré : ${tpl.name}`);
  } else {
    insertedTemplates.push({ id: existing[0]!.id, template: tpl });
    console.log(`  — Template déjà présent : ${tpl.name}`);
  }
}

// ─── Presets de composants ─────────────────────────────────────────────────

console.log("\n── Presets de composants ──");

const PRESETS = [
  {
    baseType: "kpi-card",
    label: "KPI Succès vert",
    description: "Carte KPI avec couleur verte pour indiquer un résultat positif.",
    category: "data" as const,
    defaultProps: { emoji: "✅", title: "Indicateur", description: "Résultat positif atteint.", color: "green" },
  },
  {
    baseType: "kpi-card",
    label: "KPI Alerte orange",
    description: "Carte KPI avec couleur orange pour signaler un point d'attention.",
    category: "data" as const,
    defaultProps: { emoji: "⚠️", title: "Point d'attention", description: "À surveiller ce mois.", color: "amber" },
  },
  {
    baseType: "kpi-card",
    label: "KPI Neutre bleu",
    description: "Carte KPI bleue pour les informations neutres ou de contexte.",
    category: "data" as const,
    defaultProps: { emoji: "📊", title: "Chiffre clé", description: "Donnée de contexte.", color: "blue" },
  },
  {
    baseType: "intro-box",
    label: "Intro standard bleue",
    description: "Bloc d'introduction avec accent bleu primaire.",
    category: "content" as const,
    defaultProps: { content: "Saisissez ici l'introduction de votre document.", accentColor: "#2563EB" },
  },
  {
    baseType: "intro-box",
    label: "Intro alerte rouge",
    description: "Bloc d'introduction avec accent rouge pour les documents d'incident.",
    category: "content" as const,
    defaultProps: { content: "⚠️ Ce document traite d'un incident ou d'une situation critique.", accentColor: "#DC2626" },
  },
  {
    baseType: "detail-block",
    label: "Bloc résultat positif",
    description: "Bloc de détail vert — résultat atteint.",
    category: "content" as const,
    defaultProps: { title: "Titre du chantier", color: "green", paragraphs: ["Description de l'action menée."], benefitsLabel: "Bénéfices", benefits: ["Bénéfice 1", "Bénéfice 2"], result: "Résultat : objectif atteint.", suite: "Prochaine étape à définir." },
  },
  {
    baseType: "detail-block",
    label: "Bloc en cours orange",
    description: "Bloc de détail orange — action en cours ou à risque.",
    category: "content" as const,
    defaultProps: { title: "Titre du chantier", color: "amber", paragraphs: ["Description de l'action en cours."], benefitsLabel: "Avancement", benefits: ["Étape 1 : terminée", "Étape 2 : en cours"], result: "En cours — X% réalisé.", suite: "Livraison prévue semaine X." },
  },
  {
    baseType: "next-section",
    label: "Suite — 4 actions",
    description: "Bloc 'Et pour la suite ?' pré-rempli avec 4 actions à personnaliser.",
    category: "content" as const,
    defaultProps: { title: "Et pour la suite ?", intro: "Les priorités pour le prochain mois :", items: ["Action prioritaire 1", "Action prioritaire 2", "Action prioritaire 3", "Action prioritaire 4"], summary: "X actions planifiées pour le prochain mois." },
  },
];

for (const preset of PRESETS) {
  const existing = await db.select({ id: componentPresets.id }).from(componentPresets).where(eq(componentPresets.label, preset.label));
  if (existing.length === 0) {
    await db.insert(componentPresets).values(preset);
    console.log(`  ✓ Preset inséré : ${preset.label}`);
  } else {
    console.log(`  — Preset déjà présent : ${preset.label}`);
  }
}

// ─── Documents ─────────────────────────────────────────────────────────────

console.log("\n── Documents ──");

// On récupère les IDs réels des templates insérés
const tplByName = Object.fromEntries(insertedTemplates.map(({ id, template }) => [template.name, id]));

const chantiersTplId = tplByName["KOMITY — Chantiers Techniques"]!;
const rhTplId = tplByName["RH — Bilan Mensuel"]!;
const financeTplId = tplByName["Finance — Rapport Trimestriel"]!;
const pmTplId = tplByName["Incident — Rapport Post-Mortem"]!;

// On récupère les snapshots complets pour les documents
const chantiersSnapshot = await db.select().from(templates).where(eq(templates.id, chantiersTplId));
const rhSnapshot = await db.select().from(templates).where(eq(templates.id, rhTplId));
const financeSnapshot = await db.select().from(templates).where(eq(templates.id, financeTplId));
const pmSnapshot = await db.select().from(templates).where(eq(templates.id, pmTplId));

const DOCUMENTS = [
  // Chantiers Techniques — Janvier 2025 (finalisé)
  {
    templateId: chantiersTplId,
    name: "Chantiers Techniques — Janvier 2025",
    status: "finalized" as const,
    completionPercent: 100,
    templateSnapshot: chantiersSnapshot[0],
    data: {
      "tb-1__subtitle": "Bilan mensuel — Janvier 2025",
      "ib-1__content": "Ce document présente l'avancement des **chantiers techniques** de janvier 2025. Toutes les livraisons planifiées ont été réalisées.",
      "kc-1__description": "12/12 tâches livrées dans les délais.",
      "kc-2__description": "+18% vs décembre 2024.",
      "kc-3__description": "12 bugs critiques corrigés en production.",
      "kc-4__description": "4 déploiements réussis sans rollback.",
      "db-1__result": "Livré en production le 15 janvier. Aucun incident signalé.",
      "pf-1__text": "KOMITY — Document confidentiel — Janvier 2025",
    },
  },
  // Chantiers Techniques — Février 2025 (finalisé)
  {
    templateId: chantiersTplId,
    name: "Chantiers Techniques — Février 2025",
    status: "finalized" as const,
    completionPercent: 100,
    templateSnapshot: chantiersSnapshot[0],
    data: {
      "tb-1__subtitle": "Bilan mensuel — Février 2025",
      "ib-1__content": "Bilan de février 2025 : mois dense marqué par la finalisation de l'optimisation API et le démarrage de la migration K8s.",
      "kc-1__description": "9/10 tâches livrées — 1 reportée.",
      "kc-2__description": "+7% vs janvier 2025.",
      "kc-3__description": "8 bugs corrigés, 2 en cours d'investigation.",
      "kc-4__description": "3 déploiements — 1 rollback partiel.",
      "db-1__result": "Optimisation API finalisée. P99 < 180ms.",
      "pf-1__text": "KOMITY — Document confidentiel — Février 2025",
    },
  },
  // Chantiers Techniques — Mars 2025 (brouillon en cours)
  {
    templateId: chantiersTplId,
    name: "Chantiers Techniques — Mars 2025",
    status: "draft" as const,
    completionPercent: 40,
    templateSnapshot: chantiersSnapshot[0],
    data: {
      "tb-1__subtitle": "Bilan mensuel — Mars 2025",
      "kc-1__description": "En cours de saisie...",
    },
  },
  // RH — Janvier 2025 (finalisé)
  {
    templateId: rhTplId,
    name: "Bilan RH — Janvier 2025",
    status: "finalized" as const,
    completionPercent: 100,
    templateSnapshot: rhSnapshot[0],
    data: {
      "rh-tb-1__subtitle": "Janvier 2025",
      "rh-kc-1__description": "142 collaborateurs actifs.",
      "rh-kc-2__description": "3 postes pourvus ce mois.",
      "rh-kc-3__description": "3,2% — en baisse vs décembre.",
      "rh-kc-4__description": "eNPS : +42 (enquête jan.)",
      "rh-ns-1__items": ["Finaliser le recrutement Backend ouvert", "Lancer les entretiens annuels", "Déployer le module de formation"],
    },
  },
  // RH — Février 2025 (finalisé)
  {
    templateId: rhTplId,
    name: "Bilan RH — Février 2025",
    status: "finalized" as const,
    completionPercent: 100,
    templateSnapshot: rhSnapshot[0],
    data: {
      "rh-tb-1__subtitle": "Février 2025",
      "rh-kc-1__description": "145 collaborateurs actifs (+3).",
      "rh-kc-2__description": "2 postes pourvus, 1 en cours.",
      "rh-kc-3__description": "2,8% — objectif 3% atteint.",
      "rh-kc-4__description": "eNPS : +47 (post-onboarding).",
      "rh-ns-1__items": ["Finaliser l'onboarding des 2 nouvelles recrues", "Lancer la campagne de formation Q2", "Préparer le bilan social"],
    },
  },
  // RH — Mars 2025 (brouillon)
  {
    templateId: rhTplId,
    name: "Bilan RH — Mars 2025",
    status: "draft" as const,
    completionPercent: 25,
    templateSnapshot: rhSnapshot[0],
    data: {
      "rh-tb-1__subtitle": "Mars 2025",
    },
  },
  // Finance — Q1 2025 (finalisé)
  {
    templateId: financeTplId,
    name: "Rapport Financier — Q1 2025",
    status: "finalized" as const,
    completionPercent: 100,
    templateSnapshot: financeSnapshot[0],
    data: {
      "fi-tb-1__subtitle": "Q1 2025 — Janvier · Février · Mars",
      "fi-kc-1__description": "€ 1,24M — +12% vs Q1 2024.",
      "fi-kc-2__description": "67% — stable vs objectif.",
      "fi-kc-3__description": "14 comptes signés ce trimestre.",
      "fi-kc-4__description": "€ 98K — objectif Q2 : € 115K.",
      "fi-db-1__result": "Objectif CA Q1 atteint à 103%.",
      "fi-db-2__result": "Ratio dépenses/CA : 61% (vs 63% Q1 2024).",
    },
  },
  // Finance — Q2 2025 (brouillon)
  {
    templateId: financeTplId,
    name: "Rapport Financier — Q2 2025",
    status: "draft" as const,
    completionPercent: 15,
    templateSnapshot: financeSnapshot[0],
    data: {
      "fi-tb-1__subtitle": "Q2 2025 — Avril · Mai · Juin",
    },
  },
  // Post-Mortem INC-2025-0042 (finalisé)
  {
    templateId: pmTplId,
    name: "Post-Mortem — INC-2025-0042",
    status: "finalized" as const,
    completionPercent: 100,
    templateSnapshot: pmSnapshot[0],
    data: {
      "pm-tb-1__subtitle": "INC-2025-0042 — 8 février 2025",
      "pm-kc-1__description": "2h14 d'interruption partielle.",
      "pm-kc-2__description": "API Gateway + Auth Service.",
      "pm-kc-3__description": "~340 comptes Enterprise.",
      "pm-kc-4__description": "SEV-2 (dégradation partielle).",
      "pm-db-1__result": "Certificat TLS interne expiré — alerte désactivée lors migration nov. 2024.",
      "pm-ns-1__items": ["Automatiser renouvellement (cert-manager)", "Alerte J-30 et J-7 sur tous les certs", "Mettre à jour le runbook Auth", "Check validité cert en CI"],
    },
  },
  // Post-Mortem INC-2025-0067 (brouillon)
  {
    templateId: pmTplId,
    name: "Post-Mortem — INC-2025-0067",
    status: "draft" as const,
    completionPercent: 30,
    templateSnapshot: pmSnapshot[0],
    data: {
      "pm-tb-1__subtitle": "INC-2025-0067 — 2 mars 2025",
      "pm-kc-1__description": "45 min de latence dégradée.",
      "pm-kc-2__description": "Service de notifications.",
      "pm-kc-3__description": "~80 comptes affectés.",
      "pm-kc-4__description": "SEV-3 (impact limité).",
    },
  },
];

for (const doc of DOCUMENTS) {
  const existing = await db.select({ id: documents.id }).from(documents).where(eq(documents.name, doc.name));
  if (existing.length === 0) {
    await db.insert(documents).values(doc as typeof documents.$inferInsert);
    console.log(`  ✓ Document inséré : ${doc.name}`);
  } else {
    console.log(`  — Document déjà présent : ${doc.name}`);
  }
}

await pool.end();

console.log("\n✅ Seed terminé.");
