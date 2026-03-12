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
    <div className="px-3 py-2 border-b border-gray-100 space-y-2">
      <input
        type="text"
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-gray-50"
      />
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
            activeCategory === null
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-200 text-gray-500 hover:border-blue-300"
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
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 text-gray-500 hover:border-blue-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
