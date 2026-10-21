# DocForge

Outil privé de création de documents techniques (présentations, rapports, revues mensuelles) basé sur un système de templates composés de composants réutilisables. L'éditeur est visuel, l'export est un PDF fidèle au rendu écran.

## Stack

| Couche          | Technologie                                                 |
| --------------- | ----------------------------------------------------------- |
| Monorepo        | pnpm workspaces                                             |
| Frontend        | React 19 + Vite + Tailwind CSS 4                            |
| Drag & drop     | dnd-kit                                                     |
| State           | TanStack Query (serveur) + Zustand/immer (édition en cours) |
| Backend         | Hono + Node.js + tsx                                        |
| ORM             | Drizzle ORM                                                 |
| Base de données | PostgreSQL 18                                               |
| Export PDF      | `window.print()` + `@page` dynamique                        |
| Déploiement     | Docker + nginx                                              |

## Structure

```
.
├── packages/
│   ├── shared/               # Types TypeScript partagés + utilitaires
│   └── component-registry/   # 16 composants rendables (styles inline)
├── apps/
│   ├── web/                  # Frontend React (Vite)
│   └── api/                  # API REST (Hono)
└── e2e/                      # Tests de bout en bout (Playwright)
```

## Développement local

### Prérequis

- Node.js 24 (version dans `.nvmrc` : `nvm use`)
- pnpm 11, à la version fixée par `packageManager` dans `package.json` (`corepack enable` l'installe)
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

### Passer de PostgreSQL 17 à 18

Une version majeure de PostgreSQL ne relit pas les fichiers de données d'une autre : il faut exporter puis réimporter.
Avec PostgreSQL 18, l'image Docker range aussi ses données sous `/var/lib/postgresql/18/docker` ; le volume
se monte désormais sur `/var/lib/postgresql` et s'appelle `pgdata18`. L'ancien volume `pgdata` (données v17)
n'est pas touché, ce qui permet de l'exporter :

```bash
# 1. Exporter depuis la base v17 encore en marche (avant de la relancer avec la nouvelle configuration)
docker compose exec db pg_dump -U docforge -d docforge -Fc > docforge-v17.dump

# 2. Démarrer la base v18 (nouveau volume vide), puis réimporter
docker compose up db -d
docker compose exec -T db pg_restore -U docforge -d docforge --no-owner < docforge-v17.dump
```

Une fois les données vérifiées, l'ancien volume peut être supprimé (`docker volume rm <projet>_pgdata`).

## Variables d'environnement

| Variable           | Description                                                                  | Défaut                                                 |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`     | URL de connexion PostgreSQL                                                  | `postgres://docforge:password@localhost:5432/docforge` |
| `DB_PASSWORD`      | Mot de passe PostgreSQL (Docker)                                             | `password`                                             |
| `PORT`             | Port de l'API                                                                | `3001`                                                 |
| `CORS_ORIGIN`      | Origine autorisée par CORS                                                   | `http://localhost:5173`                                |
| `API_PROXY_TARGET` | API vers laquelle le serveur Vite relaie `/api` (dev)                        | `http://localhost:3001`                                |
| `VITE_API_URL`     | URL de l'API appelée directement par le front (vide = relatif, via le proxy) | vide                                                   |
| `WEB_PORT`         | Port exposé pour le frontend (Docker)                                        | `8080`                                                 |

## API

```
GET    /api/templates                 Liste les templates (avec documentCount)
GET    /api/templates/:id             Récupère un template
POST   /api/templates                 Crée un template (brouillon)
POST   /api/templates/:id/duplicate   Duplique un template
PUT    /api/templates/:id             Met à jour l'état de travail
PUT    /api/templates/:id/publish     Fige une version publiée (utilisée par le Studio)
DELETE /api/templates/:id             Supprime un template (les documents sont conservés)

GET    /api/documents                 Liste les documents (avec templateName)
GET    /api/documents/:id             Récupère un document
POST   /api/documents                 Crée un document depuis la version publiée d'un template
POST   /api/documents/:id/duplicate   Duplique un document
PUT    /api/documents/:id             Renomme un document
PUT    /api/documents/:id/data        Remplace les données saisies
PUT    /api/documents/:id/export      Marque le document comme exporté (finalisé)
DELETE /api/documents/:id             Supprime un document

GET    /api/presets                   Liste les presets de composants
GET    /api/presets/:id               Récupère un preset
POST   /api/presets                   Crée un preset
POST   /api/presets/:id/duplicate     Duplique un preset
PUT    /api/presets/:id               Met à jour un preset
DELETE /api/presets/:id               Supprime un preset

GET    /api/themes                    Liste les thèmes (fournis puis personnalisés)
POST   /api/themes                    Enregistre un thème personnalisé
PUT    /api/themes/:id                Modifie un thème personnalisé
DELETE /api/themes/:id                Supprime un thème personnalisé

GET    /api/health                    Health check
```

### Contrat

- **Entrées validées** : chaque route valide ses paramètres, sa query et son corps avec les schémas zod de
  `apps/api/src/schemas.ts`. Les schémas qui décrivent un type partagé (`packages/shared/src/types`) le vérifient avec
  `satisfies` : une divergence ne compile pas.
- **Erreurs en JSON** : `{ "error": "…" }`, avec `issues` (champ et message) pour une requête invalide (400). Une
  ressource absente répond 404, une erreur inattendue 500 (journalisée côté serveur).
- **Client typé** : le front appelle l'API avec `hc<AppType>` (`apps/web/src/api/client.ts`) ; paramètres, corps et
  réponses sont inférés depuis les routes. Changer une route casse la compilation du front là où elle est utilisée.
- **Tests** : `apps/api/src/app.test.ts` couvre la validation et les erreurs sans base de données ; les tests des
  routes (`routes/*.test.ts`) tournent sur une base de test (voir « Tests »).
- **Côté front** : les écrans passent par les hooks de `apps/web/src/api/hooks` (une règle oxlint interdit `useQuery` et
  `useMutation` ailleurs). Les invalidations du cache sont écrites une fois dans `apps/web/src/api/cache.ts`, et toute
  mutation qui échoue affiche un message (texte dans `meta.errorMessage` du hook).

## Interface : couleurs et composants de base

- **Couleurs par rôle** (`apps/web/src/styles/globals.css`) : encre (`ink`, `ink-soft`, `ink-muted`, `ink-subtle`,
  `ink-faint`), surfaces et filets (`paper`, `wash`, `table`, `rule`, `rule-strong`), `focus`, un jeu par type
  d'objet (`doc`, `tpl`, `preset` avec `-strong`, `-rule`, `-tint`) et les états (`danger`, `warn`, `success`).
  Les gammes de Tailwind (`gray`, `blue`…) sont retirées : `bg-blue-50` ne produit aucun style.
- **`Button`** et **`IconButton`** (`components/ui/Button.tsx`) : `variant` (primary, secondary, ghost, dashed, link),
  `tone` (neutral, danger, doc, tpl, preset), `size`, `pending`. `type="button"` par défaut. `buttonClasses()` donne
  l'apparence d'un bouton à un `<Link>`.
- **`Dialog`** (`components/ui/Dialog.tsx`) : fenêtre modale sur `<dialog>` natif (couche supérieure, focus gardé,
  Échap, retour du focus), placée au centre, en grand (`fill`), en panneau (`side`) ou en calque (`cover`).
- **`Field`** avec **`Input`**, **`Textarea`**, **`Select`** (`components/ui/Field.tsx`) : le libellé, la précision et
  l'erreur sont reliés au contrôle sans identifiant à écrire.

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

### Ajouter un composant

Un composant tient dans un fichier de `packages/component-registry/src/components/`, importé dans `components.ts`.
Son schéma (`defineSchema`) est la seule source de vérité : `defineComponent()` en déduit les props reçues par le rendu
(`PropsOf<typeof schema>`) et les valeurs par défaut. Rien d'autre à modifier, ni dans l'éditeur ni dans la détection
des champs remplissables, qui lit le `role` de chaque prop de texte :

| Rôle                  | Exemple                         | Pré-sélectionné | Effet                                |
| --------------------- | ------------------------------- | --------------- | ------------------------------------ |
| `content` (si absent) | description d'un KPI            | oui             | —                                    |
| `heading`             | titre d'un jalon, d'un encadré  | oui             | nomme les autres champs du composant |
| `name`                | titre d'une carte KPI           | non             | nomme les autres champs du composant |
| `section`             | titre d'un en-tête de section   | non             | ouvre un groupe du formulaire        |
| `structure`           | nom de marque, texte alternatif | non             | —                                    |

Un composant qui forme à lui seul un groupe du formulaire le déclare avec `formGroup` (le pied de page).

## Raccourcis clavier (éditeur)

| Raccourci      | Action                                                    |
| -------------- | --------------------------------------------------------- |
| `Ctrl+Z`       | Annuler                                                   |
| `Ctrl+Shift+Z` | Rétablir                                                  |
| `Ctrl+S`       | Sauvegarder immédiatement (la sauvegarde est automatique) |
| `Delete`       | Supprimer le composant sélectionné                        |

## Export PDF

L'export passe par l'impression du navigateur. Le document est rendu à l'échelle 1 dans un portail dédié
(`usePrintDocument`), avec les mêmes composants qu'à l'écran ; chaque page reçoit sa propre taille `@page`.
Dans la boîte d'impression :

- Destination : **Enregistrer au format PDF**
- Marges : **Aucune**

Les fonds de couleur sont forcés par `print-color-adjust: exact`.

## Scripts

```bash
pnpm dev                    # Lancer frontend + API en parallèle
pnpm check                  # Lint, format, types et tests : ce que vérifie la CI
pnpm lint                   # oxlint (pnpm lint:fix corrige ce qui peut l'être)
pnpm format                 # oxfmt : formate tout le dépôt (pnpm format:check pour vérifier)
pnpm typecheck              # Vérification TypeScript sur tout le monorepo
pnpm test                   # Tests unitaires et d'API (voir « Tests »)
pnpm test:e2e               # Tests de bout en bout (Playwright)
pnpm build                  # Build de production

pnpm --filter @template-generator/api run db:migrate   # Appliquer les migrations
pnpm --filter @template-generator/api run db:generate  # Générer une migration
pnpm --filter @template-generator/api run db:seed      # Seeder le template KOMITY
```

## Tests

| Où                | Quoi                                                                      | Outil                    |
| ----------------- | ------------------------------------------------------------------------- | ------------------------ |
| `packages/shared` | Champs, détection des champs, arbre de composants                         | Vitest                   |
| `apps/api`        | Validation et erreurs ; publication, version figée, documents             | Vitest + base PostgreSQL |
| `apps/web`        | Stores (annuler / rétablir, déplacements, saisie), sauvegarde automatique | Vitest (+ jsdom)         |
| `e2e`             | Les trois parcours : Atelier, Studio, Bibliothèque                        | Playwright               |

**Base de test.** Les tests d'API sur base et les tests de bout en bout utilisent `TEST_DATABASE_URL`, jamais
`DATABASE_URL`. Le nom de la base doit finir par `_test` : elle est créée et migrée automatiquement, puis vidée par les
tests. Sans cette variable, `pnpm test` ignore les tests sur base (la CI, elle, les exige).

```bash
export TEST_DATABASE_URL=postgres://docforge:password@localhost:5432/docforge_test
pnpm test
```

**Bout en bout.** `pnpm test:e2e` démarre sa propre API (port 3101) et son propre front (port 5183) sur la base de test :
les serveurs de développement peuvent rester ouverts. La première fois, installer le navigateur :

```bash
pnpm --filter @template-generator/e2e exec playwright install chromium
```

`pnpm --filter @template-generator/e2e run e2e:ui` ouvre l'interface de Playwright pour suivre ou rejouer un test.

## Qualité du code

- **Lint** : [oxlint](https://oxc.rs/docs/guide/usage/linter), configuré dans `.oxlintrc.json` (règles React et hooks,
  accessibilité, TypeScript, imports, Vitest). Aucun avertissement n'est toléré. Une règle désactivée l'est avec la raison
  en commentaire, dans la config ou sur la ligne concernée (`// oxlint-disable-next-line <règle>`).
- **Format** : [oxfmt](https://oxc.rs/docs/guide/usage/formatter), configuré dans `.oxfmtrc.json` (lignes de 120 caractères,
  guillemets doubles). Avec VS Code, l'extension Oxc formate à l'enregistrement.
- **CI** : `.github/workflows/ci.yml` et `.gitlab-ci.yml` lancent les mêmes étapes à chaque push (installation figée, lint,
  format, types, tests avec une base PostgreSQL, build), puis les tests de bout en bout dans un job séparé. Les deux
  fichiers sont à garder alignés.
- **Versions** : Node dans `.nvmrc`, pnpm dans `packageManager` ; les Dockerfiles et le devcontainer suivent les mêmes.
