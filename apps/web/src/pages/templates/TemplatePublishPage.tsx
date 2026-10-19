import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Send } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useEditorStore } from "@/store/editor-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { useWorkflowSession } from "@/workflow/session";
import { TEMPLATE_WORKFLOW } from "@/workflow/definitions";
import { get } from "@template-generator/component-registry/registry";
import { fieldKey, templateStatus } from "@template-generator/shared/utils/fields";
import type { Template, EditableField, ComponentNode } from "@template-generator/shared/types/template";
import type { PropType } from "@template-generator/shared/types/component";

const EDITABLE_PROP_TYPES: PropType[] = ["text", "textarea", "richtext", "list", "emoji", "number", "image"];

/** Tous les contenus modifiables du template, dans l'ordre du document */
function detectEditableFields(template: Template): EditableField[] {
  const fields: EditableField[] = [];
  let order = 0;

  function scan(nodes: ComponentNode[]) {
    for (const node of nodes) {
      const def = get(node.type);
      if (def) {
        for (const prop of def.schema) {
          if (EDITABLE_PROP_TYPES.includes(prop.type)) {
            fields.push({
              nodeId:       node.id,
              propKey:      prop.key,
              label:        prop.label,
              type:         prop.type,
              defaultValue: node.props[prop.key] ?? prop.defaultValue,
              required:     prop.required ?? false,
              group:        prop.group,
              order:        order++,
            });
          }
        }
      }
      if (node.children) scan(node.children);
    }
  }

  for (const page of template.pages) scan(page.children);
  return fields;
}

export function TemplatePublishPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useWorkflowSession();
  const template = useEditorStore((s) => s.template)!;
  const updateTemplateMeta = useEditorStore((s) => s.updateTemplateMeta);
  const setEditableFields = useEditorStore((s) => s.setEditableFields);
  const applyServerState = useEditorStore((s) => s.applyServerState);

  const detectedFields = useMemo(() => detectEditableFields(template), [template]);
  const selected = useMemo(() => new Map(template.editableFields.map((f) => [fieldKey(f), f])), [template.editableFields]);

  // Première visite : pré-sélection de tous les contenus détectés
  useEffect(() => {
    if (template.editableFields.length === 0 && !template.published && detectedFields.length > 0) {
      setEditableFields(detectedFields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Les champs retenus suivent l'ordre du document ; ceux dont le composant a disparu sont ignorés
  const orderedSelection = detectedFields
    .filter((f) => selected.has(fieldKey(f)))
    .map((f, i) => ({ ...f, ...selected.get(fieldKey(f)), order: i }));

  const toggleField = (field: EditableField) => {
    const key = fieldKey(field);
    const next = selected.has(key)
      ? orderedSelection.filter((f) => fieldKey(f) !== key)
      : detectedFields.filter((f) => selected.has(fieldKey(f)) || fieldKey(f) === key).map((f) => selected.get(fieldKey(f)) ?? f);
    setEditableFields(next);
  };

  const status = templateStatus(template);

  const publish = async () => {
    await session?.flush();
    const result = await api.templates.publish(template.id, { editableFields: orderedSelection });
    applyServerState(result);
    queryClient.setQueryData(queryKeys.templates.detail(result.id), result);
    await queryClient.invalidateQueries({ queryKey: ["templates", "list"] });
    navigate("/templates");
  };

  const nameMissing = template.name.trim().length === 0;

  return (
    <WorkflowLayout
      workflow={TEMPLATE_WORKFLOW}
      current="publish"
      entityId={template.id}
      title={template.name}
      finalAction={{
        label: status === "draft" ? "Publier dans le Studio" : status === "published-with-changes" ? "Publier les modifications" : "Republier",
        icon: <Send size={14} />,
        onClick: publish,
        disabled: nameMissing,
      }}
      guard={nameMissing ? { ok: false, reason: "Donnez un nom au template" } : undefined}
    >
      <div className="h-full overflow-y-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {status !== "draft" && (
            <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-blue-800">
              {status === "published-with-changes"
                ? "Ce template est publié, mais vos modifications récentes ne sont pas encore visibles dans le Studio. Les documents existants ne changent pas."
                : "Ce template est publié et à jour dans le Studio."}
            </p>
          )}

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Informations</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Nom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => updateTemplateMeta(e.target.value)}
                  className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                <textarea
                  value={template.description ?? ""}
                  onChange={(e) => updateTemplateMeta(template.name, e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Champs à remplir dans le Studio</h3>
              <span className="text-xs text-gray-400">
                {orderedSelection.length} / {detectedFields.length} retenus
              </span>
            </div>
            <p className="mb-4 text-xs text-gray-500">
              Les champs cochés formeront le formulaire du Studio. Tout le reste du template est verrouillé.
            </p>

            {detectedFields.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Aucun contenu modifiable détecté dans ce template.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="w-8 py-2 pr-3 text-left font-medium text-gray-500"></th>
                    <th className="py-2 pr-3 text-left font-medium text-gray-500">Libellé</th>
                    <th className="py-2 pr-3 text-left font-medium text-gray-500">Type</th>
                    <th className="py-2 text-left font-medium text-gray-500">Groupe</th>
                  </tr>
                </thead>
                <tbody>
                  {detectedFields.map((field) => {
                    const enabled = selected.has(fieldKey(field));
                    const stored = selected.get(fieldKey(field)) ?? field;
                    return (
                      <tr key={fieldKey(field)} onClick={() => toggleField(field)} className="cursor-pointer border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 pr-3">
                          <div className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${enabled ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                            {enabled && <Check size={10} className="text-white" />}
                          </div>
                        </td>
                        <td className="py-2 pr-3 font-medium text-gray-900">{stored.label}</td>
                        <td className="py-2 pr-3">
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">{field.type}</span>
                        </td>
                        <td className="py-2 text-gray-400">{stored.group ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </WorkflowLayout>
  );
}
