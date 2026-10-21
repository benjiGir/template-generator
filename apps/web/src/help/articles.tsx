import type { ReactNode } from "react";
import type { ObjectKind } from "@/components/ui/ObjectIdentity";
import { HelpLink } from "./HelpLink";
import {
  BuildFigure,
  ConceptFigure,
  DocumentCardFigure,
  ExportFigure,
  FieldsFigure,
  FillFormFigure,
  InlineFillFigure,
  LockedFigure,
  PresetFigure,
  ReviewFigure,
  StudioSelectFigure,
  TemplateStartFigure,
  ThemeFigure,
  VersionsFigure,
} from "./illustrations";

export interface HelpSection {
  /** Ancre de la section (#id) */
  id: string;
  title: string;
  body: ReactNode;
}

export interface HelpArticle {
  slug: string;
  /** Type d'objet de l'espace concerné ; aucun pour les articles transverses */
  kind?: ObjectKind;
  /** Espace de l'application (« Studio »…) */
  space?: string;
  title: string;
  summary: string;
  sections: HelpSection[];
}

/** Paragraphe */
function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[15px] leading-relaxed text-gray-800">{children}</p>;
}

/** Étapes à suivre, numérotées */
function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="mt-3 space-y-1.5 border-l-2 border-rule pl-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-gray-800">
          <span className="mt-[3px] font-mono text-xs font-semibold text-gray-500">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** Encadré « Bon à savoir » */
function Tip({ title = "Bon à savoir", children }: { title?: string; children: ReactNode }) {
  return (
    <div className="mt-4 border-l-[3px] border-ink bg-white px-4 py-3">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-600">{title}</p>
      <div className="mt-1 text-sm leading-relaxed text-gray-800">{children}</div>
    </div>
  );
}

