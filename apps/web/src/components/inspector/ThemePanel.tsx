import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { ThemePresetPicker } from "./ThemePresetPicker";
import { COLOR_GROUPS, ColorTokenRow } from "./ThemeColorEditor";
import { ThemeTypographyEditor } from "./ThemeTypographyEditor";
import { ThemeSpacingEditor } from "./ThemeSpacingEditor";
import { ThemeBorderEditor } from "./ThemeBorderEditor";

/** Recherche insensible à la casse et aux accents */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function Section({
  title,
  hint,
  defaultOpen = false,
  forceOpen = false,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = open || forceOpen;
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-1.5 px-4 py-2.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        {isOpen ? (
          <ChevronDown size={14} className="text-gray-400" />
        ) : (
          <ChevronRight size={14} className="text-gray-400" />
        )}
        {title}
      </button>
      {isOpen && (
        <div className="pb-3">
          {hint && <p className="px-4 pb-1 text-[11px] text-gray-500">{hint}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

/** Sections hors couleurs, avec les mots qui permettent de les retrouver */
const OTHER_SECTIONS = [
  {
    title: "Typographie",
    keywords: "police fonte typographie titres taille texte interlignage graisse gras",
    render: () => <ThemeTypographyEditor />,
  },
  {
    title: "Espacements",
    keywords: "espacement marge padding page sections composants unite",
    render: () => <ThemeSpacingEditor />,
  },
  {
    title: "Bordures et arrondis",
    keywords: "bordure arrondi rayon epaisseur coin cadre",
    render: () => <ThemeBorderEditor />,
  },
];

/**
 * Réglages du thème, organisés par usage dans le document :
 * on cherche « la couleur des encadrés de résultat », pas « backgroundAlt ».
 */
export function ThemePanel() {
  const queryClient = useQueryClient();
  const theme = useEditorStore((s) => s.template?.theme);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  if (!theme) return null;

  const q = normalize(query.trim());
  const searching = q.length > 0;

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    try {
      await api.themes.create({ name: saveName.trim(), theme: { ...theme, name: saveName.trim() } });
      await queryClient.invalidateQueries({ queryKey: queryKeys.themes.list() });
      setSavedMessage(`Thème « ${saveName.trim()} » ajouté aux thèmes prédéfinis.`);
      setShowSaveForm(false);
      setSaveName("");
    } finally {
      setSaving(false);
    }
  };

  const colorGroups = COLOR_GROUPS.map((g) => ({
    ...g,
    tokens: searching ? g.tokens.filter((t) => normalize(`${g.title} ${t.label} ${t.usage}`).includes(q)) : g.tokens,
  })).filter((g) => g.tokens.length > 0);
  const otherSections = OTHER_SECTIONS.filter((s) => !searching || normalize(`${s.title} ${s.keywords}`).includes(q));
  const nothing = searching && colorGroups.length === 0 && otherSections.length === 0;

  return (
    <div className="flex flex-col">
      {!searching && (
        <Section title="Thèmes prédéfinis" defaultOpen>
          <ThemePresetPicker />
        </Section>
      )}

      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-2">
        <label className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5 focus-within:border-blue-400">
          <Search size={13} className="text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un réglage : encadré, titres, KPI vert…"
            className="min-w-0 flex-1 text-xs focus:outline-none"
          />
        </label>
      </div>

      {nothing && (
        <p className="px-4 py-6 text-center text-xs text-gray-500">Aucun réglage ne correspond à « {query} ».</p>
      )}

      {colorGroups.map((g, i) => (
        <Section key={g.title} title={g.title} hint={g.hint} defaultOpen={i === 0} forceOpen={searching}>
          <div className="px-4">
            {g.tokens.map((t) => (
              <ColorTokenRow key={t.key} token={t} />
            ))}
          </div>
        </Section>
      ))}

      {otherSections.map((s) => (
        <Section key={s.title} title={s.title} forceOpen={searching}>
          {s.render()}
        </Section>
      ))}

      {!searching && (
        <div className="px-4 py-3">
          {savedMessage && <p className="mb-2 text-[11px] text-emerald-700">{savedMessage}</p>}
          {showSaveForm ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSave();
                  if (e.key === "Escape") setShowSaveForm(false);
                }}
                placeholder="Nom du thème…"
                aria-label="Nom du nouveau thème"
                className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={() => void handleSave()}
                disabled={saving || !saveName.trim()}
                className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "…" : "Enregistrer"}
              </button>
              <button
                onClick={() => setShowSaveForm(false)}
                className="rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowSaveForm(true);
                setSavedMessage(null);
              }}
              className="w-full rounded border border-dashed border-blue-300 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              Enregistrer ces réglages comme thème réutilisable
            </button>
          )}
        </div>
      )}
    </div>
  );
}
