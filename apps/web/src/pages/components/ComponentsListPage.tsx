import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { PRESET_WORKFLOW } from "@/workflow/definitions";
import { CreateButton, SpaceHeader } from "@/components/ui/SpaceHeader";
import { ComponentPreview } from "@/components/document-view/ComponentPreview";
import { get } from "@template-generator/component-registry/registry";
import { DEFAULT_THEME } from "@template-generator/shared/types/template";
import type { ComponentCategory } from "@template-generator/shared/types/component";
import type { ComponentPreset } from "@template-generator/shared/types/document";

const CATEGORY_LABELS: Record<string, string> = {
  layout: "Mise en page",
  content: "Contenu",
  data: "Données",
  decoration: "Décoration",
};

export function ComponentsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const draftInProgress = useComponentDraftStore((s) => s.baseType !== null && s.editingId === null);

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

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.presets.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.presets.list() }),
  });

  // Un brouillon de création interrompu est repris là où il en était
  const handleNew = () => navigate(PRESET_WORKFLOW.steps[draftInProgress ? 1 : 0]!.path("new"));

  const handleEdit = (preset: ComponentPreset) => navigate(PRESET_WORKFLOW.steps[1]!.path(preset.id));

  const handleDelete = async (e: React.MouseEvent, preset: ComponentPreset) => {
    e.stopPropagation();
    const ok = await confirm({
      title: `Supprimer le preset « ${preset.label} » ?`,
      consequences: [
        "Il disparaîtra de la bibliothèque de l'éditeur de templates.",
        "Les templates qui l'utilisent déjà ne changent pas : le composant y reste tel quel.",
      ],
      confirmLabel: "Supprimer le preset",
      tone: "danger",
    });
    if (ok) deleteMutation.mutate(preset.id);
  };

  const filtered = presets.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search && !p.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = Array.from(new Set(presets.map((p) => p.category).filter(Boolean))) as ComponentCategory[];

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <SpaceHeader
        kind="preset"
        tag="Presets"
        title="Bibliothèque"
        subtitle="Des composants réglés une fois, réutilisables dans tous les templates."
        action={
          <CreateButton kind="preset" onClick={handleNew}>
            {draftInProgress ? "Reprendre le preset en cours" : "Nouveau preset"}
          </CreateButton>
        }
      />

      <div className="flex items-center gap-4 border-b border-rule px-8 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Catégorie :</span>
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              categoryFilter === "all" ? "bg-preset text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                categoryFilter === cat ? "bg-preset text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            className="px-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-ink w-48"
          />
        </div>
      </div>

      <div className="px-8 py-8">
        {isLoading && <p className="text-sm text-gray-400">Chargement...</p>}

        {!isLoading && presets.length === 0 && (
          <div className="mx-auto max-w-md py-20 text-center">
            <p className="text-sm font-medium text-gray-700">Aucun preset pour l'instant</p>
            <p className="mb-4 mt-1 text-sm text-gray-500">
              Un preset est un composant réglé une fois (couleur de la charte, structure habituelle) et rangé ici. Il
              apparaît ensuite dans la bibliothèque de l'éditeur, à côté des composants de base.
            </p>
            <button
              onClick={handleNew}
              className="rounded bg-preset px-5 py-2.5 text-sm font-medium text-white transition-colors hover:brightness-95"
            >
              Créer mon premier preset
            </button>
          </div>
        )}

        {!isLoading && presets.length > 0 && filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-500">
            Aucun preset ne correspond à ces filtres.{" "}
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
              }}
              className="text-preset hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </p>
        )}

        <div className="grid max-w-6xl grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {filtered.map((p) => (
            <PresetCard
              key={p.id}
              preset={p}
              onEdit={handleEdit}
              onDuplicate={(id) => duplicateMutation.mutate(id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  preset: ComponentPreset;
  onEdit: (preset: ComponentPreset) => void;
  onDuplicate: (id: string) => void;
  onDelete: (e: React.MouseEvent, preset: ComponentPreset) => void;
}) {
  const base = get(preset.baseType);
  return (
    <div className="group flex flex-col overflow-hidden rounded-[10px] border border-gray-200 bg-white transition-all hover:border-preset hover:shadow-md">
      <button onClick={() => onEdit(preset)} className="block text-left" aria-label={`Modifier ${preset.label}`}>
        <div className="h-[130px] overflow-hidden border-b border-gray-100 bg-table p-3">
          <div className="overflow-hidden rounded-sm bg-white shadow-sm">
            <ComponentPreview
              type={preset.baseType}
              props={{ ...(base?.defaultProps ?? {}), ...preset.defaultProps }}
              theme={DEFAULT_THEME}
              maxHeight={106}
              compact
            />
          </div>
        </div>
        <div className="px-4 pb-1 pt-3">
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{preset.label}</h3>
            {preset.category && (
              <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                {CATEGORY_LABELS[preset.category] ?? preset.category}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-gray-500">{base?.label ?? preset.baseType}</p>
          {preset.description && <p className="mt-1 line-clamp-2 text-xs text-gray-400">{preset.description}</p>}
        </div>
      </button>
      <div className="mt-auto flex items-center justify-end gap-0.5 px-3 pb-2.5 pt-1">
        <button
          onClick={() => onDuplicate(preset.id)}
          className="rounded px-1.5 py-1 text-xs text-gray-500 transition-colors hover:bg-preset-tint hover:text-preset"
        >
          Dupliquer
        </button>
        <button
          onClick={(e) => onDelete(e, preset)}
          className="rounded px-1.5 py-1 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
