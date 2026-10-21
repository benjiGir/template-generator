import { useEditorStore } from "@/store/editor-store";
import type { ThemeColors } from "@template-generator/shared/types/template";

function lighten(hex: string, amount = 0.85): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export interface ColorToken {
  key: keyof ThemeColors;
  label: string;
  /** Où la couleur apparaît dans le document : sert d'aide et de critère de recherche */
  usage: string;
  /** Variante claire associée, générable depuis cette couleur */
  light?: keyof ThemeColors;
}

/** Couleurs du thème regroupées par usage dans le document (et non par nature) */
export const COLOR_GROUPS: { title: string; hint?: string; tokens: ColorToken[] }[] = [
  {
    title: "Couleur de marque",
    tokens: [
      {
        key: "primary",
        label: "Marque",
        light: "primaryLight",
        usage:
          "Titres de section, encadré d'introduction, en-tête de page, barre de résumé, citations, cartes « bleu »",
      },
      { key: "primaryLight", label: "Marque claire", usage: "Fond des cartes et blocs « bleu »" },
    ],
  },
  {
    title: "Indicateurs et blocs colorés",
    hint: "Couleurs choisies sur chaque carte KPI, carte métrique ou bloc de détails.",
    tokens: [
      {
        key: "success",
        label: "Vert",
        light: "successLight",
        usage: "Bordure et accents des cartes et blocs « vert »",
      },
      { key: "successLight", label: "Vert clair", usage: "Fond des cartes et blocs « vert »" },
      {
        key: "warning",
        label: "Ambre",
        light: "warningLight",
        usage: "Bordure et accents des cartes et blocs « ambre »",
      },
      { key: "warningLight", label: "Ambre clair", usage: "Fond des cartes et blocs « ambre »" },
      {
        key: "danger",
        label: "Rouge",
        light: "dangerLight",
        usage: "Bordure et accents des cartes et blocs « rouge »",
      },
      { key: "dangerLight", label: "Rouge clair", usage: "Fond des cartes et blocs « rouge »" },
    ],
  },
  {
    title: "Textes",
    tokens: [
      { key: "text", label: "Texte", usage: "Texte courant, titres, contenu des encadrés" },
      {
        key: "textLight",
        label: "Texte secondaire",
        usage: "Sous-titres, descriptions des KPI, pied de page, texte de suite",
      },
      { key: "textMuted", label: "Texte discret", usage: "Légendes d'image, auteur des citations, tendances" },
    ],
  },
  {
    title: "Fonds et encadrés",
    tokens: [
      { key: "background", label: "Fond de page", usage: "Fond des pages du document" },
      {
        key: "backgroundAlt",
        label: "Fond des encadrés",
        usage: "Encadrés de résultat, blocs de détails, citations, images",
      },
    ],
  },
  {
    title: "Traits",
    tokens: [
      { key: "border", label: "Trait", usage: "Séparateurs, filet de l'en-tête et du pied de page, cadre des images" },
      { key: "borderLight", label: "Trait léger", usage: "Bordure des citations" },
    ],
  },
  {
    title: "Couleurs non utilisées",
    hint: "Aucun composant actuel ne s'en sert ; elles sont gardées pour de futurs composants.",
    tokens: [
      { key: "accent", label: "Accent", light: "accentLight", usage: "Non utilisée" },
      { key: "accentLight", label: "Accent clair", usage: "Non utilisée" },
    ],
  },
];

export function ColorTokenRow({ token }: { token: ColorToken }) {
  const colors = useEditorStore((s) => s.template?.theme.colors);
  const updateTheme = useEditorStore((s) => s.updateTheme);
  if (!colors) return null;

  const value = colors[token.key];
  const set = (patch: Partial<ThemeColors>) => updateTheme({ colors: { ...colors, ...patch } });

  return (
    <div className="py-1.5">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => set({ [token.key]: e.target.value })}
          aria-label={token.label}
          className="h-6 w-6 shrink-0 cursor-pointer rounded border border-gray-200 p-0"
        />
        <span className="w-32 shrink-0 text-xs font-medium text-gray-700">{token.label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => set({ [token.key]: e.target.value })}
          aria-label={`${token.label} (code couleur)`}
          className="min-w-0 flex-1 rounded border border-gray-200 px-1.5 py-0.5 font-mono text-xs focus:border-blue-400 focus:outline-none"
        />
        {token.light && (
          <button
            type="button"
            onClick={() => set({ [token.light!]: lighten(value) })}
            title="Recalculer la variante claire à partir de cette couleur"
            className="shrink-0 rounded px-1 text-[10px] text-gray-400 hover:bg-blue-50 hover:text-blue-600"
          >
            → clair
          </button>
        )}
      </div>
      <p className="ml-8 mt-0.5 text-[10px] leading-snug text-gray-400">{token.usage}</p>
    </div>
  );
}
