import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAll } from "@template-generator/component-registry/registry";
import type { ComponentCategory } from "@template-generator/shared/types/component";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { ComponentCard } from "./ComponentCard";
import { PresetCard } from "./PresetCard";

const CATEGORY_ORDER: ComponentCategory[] = ["layout", "content", "data", "decoration"];

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  layout: "Mise en page",
  content: "Contenu",
  data: "Données",
  decoration: "Décoration",
};

export function ComponentLibrary() {
  const allComponents = getAll();
  const [search, setSearch] = useState("");

  const { data: presets = [] } = useQuery({
    queryKey: queryKeys.presets.list(),
    queryFn: () => api.presets.list(),
  });

  const filtered = allComponents.filter(
    (def) =>
      search === "" ||
      def.label.toLowerCase().includes(search.toLowerCase()) ||
      def.description.toLowerCase().includes(search.toLowerCase())
  );

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: filtered.filter((def) => def.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="h-full flex flex-col border-r border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Bibliothèque
        </h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-gray-50"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {byCategory.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-8 px-4">Aucun composant trouvé</p>
        ) : (
          byCategory.map((group) => (
            <div key={group.category}>
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b-gray-300 border-b">
                {group.label}
              </p>
              {group.items.map((def) => (
                <ComponentCard key={def.type} definition={def} />
              ))}
            </div>
          ))
        )}

        {presets.length > 0 && (
          <div className="border-t border-gray-100 mt-2">
            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
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
