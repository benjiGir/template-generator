import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDocumentStore } from "@/store/document-store";
import { PreviewPane } from "@/components/document-view/PreviewPane";
import { SegmentedProgress } from "@/components/ui/SegmentedProgress";
import { FormFieldGroup } from "./FormFieldGroup";
import { computeCompletion, fieldKey } from "@template-generator/shared/utils/fields";
import type { EditableField } from "@template-generator/shared/types/template";

/** Paramètre d'URL pour arriver directement sur un champ (depuis la relecture) */
export const FOCUS_PARAM = "champ";

export function FormFillMode() {
  const editableFields = useDocumentStore((s) => s.editableFields);
  const data = useDocumentStore((s) => s.data);
  const updateField = useDocumentStore((s) => s.updateField);
  const getMergedTemplate = useDocumentStore((s) => s.getMergedTemplate);
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState<EditableField | null>(null);

  const mergedTemplate = getMergedTemplate();
  const completion = computeCompletion(editableFields, data);

  // Arrivée depuis la relecture : on cible le champ demandé
  useEffect(() => {
    const target = searchParams.get(FOCUS_PARAM);
    if (!target) return;
    const field = editableFields.find((f) => fieldKey(f) === target);
    if (field) focusField(field);
    setSearchParams(
      (p) => {
        p.delete(FOCUS_PARAM);
        return p;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function focusField(field: EditableField) {
    setActive(field);
    requestAnimationFrame(() => {
      const el = document.getElementById(`field-${fieldKey(field)}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input, textarea, [contenteditable=true]")?.focus({ preventScroll: true });
    });
  }

  // Clic dans l'aperçu : on remonte au composant cliqué et on ouvre son premier champ
  const handlePreviewClick = (e: React.MouseEvent) => {
    let el = e.target instanceof Element ? e.target : null;
    while (el) {
      const nodeId = el.getAttribute("data-node-id");
      if (nodeId) {
        const field = editableFields.find((f) => f.nodeId === nodeId);
        if (field) return focusField(field);
      }
      el = el.parentElement;
    }
  };

  // Groupes dans l'ordre du formulaire défini par le concepteur
  const groups = new Map<string | null, EditableField[]>();
  for (const field of editableFields) {
    const g = field.group ?? null;
    const group = groups.get(g);
    if (group) group.push(field);
    else groups.set(g, [field]);
  }
  const ungroupedOnly = groups.size === 1 && groups.has(null);
  const remaining = completion.total - completion.filled;

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="flex w-[420px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="shrink-0 border-b border-gray-100 px-5 py-3">
          <div className="mb-1.5 flex items-baseline justify-between text-xs">
            <span className="font-medium text-gray-700">
              {remaining === 0
                ? "Tous les champs sont remplis"
                : `Encore ${remaining} champ${remaining > 1 ? "s" : ""} à remplir`}
            </span>
            <span className="font-mono text-xs text-gray-700">
              {completion.filled} / {completion.total}
            </span>
          </div>
          <SegmentedProgress filled={completion.filled} total={completion.total} />
          {completion.missingRequired.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const firstMissing = completion.missingRequired[0];
                if (firstMissing) focusField(firstMissing);
              }}
              className="mt-2 text-xs text-amber-700 hover:underline"
            >
              {completion.missingRequired.length} champ{completion.missingRequired.length > 1 ? "s" : ""} obligatoire
              {completion.missingRequired.length > 1 ? "s" : ""} vide{completion.missingRequired.length > 1 ? "s" : ""}{" "}
              — aller au premier
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {editableFields.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Ce template n'a aucun champ à remplir.</p>
          ) : (
            <div className="space-y-6">
              {Array.from(groups.entries()).map(([group, fields]) => (
                <FormFieldGroup
                  key={group ?? "__"}
                  group={ungroupedOnly ? null : (group ?? "Autres champs")}
                  fields={fields}
                  data={data}
                  onUpdate={updateField}
                  activeKey={active ? fieldKey(active) : null}
                  onFocusField={setActive}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {mergedTemplate && (
          <PreviewPane
            template={mergedTemplate}
            highlightNodeId={active?.nodeId ?? null}
            highlightTone="doc"
            framed
            onBackgroundClick={handlePreviewClick}
          />
        )}
      </div>
    </div>
  );
}
