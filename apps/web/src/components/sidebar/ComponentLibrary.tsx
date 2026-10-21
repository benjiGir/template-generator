import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAll } from "@template-generator/component-registry/registry";
import type { ComponentCategory } from "@template-generator/shared/types/component";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { ComponentCard } from "./ComponentCard";
import { PresetCard } from "./PresetCard";
import { ObjectMark } from "@/components/ui/ObjectIdentity";

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

  const q = search.trim().toLowerCase();
  const filtered = allComponents.filter(
    (def) => q === "" || def.label.toLowerCase().includes(q) || def.description.toLowerCase().includes(q),
  );
  // Les presets sont cherchés par leur nom et par le composant dont ils dérivent
  const filteredPresets = presets.filter(
    (p) =>
      q === "" ||
      `${p.label} ${p.description ?? ""} ${getAll().find((d) => d.type === p.baseType)?.label ?? ""}`
        .toLowerCase()
        .includes(q),
  );

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: filtered.filter((def) => def.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="h-full flex flex-col border-r border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bibliothèque</h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-gray-50"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredPresets.length > 0 && (
          <div className="border-b border-gray-100 pb-1">
            <p className="flex items-center gap-1.5 px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-preset">
              <ObjectMark kind="preset" size={8} />
              Mes presets
            </p>
            {filteredPresets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        )}

        {presets.length === 0 && q === "" && (
          <p className="mx-3 mt-3 rounded bg-gray-50 px-2.5 py-2 text-[11px] text-gray-500">
            Vos presets apparaîtront ici. Créez-les dans l'espace Bibliothèque.
          </p>
        )}

        {byCategory.length === 0 && filteredPresets.length === 0 ? (
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
      </div>

      <div className="px-3 py-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Glissez un élément sur la page</p>
      </div>
    </div>
  );
}
