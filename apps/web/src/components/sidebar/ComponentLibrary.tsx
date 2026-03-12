import { useState, useEffect } from "react";
import { getAll } from "@template-generator/component-registry/registry";
import type { ComponentCategory } from "@template-generator/shared/types/component";
import { usePresetsStore } from "@/store/presets-store";
import { ComponentCard } from "./ComponentCard";
import { CategoryFilter } from "./CategoryFilter";
import { PresetCard } from "./PresetCard";

export function ComponentLibrary() {
  const allComponents = getAll();
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | null>(null);
  const [search, setSearch] = useState("");
  const { presets, fetchPresets } = usePresetsStore();

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const filtered = allComponents.filter((def) => {
    const matchesCategory = activeCategory === null || def.category === activeCategory;
    const matchesSearch =
      search === "" ||
      def.label.toLowerCase().includes(search.toLowerCase()) ||
      def.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col border-r border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Bibliothèque
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">{filtered.length} composant{filtered.length > 1 ? "s" : ""}</p>
      </div>

      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex-1 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-8 px-4">Aucun composant trouvé</p>
        ) : (
          filtered.map((def) => <ComponentCard key={def.type} definition={def} />)
        )}

        {/* Section presets */}
        {presets.length > 0 && (
          <div className="mt-2 border-t border-gray-100 pt-2">
            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mes presets
            </p>
            {presets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Glissez vers le canvas</p>
      </div>
    </div>
  );
}
