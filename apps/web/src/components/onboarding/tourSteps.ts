/**
 * Les deux parcours de la visite guidée. Une contributrice ne voit que le Studio ;
 * un concepteur découvre l'Atelier, la Bibliothèque, puis le Studio où ses templates sont remplis.
 */
export type TourProfile = "contributor" | "designer";

export interface TourStep {
  /** Valeur de l'attribut data-tour à mettre en lumière ; plusieurs = la première présente à l'écran */
  target: string[];
  title: string;
  body: string;
}

export interface TourEnding {
  label: string;
  to: string;
}

export const TOUR_PROFILES: { key: TourProfile; title: string; hint: string }[] = [
  { key: "contributor", title: "Produire un document", hint: "Remplir un template existant et l'exporter en PDF" },
  { key: "designer", title: "Concevoir des templates", hint: "Créer la mise en page et choisir les champs à remplir" },
];

const REPLAY: TourStep = {
  target: ["tour-replay"],
  title: "Besoin d'un rappel ?",
  body: "Vous pouvez relancer ce tutoriel à tout moment depuis ce bouton.",
};

export const TOUR_STEPS: Record<TourProfile, TourStep[]> = {
  contributor: [
    {
      target: ["nav-studio"],
      title: "Votre espace : le Studio",
      body: "C'est ici que vous créez, reprenez et exportez vos documents. Les autres espaces servent à préparer les templates : vous n'en avez pas besoin.",
    },
    {
      target: ["recent-documents", "action-document"],
      title: "Reprendre là où vous en étiez",
      body: "Vos documents récents apparaissent sur l'accueil, brouillons en premier. Pour l'édition suivante, dupliquez simplement le document du mois précédent.",
    },
    {
      target: ["action-document"],
      title: "Un document en quatre étapes",
      body: "Choisissez un template, remplissez les champs (dans un formulaire ou directement sur la page), relisez, puis exportez en PDF. Tout est enregistré automatiquement.",
    },
    REPLAY,
  ],
  designer: [
    {
      target: ["nav-templates"],
      title: "L'Atelier : vos templates",
      body: "Concevez la mise en page en quatre étapes : point de départ, thème, construction, puis choix des champs à remplir. Publiez pour rendre le template disponible.",
    },
    {
      target: ["nav-components"],
      title: "La Bibliothèque : vos presets",
      body: "Réglez une fois un composant (couleurs de la charte, structure habituelle) et retrouvez-le dans l'éditeur de tous vos templates.",
    },
    {
      target: ["nav-studio"],
      title: "Le Studio : là où l'on remplit",
      body: "Un template publié apparaît ici. Les contributeurs le remplissent et l'exportent, sans jamais toucher à la mise en page.",
    },
    {
      target: ["action-template"],
      title: "Commencer",
      body: "Partez d'un template existant (le cas le plus courant) ou d'une page blanche.",
    },
    REPLAY,
  ],
};

export const TOUR_ENDINGS: Record<TourProfile, TourEnding> = {
  contributor: { label: "Créer un document", to: "/documents/new" },
  designer: { label: "Créer un template", to: "/templates/new" },
};
