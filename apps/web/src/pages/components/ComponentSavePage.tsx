import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { get } from "@template-generator/component-registry/registry";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { PRESET_WORKFLOW } from "@/workflow/definitions";
import { NotFoundState } from "@/workflow/EntityState";
import { PresetPreviewPane } from "./PresetPreviewPane";
import type { ComponentCategory } from "@template-generator/shared/types/component";

const CATEGORY_OPTIONS: { value: ComponentCategory; label: string }[] = [
  { value: "layout",     label: "Mise en page" },
  { value: "content",    label: "Contenu" },
  { value: "data",       label: "Données" },
  { value: "decoration", label: "Décoration" },
];

export function ComponentSavePage() {
  const navigate = useNavigate();
  const { presetId } = useParams<{ presetId: string }>();
  const queryClient = useQueryClient();
  const baseType = useComponentDraftStore((s) => s.baseType);
  const props = useComponentDraftStore((s) => s.props);
  const editingId = useComponentDraftStore((s) => s.editingId);
  const label = useComponentDraftStore((s) => s.label);
  const description = useComponentDraftStore((s) => s.description);
  const category = useComponentDraftStore((s) => s.category);
  const setMeta = useComponentDraftStore((s) => s.setMeta);
  const reset = useComponentDraftStore((s) => s.reset);

  const def = baseType ? get(baseType) : null;
  const setLabel = (v: string) => setMeta({ label: v });
  const setDescription = (v: string) => setMeta({ description: v });
  const setCategory = (v: ComponentCategory) => setMeta({ category: v });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        baseType: baseType!,
        label: label.trim(),
        description: description.trim() || undefined,
        defaultProps: props,
        category,
      };
      return editingId
        ? api.presets.update(editingId, payload)
        : api.presets.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.presets.list() });
      reset();
      navigate("/components");
    },
  });

  if (!baseType || !def) {
    return <NotFoundState message="Aucun composant en cours de création." backTo={PRESET_WORKFLOW.steps[0]!.path("new")} backLabel="Recommencer" />;
  }

  return (
    <WorkflowLayout
      workflow={PRESET_WORKFLOW}
      current="save"
      entityId={presetId}
      firstNavigableStep={presetId === "new" ? 0 : 1}
      title={editingId ? label : `Nouveau preset — ${def.label}`}
      guard={label.trim() ? undefined : { ok: false, reason: "Donnez un nom au preset" }}
      finalAction={{
        label: editingId ? "Enregistrer les modifications" : "Ranger dans la bibliothèque",
        onClick: async () => { await saveMutation.mutateAsync(); },
        disabled: !label.trim(),
      }}
    >
      <div className="h-full flex overflow-hidden bg-gray-50">
        <div className="w-[400px] shrink-0 overflow-y-auto bg-white border-r border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            {editingId ? "Modifier le preset" : "Nommer et sauvegarder"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nom du preset <span className="text-red-400">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: KPI Card Verte"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Description optionnelle…"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComponentCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Composant de base : <span className="font-medium text-gray-600">{def.label}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <PresetPreviewPane type={baseType} props={props} />
        </div>
      </div>
    </WorkflowLayout>
  );
}
