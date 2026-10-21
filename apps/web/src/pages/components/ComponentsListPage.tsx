import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { useDeletePreset, useDuplicatePreset, usePresets } from "@/api/hooks/presets";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { PRESET_PATHS } from "@/workflow/definitions";
import { SpaceHeader } from "@/components/ui/SpaceHeader";
import { Button } from "@/components/ui/Button";
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
  const confirm = useConfirm();
  const draftInProgress = useComponentDraftStore((s) => s.baseType !== null && s.editingId === null);

  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | "all">("all");
  const [search, setSearch] = useState("");

  const { data: presets = [], isLoading } = usePresets();
  const deleteMutation = useDeletePreset();
  const duplicateMutation = useDuplicatePreset();

  // Un brouillon de création interrompu est repris là où il en était
  const handleNew = () => navigate(draftInProgress ? PRESET_PATHS.configure("new") : PRESET_PATHS.select());

  const handleEdit = (preset: ComponentPreset) => navigate(PRESET_PATHS.configure(preset.id));

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

  const categories = Array.from(new Set(presets.flatMap((p) => (p.category ? [p.category] : []))));

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <SpaceHeader
        kind="preset"
        tag="Presets"
        title="Bibliothèque"
        subtitle="Des composants réglés une fois, réutilisables dans tous les templates."
        action={
          <Button variant="primary" tone="preset" size="lg" onClick={handleNew}>
            {draftInProgress ? "Reprendre le preset en cours" : "Nouveau preset"}
          </Button>
        }
      />

      <div className="flex items-center gap-4 border-b border-rule px-8 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-subtle">Catégorie :</span>
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              categoryFilter === "all" ? "bg-preset text-white" : "bg-wash text-ink-muted hover:bg-rule"
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                categoryFilter === cat ? "bg-preset text-white" : "bg-wash text-ink-muted hover:bg-rule"
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
            className="px-3 py-1.5 text-xs border border-rule rounded focus:outline-none focus:border-ink w-48"
          />
        </div>
      </div>

      <div className="px-8 py-8">
        {isLoading && <p className="text-sm text-ink-faint">Chargement...</p>}

        {!isLoading && presets.length === 0 && (
          <div className="mx-auto max-w-md py-20 text-center">
            <p className="text-sm font-medium text-ink-soft">Aucun preset pour l'instant</p>
            <p className="mb-4 mt-1 text-sm text-ink-subtle">
              Un preset est un composant réglé une fois (couleur de la charte, structure habituelle) et rangé ici. Il
              apparaît ensuite dans la bibliothèque de l'éditeur, à côté des composants de base.
            </p>
            <Button variant="primary" tone="preset" size="lg" onClick={handleNew}>
              Créer mon premier preset
            </Button>
          </div>
        )}

        {!isLoading && presets.length > 0 && filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-ink-subtle">
            Aucun preset ne correspond à ces filtres.{" "}
            <Button
              variant="link"
              tone="preset"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
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
    <div className="group flex flex-col overflow-hidden rounded-[10px] border border-rule bg-white transition-all hover:border-preset hover:shadow-md">
      <button onClick={() => onEdit(preset)} className="block text-left" aria-label={`Modifier ${preset.label}`}>
        <div className="h-[130px] overflow-hidden border-b border-wash bg-table p-3">
          <div className="overflow-hidden rounded-sm bg-white shadow-sm">
            <ComponentPreview
              type={preset.baseType}
              props={{ ...base?.defaultProps, ...preset.defaultProps }}
              theme={DEFAULT_THEME}
              maxHeight={106}
              compact
            />
          </div>
        </div>
        <div className="px-4 pb-1 pt-3">
          <div className="flex items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{preset.label}</h3>
            {preset.category && (
              <span className="shrink-0 rounded bg-wash px-1.5 py-0.5 text-[10px] font-medium text-ink-subtle">
                {CATEGORY_LABELS[preset.category] ?? preset.category}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-ink-subtle">{base?.label ?? preset.baseType}</p>
          {preset.description && <p className="mt-1 line-clamp-2 text-xs text-ink-faint">{preset.description}</p>}
        </div>
      </button>
      <div className="mt-auto flex items-center justify-end gap-0.5 px-3 pb-2.5 pt-1">
        <Button variant="ghost" size="sm" onClick={() => onDuplicate(preset.id)}>
          Dupliquer
        </Button>
        <Button variant="ghost" tone="danger" size="sm" onClick={(e) => onDelete(e, preset)}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}