/** Nom d'élément d'interface, tel qu'il est écrit à l'écran */
function Ui({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap border border-rule bg-white px-1 py-px text-[13px] font-medium text-ink">
      {children}
    </span>
  );
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "bases",
    title: "Les bases",
    summary:
      "Templates, documents et presets : qui fait quoi, et pourquoi certaines parties d'un document sont verrouillées.",
    sections: [
      {
        id: "principe",
        title: "Un template, des documents",
        body: (
          <>
            <P>
              DocForge sépare la <strong>forme</strong> du <strong>fond</strong>. La mise en page d'un type de document
              (un bilan mensuel, un post-mortem…) se conçoit une seule fois, dans un template. Chaque édition est
              ensuite un document qui ne contient que le contenu propre à cette édition.
            </P>
            <ConceptFigure />
            <P>
              Résultat : tous les bilans mensuels se ressemblent, quel que soit l'auteur, et le remplissage ne demande
              aucune compétence de mise en page.
            </P>
          </>
        ),
      },
      {
        id: "espaces",
        title: "Les trois espaces",
        body: (
          <>
            <P>
              La navigation de gauche mène aux trois espaces ; chacun a sa couleur et sa forme, que l'on retrouve
              partout.
            </P>
            <Steps
              items={[
                <>
                  <strong>Studio</strong> (carré orange) : produire des documents. C'est l'espace des contributeurs.
                </>,
                <>
                  <strong>Atelier</strong> (pointillés bleus) : concevoir et publier les templates.
                </>,
                <>
                  <strong>Bibliothèque</strong> (rond vert) : préparer des composants réglés, réutilisables dans tous
                  les templates.
                </>,
              ]}
            />
            <P>
              Chaque création se fait dans un parcours en étapes, affiché en haut de l'écran. On peut revenir aux étapes
              déjà faites en cliquant dessus, et <Ui>Quitter</Ui> à tout moment.
            </P>
          </>
        ),
      },
      {
        id: "zones-verrouillees",
        title: "Pourquoi certaines parties ne sont pas modifiables",
        body: (
          <>
            <P>
              Dans le Studio, seules les zones que le template a déclarées comme <strong>champs</strong> se remplissent.
              Le reste — titres de section, libellés, en-têtes, décor — appartient au template : c'est ce qui garantit
              que tous les documents d'un même type gardent la même structure.
            </P>
            <LockedFigure />
            <Tip title="Il manque un champ ?">
              Le choix des champs se fait dans l'Atelier, à l'étape <Ui>Champs et publication</Ui> : ajoutez-y le
              contenu voulu depuis « Contenus non retenus », puis republiez. Attention, seuls les documents créés
              ensuite en profiteront (voir <HelpLink to="atelier#modifier-publie">Modifier un template publié</HelpLink>
              ).
            </Tip>
          </>
        ),
      },
      {
        id: "sauvegarde",
        title: "Sauvegarde automatique",
        body: (
          <>
            <P>
              Il n'y a pas de bouton Enregistrer : tout ce que vous saisissez est enregistré automatiquement, quelques
              instants après la frappe. Pendant l'envoi, <Ui>Enregistrement…</Ui> s'affiche en haut à droite.
            </P>
            <P>
              Si l'enregistrement échoue (réseau coupé, serveur indisponible), un message rouge le dit clairement et
              propose de réessayer. Vos modifications restent conservées dans l'onglet ; ne le fermez pas avant que
              l'enregistrement repasse.
            </P>
          </>
        ),
      },
    ],
  },
  {
    slug: "studio",
    kind: "doc",
    space: "Studio",
    title: "Produire un document",
    summary: "Choisir un template, le remplir, relire puis exporter en PDF.",
    sections: [
      {
        id: "choisir",
        title: "01 · Choisir un template",
        body: (
          <>
            <P>
              Depuis le Studio, <Ui>Nouveau document</Ui> affiche les templates publiés. Chaque carte montre la mise en
              page et l'effort à prévoir.
            </P>
            <StudioSelectFigure />
            <Tip>
              Pour une nouvelle édition d'un document récurrent, il est souvent plus rapide de dupliquer l'édition
              précédente (voir <HelpLink to="studio#gerer">Gérer ses documents</HelpLink>).
            </Tip>
          </>
        ),
      },
      {
        id: "remplir",
        title: "02 · Remplir",
        body: (
          <>
            <P>
              Le formulaire présente les champs groupés par thème, à gauche ; la page se met à jour à droite à chaque
              frappe. Les champs marqués <em>obligatoire</em> seront signalés à la relecture s'ils restent vides.
            </P>
            <FillFormFigure />
            <P>
              Pour avancer, rien n'est bloquant : vous pouvez passer à la relecture à tout moment et revenir plus tard.
            </P>
          </>
        ),
      },
      {
        id: "remplir-sur-la-page",
        title: "Remplir sur la page",
        body: (
          <>
            <P>
              Le mode <Ui>Sur la page</Ui> permet de corriger un texte là où il apparaît, ce qui est pratique pour
              relire et ajuster en contexte. Votre choix de mode est mémorisé.
            </P>
            <InlineFillFigure />
            <P>
              Un clic sur une partie qui n'est pas un champ affiche « Cette partie fait partie du template » : elle est
              verrouillée volontairement (voir{" "}
              <HelpLink to="bases#zones-verrouillees">Pourquoi certaines parties ne sont pas modifiables</HelpLink>).
            </P>
          </>
        ),
      },
      {
        id: "relire",
        title: "03 · Relire",
        body: (
          <>
            <P>La relecture montre le document tel qu'il sera exporté, et liste ce qui manque encore.</P>
            <ReviewFigure />
          </>
        ),
      },
      {
        id: "exporter",
        title: "04 · Exporter en PDF",
        body: (
          <>
            <P>
              L'export passe par la fenêtre d'impression de votre navigateur, qui produit un PDF fidèle à l'aperçu
              (textes sélectionnables, couleurs conservées).
            </P>
            <ExportFigure />
            <Steps
              items={[
                <>Vérifiez le nom du fichier et le format de page.</>,
                <>
                  Cliquez sur <Ui>Exporter en PDF</Ui>.
                </>,
                <>
                  Dans la fenêtre du navigateur : destination <Ui>Enregistrer au format PDF</Ui>, marges <Ui>Aucune</Ui>{" "}
                  (dans « Plus de paramètres »).
                </>,
                <>
                  Enregistrez. Le document passe au statut <strong>Finalisé</strong>.
                </>,
              ]}
            />
            <Tip title="Des en-têtes ou une date apparaissent sur le PDF ?">
              Décochez « En-têtes et pieds de page » dans la fenêtre d'impression : ce sont ceux du navigateur, pas du
              document.
            </Tip>
          </>
        ),
      },
      {
        id: "gerer",
        title: "Gérer ses documents",
        body: (
          <>
            <P>
              La liste du Studio se filtre par statut et par template. Chaque document indique son template d'origine et
              sa progression.
            </P>
            <DocumentCardFigure />
            <P>
              Un document finalisé reste modifiable. S'il change après l'export, il passe en{" "}
              <strong>Modifié depuis l'export</strong> pour rappeler que le PDF diffusé n'est plus à jour : exportez-le
              de nouveau.
            </P>
          </>
        ),
      },
    ],
  },
  {
    slug: "atelier",
    kind: "tpl",
    space: "Atelier",
    title: "Concevoir un template",
    summary: "Point de départ, thème, construction de la page, choix des champs et publication dans le Studio.",
    sections: [
      {
        id: "point-de-depart",
        title: "01 · Point de départ",
        body: (
          <>
            <P>Un template peut partir d'un autre (le plus rapide) ou d'une page blanche.</P>
            <TemplateStartFigure />
          </>
        ),
      },
      {
        id: "theme",
        title: "02 · Thème",
        body: (
          <>
            <P>
              Le thème fixe l'identité visuelle : couleurs, typographie, bordures et espacements, pour tout le document
              d'un coup.
            </P>
            <ThemeFigure />
          </>
        ),
      },
      {
        id: "construire",
        title: "03 · Construire",
        body: (
          <>
            <P>
              C'est ici que la page prend forme : on y glisse des composants (titres, cartes d'indicateurs, colonnes,
              encadrés…) et on règle leur contenu par défaut.
            </P>
            <BuildFigure />
            <Steps
              items={[
                <>Glissez un composant depuis la bibliothèque jusqu'à l'endroit voulu sur la page.</>,
                <>
                  Cliquez dessus pour le régler dans l'inspecteur. Les textes saisis ici sont le{" "}
                  <strong>contenu par défaut</strong> des documents.
                </>,
                <>
                  Dans l'inspecteur, l'onglet <Ui>Page</Ui> règle le format et les marges ; <Ui>Ajouter une page</Ui>{" "}
                  crée une page de plus.
                </>,
                <>
                  Vérifiez avec <Ui>Aperçu PDF</Ui>, puis passez à <Ui>Champs et publication</Ui>.
                </>,
              ]}
            />
          </>
        ),
      },
      {
        id: "champs",
        title: "04 · Champs et publication",
        body: (
          <>
            <P>
              Cette étape décide de ce que les contributeurs pourront remplir. Tout ce qui n'est pas retenu comme champ
              restera identique dans chaque document.
            </P>
            <FieldsFigure />
            <P>
              L'onglet <Ui>Formulaire du Studio</Ui> montre le formulaire exactement tel que le verront les
              contributeurs ; <Ui>Nom et description</Ui> renseigne ce qui s'affichera sur la carte du template. Cliquez
              enfin sur <Ui>Publier dans le Studio</Ui>.
            </P>
            <Tip title="Que retenir comme champ ?">
              Ce qui change à chaque édition (dates, chiffres, commentaires, actions). Laissez fixes les titres de
              section et les libellés : ils donnent sa structure au document.
            </Tip>
          </>
        ),
      },
      {
        id: "modifier-publie",
        title: "Modifier un template publié",
        body: (
          <>
            <P>
              Un template publié peut être retravaillé sans gêner les contributeurs : tant que vous ne republiez pas, le
              Studio continue d'utiliser la version publiée.
            </P>
            <VersionsFigure />
            <Tip>
              Supprimer un template ne supprime pas ses documents : chacun garde sa propre copie de la version qui l'a
              créé, et reste consultable, modifiable et exportable.
            </Tip>
          </>
        ),
      },
    ],
  },
  {
    slug: "bibliotheque",
    kind: "preset",
    space: "Bibliothèque",
    title: "Régler un preset",
    summary: "Préparer une fois un composant (couleurs, textes par défaut) pour le réutiliser dans tous les templates.",
    sections: [
      {
        id: "preset",
        title: "Créer un preset",
        body: (
          <>
            <P>
              Un preset évite de refaire les mêmes réglages dans chaque template : une carte KPI « succès » toujours
              verte, un encadré d'alerte toujours rouge…
            </P>
            <PresetFigure />
            <Steps
              items={[
                <>
                  Dans la Bibliothèque, <Ui>Nouveau preset</Ui>, puis choisissez le composant de base.
                </>,
                <>Configurez ses propriétés en regardant l'aperçu.</>,
                <>Nommez-le, rangez-le dans une catégorie, enregistrez.</>,
              ]}
            />
            <Tip>
              Modifier un preset ne change pas les templates qui l'utilisent déjà : il sert de point de départ au moment
              où on le dépose sur la page.
            </Tip>
          </>
        ),
      },
    ],
  },
];

export function findArticle(slug: string | undefined): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function findSection(
  slug: string,
  sectionId: string,
): { article: HelpArticle; section: HelpSection } | undefined {
  const article = findArticle(slug);
  const section = article?.sections.find((s) => s.id === sectionId);
  return article && section ? { article, section } : undefined;
}
