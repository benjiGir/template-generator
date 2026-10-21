import type { ComponentCategory } from "@template-generator/shared/types/component";

interface Props {
  activeCategory: ComponentCategory | null;
  onCategoryChange: (category: ComponentCategory | null) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const CATEGORIES: { value: ComponentCategory; label: string }[] = [
  { value: "layout", label: "Layout" },
  { value: "content", label: "Contenu" },
  { value: "data", label: "Données" },
  { value: "decoration", label: "Déco" },
];

export function CategoryFilter({ activeCategory, onCategoryChange, search, onSearchChange }: Props) {
  return (
    <div className="px-3 py-2 border-b border-wash space-y-2">
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-xs border border-rule rounded focus:outline-none focus:border-focus bg-paper"
      />
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
            activeCategory === null
              ? "bg-tpl text-white border-tpl"
              : "border-rule text-ink-subtle hover:border-tpl-rule"
          }`}
        >
          Tous
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(activeCategory === cat.value ? null : cat.value)}
            className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
              activeCategory === cat.value
                ? "bg-tpl text-white border-tpl"
                : "border-rule text-ink-subtle hover:border-tpl-rule"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
