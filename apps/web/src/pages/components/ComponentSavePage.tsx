import { useNavigate, useParams } from "react-router-dom";
import { get } from "@template-generator/component-registry/registry";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { PRESET_WORKFLOW, PRESET_PATHS } from "@/workflow/definitions";
import { NotFoundState } from "@/workflow/EntityState";
import { PresetPreviewPane } from "./PresetPreviewPane";
import { COMPONENT_CATEGORIES, type ComponentCategory } from "@template-generator/shared/types/component";
import { useSavePreset } from "@/api/hooks/presets";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";

const CATEGORY_OPTIONS: { value: ComponentCategory; label: string }[] = [
  { value: "layout", label: "Mise en page" },
  { value: "content", label: "Contenu" },
  { value: "data", label: "Données" },
  { value: "decoration", label: "Décoration" },
];

export function ComponentSavePage() {
  const navigate = useNavigate();
  const { presetId } = useParams<{ presetId: string }>();
  const savePreset = useSavePreset();
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

  // Création, ou enregistrement du preset en cours de modification
  const save = async () => {
    if (!baseType) return;
    await savePreset.mutateAsync({
      id: editingId,
      baseType,
      label: label.trim(),
      description: description.trim() || null,
      defaultProps: props,
      category,
    });
    reset();
    navigate("/components");
  };

  if (!baseType || !def) {
    return (
      <NotFoundState
        message="Aucun composant en cours de création."
        backTo={PRESET_PATHS.select()}
        backLabel="Recommencer"
      />
    );
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
        onClick: save,
        disabled: !label.trim(),
      }}
    >
      <div className="h-full flex overflow-hidden bg-paper">
        <div className="w-[400px] shrink-0 overflow-y-auto bg-white border-r border-rule p-6">
          <h2 className="text-base font-semibold text-ink mb-5">
            {editingId ? "Modifier le preset" : "Nommer et sauvegarder"}
          </h2>

          <div className="space-y-4">
            <Field
              label={
                <>
                  Nom du preset <span className="text-danger">*</span>
                </>
              }
            >
              <Input
                size="md"
                autoFocus
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: KPI Card Verte"
              />
            </Field>

            <Field label="Description">
              <Textarea
                size="md"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Description optionnelle…"
                className="resize-none"
              />
            </Field>

            <Field label="Catégorie">
              <Select
                size="md"
                value={category}
                onChange={(e) => {
                  const chosen = COMPONENT_CATEGORIES.find((c) => c === e.target.value);
                  if (chosen) setCategory(chosen);
                }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="pt-2 border-t border-wash">
              <p className="text-xs text-ink-faint">
                Composant de base : <span className="font-medium text-ink-muted">{def.label}</span>
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
