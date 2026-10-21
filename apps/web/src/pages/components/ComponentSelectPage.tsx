import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAll } from "@template-generator/component-registry/registry";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { useComponentDraftStore } from "@/store/component-draft-store";
import { ComponentPreview } from "@/components/document-view/ComponentPreview";
import { DEFAULT_THEME } from "@template-generator/shared/types/template";
import { PRESET_WORKFLOW, PRESET_PATHS } from "@/workflow/definitions";
import type { ComponentCategory } from "@template-generator/shared/types/component";

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  layout: "Mise en page",
  content: "Contenu",
  data: "Données",
  decoration: "Décoration",
};

const CATEGORY_ORDER: ComponentCategory[] = ["layout", "content", "data", "decoration"];

export function ComponentSelectPage() {
  const navigate = useNavigate();
  const setBaseType = useComponentDraftStore((s) => s.setBaseType);
  const currentBaseType = useComponentDraftStore((s) => s.baseType);

  const [selected, setSelected] = useState<string | null>(currentBaseType);
  const [categoryFilter, setCategoryFilter] = useState<ComponentCategory | "all">("all");

  const allComponents = getAll();

  const filtered =
    categoryFilter === "all" ? allComponents : allComponents.filter((c) => c.category === categoryFilter);

  // Catégories non vides, dans l'ordre de la bibliothèque
  const grouped = CATEGORY_ORDER.flatMap((cat) => {
    const components = filtered.filter((c) => c.category === cat);
    return components.length > 0 ? [{ cat, components }] : [];
  });

  const choose = (type: string) => {
    setSelected(type);
    const def = allComponents.find((c) => c.type === type);
    if (!def) return;
    // Revenir à cette étape sans changer de composant conserve la configuration
    if (type !== currentBaseType) setBaseType(type, def.defaultProps, def.category, def.label);
    navigate(PRESET_PATHS.configure("new"));
  };

  return (
    <WorkflowLayout
      workflow={PRESET_WORKFLOW}
      current="select"
      entityId="new"
      firstNavigableStep={0}
      title="Nouveau preset"
      guard={selected ? { ok: true } : { ok: false, reason: "Cliquez sur un composant pour le configurer" }}
      onNext={() => {
        if (selected) choose(selected);
      }}
    >
      <div className="h-full flex flex-col overflow-hidden bg-paper">
        {/* Category filter */}
        <div className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white border-b border-rule">
          <span className="text-xs font-medium text-ink-subtle mr-1">Filtrer :</span>
          {(["all", ...CATEGORY_ORDER] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                categoryFilter === cat ? "bg-preset text-white" : "bg-wash text-ink-muted hover:bg-rule"
              }`}
            >
              {cat === "all" ? "Tous" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Components grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {grouped.map(({ cat, components }) => (
            <div key={cat} className="mb-6">
              <h3 className="text-xs font-semibold text-ink-subtle uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {components.map((def) => (
                  <button
                    key={def.type}
                    onClick={() => choose(def.type)}
                    aria-label={def.label}
                    className={`overflow-hidden rounded-lg border-2 bg-white text-left transition-all ${
                      selected === def.type
                        ? "border-preset shadow-sm"
                        : "border-rule hover:border-preset hover:shadow-sm"
                    }`}
                  >
                    <div className="h-[110px] overflow-hidden border-b border-wash bg-table p-2">
                      <div className="overflow-hidden rounded-sm bg-white shadow-sm">
                        <ComponentPreview
                          type={def.type}
                          props={def.defaultProps}
                          theme={DEFAULT_THEME}
                          maxHeight={94}
                          compact
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-ink">{def.label}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-subtle">{def.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkflowLayout>
  );
}
