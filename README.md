# DocForge

Outil privé de création de documents techniques (présentations, rapports, revues mensuelles) basé sur un système de templates composés de composants réutilisables. L'éditeur est visuel, l'export est un PDF fidèle au rendu écran.

## Stack

| Couche | Technologie |
|---|---|
| Monorepo | pnpm workspaces |
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Drag & drop | dnd-kit |
| State | Zustand + immer |
| Backend | Hono + Node.js + tsx |
| ORM | Drizzle ORM |
| Base de données | PostgreSQL 17 |
| Export PDF | `window.print()` + `@page` dynamique |
| Déploiement | Docker + nginx |

## Structure

```
.
├── packages/
│   ├── shared/               # Types TypeScript partagés + utilitaires
│   └── component-registry/   # 16 composants rendables (styles inline)
└── apps/
    ├── web/                  # Frontend React (Vite)
    └── api/                  # API REST (Hono)
```

## Développement local

### Prérequis

- Node.js 22+
- pnpm 10+
- Docker (pour PostgreSQL)

### Installation

```bash
pnpm install
```

### Base de données

Démarrer PostgreSQL :

```bash
docker-compose up db -d
```

Copier et configurer les variables d'environnement :

```bash
cp .env.example .env
```

Appliquer les migrations :

```bash
pnpm --filter @template-generator/api run db:migrate
```

Seeder le template KOMITY de démonstration (optionnel) :

```bash
pnpm --filter @template-generator/api run db:seed
```

### Lancer l'application

```bash
pnpm dev
```

- Frontend : http://localhost:5173
- API : http://localhost:3001
- Health check : http://localhost:3001/api/health

## Déploiement Docker

```bash
cp .env.example .env
# Modifier DB_PASSWORD et WEB_PORT si nécessaire

docker-compose up --build
```

L'application est accessible sur http://localhost:8080 (ou le port défini dans `WEB_PORT`).

Au premier démarrage, les migrations et le seed sont appliqués automatiquement.

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgres://docforge:password@localhost:5432/docforge` |
| `DB_PASSWORD` | Mot de passe PostgreSQL (Docker) | `password` |
| `PORT` | Port de l'API | `3001` |
| `CORS_ORIGIN` | Origine autorisée par CORS | `http://localhost:5173` |
| `WEB_PORT` | Port exposé pour le frontend (Docker) | `8080` |

## API

```
GET    /api/templates           Liste les templates
GET    /api/templates/:id       Récupère un template
POST   /api/templates           Crée un template
PUT    /api/templates/:id       Met à jour un template
DELETE /api/templates/:id       Supprime un template

GET    /api/presets             Liste les presets de composants
POST   /api/presets             Crée un preset
PUT    /api/presets/:id         Met à jour un preset
DELETE /api/presets/:id         Supprime un preset

GET    /api/health              Health check
```

## Composants disponibles

### Layout
- `page-container` — Conteneur de page
- `two-column-grid` — Grille 2 colonnes
- `three-column-grid` — Grille 3 colonnes
- `spacer` — Espacement vertical

### Content
- `title-block` — Bloc titre + sous-titre
- `intro-box` — Encadré d'introduction
- `section-header` — En-tête de section
- `text-block` — Bloc texte libre
- `detail-block` — Bloc de détail structuré (titre, paragraphes, bénéfices, résultat)
- `result-box` — Encadré résultat
- `suite-text` — Texte "pour la suite"

### Data
- `kpi-row` — Ligne de KPIs (conteneur)
- `kpi-card` — Carte KPI (emoji, titre, description)
- `next-section` — Section "Et pour la suite ?"

### Decoration
- `page-header` — En-tête de page avec nom de marque
- `page-footer` — Pied de page
- `summary-bar` — Barre de résumé
- `watermark` — Filigrane

## Raccourcis clavier (éditeur)

| Raccourci | Action |
|---|---|
| `Ctrl+Z` | Annuler |
| `Ctrl+Shift+Z` | Rétablir |
| `Ctrl+S` | Sauvegarder |
| `Delete` | Supprimer le composant sélectionné |

## Export PDF

Cliquer sur "Export PDF" dans la toolbar, puis dans la boîte de dialogue d'impression du navigateur :
- Imprimante : **Enregistrer en PDF**
- Marges : **Aucune**
- Cocher **Graphiques d'arrière-plan**

## Scripts

```bash
pnpm dev                    # Lancer frontend + API en parallèle
pnpm typecheck              # Vérification TypeScript sur tout le monorepo
pnpm build                  # Build de production

pnpm --filter @template-generator/api run db:migrate   # Appliquer les migrations
pnpm --filter @template-generator/api run db:generate  # Générer une migration
pnpm --filter @template-generator/api run db:seed      # Seeder le template KOMITY
```
