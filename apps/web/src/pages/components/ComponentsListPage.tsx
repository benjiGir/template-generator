import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import type { ComponentCategory } from "@template-generator/shared/types/component";
import type { ComponentPreset } from "@template-generator/shared/types/document";

const CATEGORY_LABELS: Record<string, string> = {
  layout:     "Mise en page",
  content:    "Contenu",
  data:       "Données",
  decoration: "Décoration",
};

export function ComponentsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const resetDraft = useComponentDraftStore((s) => s.reset);

  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | "all">("all");
  const [search, setSearch] = useState("");

  const { data: presets = [], isLoading } = useQuery({
    queryKey: queryKeys.presets.list(),
    queryFn: () => api.presets.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.presets.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.presets.list() }),
  });

  const handleNew = () => {
    resetDraft();
    navigate("/components/new");
  };

  const loadPreset = useComponentDraftStore((s) => s.loadPreset);

  const handleEdit = (preset: ComponentPreset) => {
    loadPreset(preset);
    navigate("/components/new/edit");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce preset ?")) return;
    deleteMutation.mutate(id);
  };

  const filtered = presets.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search && !p.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = Array.from(
    new Set(presets.map((p) => p.category).filter(Boolean))
  ) as ComponentCategory[];

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Bibliothèque Composants</h1>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          + Nouveau preset
        </button>
      </div>

      <div className="bg-white border-b border-gray-100 px-8 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Catégorie :</span>
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              categoryFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                categoryFilter === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="px-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 w-48"
          />
        </div>
      </div>

      <div className="px-8 py-8">
        {isLoading && <p className="text-sm text-gray-400">Chargement...</p>}

        {!isLoading && presets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">Aucun preset. Créez-en un pour commencer.</p>
            <button
              onClick={handleNew}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Créer mon premier preset
            </button>
          </div>
        )}

        {!isLoading && presets.length > 0 && filtered.length === 0 && (
          <p className="text-sm text-gray-400">Aucun preset ne correspond aux filtres.</p>
        )}

        <div className="grid grid-cols-3 gap-4 max-w-5xl">
          {filtered.map((p) => (
            <PresetCard key={p.id} preset={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  onEdit,
  onDelete,
}: {
  preset: ComponentPreset;
  onEdit: (preset: ComponentPreset) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{preset.label}</h3>
            {preset.category && (
              <span className="shrink-0 text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {CATEGORY_LABELS[preset.category] ?? preset.category}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{preset.baseType}</p>
          {preset.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{preset.description}</p>
          )}
        </div>
        <div className="ml-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(preset)}
            className="text-gray-400 hover:text-blue-500 text-xs px-1.5 py-1 rounded hover:bg-blue-50 transition-colors"
            title="Modifier"
          >
            Modifier
          </button>
          <button
            onClick={(e) => onDelete(e, preset.id)}
            className="text-gray-400 hover:text-red-500 text-xs p-1"
            title="Supprimer"
          >
            ✕
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        {new Date(preset.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
