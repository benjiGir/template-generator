import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { api } from "@/api/client";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { get } from "@template-generator/component-registry/registry";
import { buildWorkflowSteps, useTemplateWorkflow } from "./hooks/useTemplateWorkflow";
import type { Template, EditableField } from "@template-generator/shared/types/template";
import type { ComponentNode } from "@template-generator/shared/types/template";
import type { PropType } from "@template-generator/shared/types/component";

const CURRENT_STEP = 3;

const EDITABLE_PROP_TYPES: PropType[] = ["text", "textarea", "richtext", "list", "emoji", "number", "image"];

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

  for (const page of template.pages) {
    scan(page.children);
  }
  return fields;
}

export function TemplatePublishPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goToStep } = useTemplateWorkflow();

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [detectedFields, setDetectedFields] = useState<EditableField[]>([]);
  const [enabledFields, setEnabledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    api.templates
      .get(id)
      .then((t) => {
        setTemplate(t);
        setName(t.name);
        setDescription(t.description ?? "");
        const fields = detectEditableFields(t);
        setDetectedFields(fields);
        // Enable all by default, or restore existing selection
        const existing = new Set(
          (t.editableFields ?? []).map((f) => `${f.nodeId}.${f.propKey}`)
        );
        setEnabledFields(
          existing.size > 0
            ? existing
            : new Set(fields.map((f) => `${f.nodeId}.${f.propKey}`))
        );
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [id]);

  const toggleField = (key: string) => {
    setEnabledFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handlePublish = async () => {
    if (!id || !template) return;
    setPublishing(true);
    try {
      // Save name/description first
      await api.templates.update(id, { name, description });
      // Then publish
      const selectedFields = detectedFields
        .filter((f) => enabledFields.has(`${f.nodeId}.${f.propKey}`))
        .map((f, i) => ({ ...f, order: i }));
      await api.templates.publish(id, { editableFields: selectedFields });
      navigate("/templates");
    } catch (e) {
      console.error("Erreur publication:", e);
    } finally {
      setPublishing(false);
    }
  };

  const steps = buildWorkflowSteps(CURRENT_STEP);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-sm text-red-500">{error ?? "Template introuvable"}</p>
        <button onClick={() => navigate("/templates")} className="text-sm text-blue-600 hover:underline">
          ← Retour aux templates
        </button>
      </div>
    );
  }

  return (
    <WorkflowLayout
      title="Atelier Templates"
      steps={steps}
      currentStep={CURRENT_STEP}
      canGoNext={!publishing && name.trim().length > 0}
      nextLabel="Publier"
      onPrevious={() => navigate(`/templates/${id}/edit`)}
      onNext={handlePublish}
      onStepClick={(i) => {
        const key = steps[i]?.key;
        if (key && id) goToStep(key, id);
      }}
    >
      <div className="h-full overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-2xl">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Finaliser le template</h2>

          {/* Metadata */}
          <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Informations</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Editable fields */}
          <section className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-700">Champs éditables</h3>
              <span className="text-xs text-gray-400">
                {enabledFields.size} / {detectedFields.length} champs activés
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Ces champs seront exposés aux utilisateurs dans le Studio de Publication.
            </p>

            {detectedFields.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Aucun champ éditable détecté dans ce template. Ajoutez des composants avec du contenu d'abord.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-3 text-gray-500 font-medium w-8"></th>
                    <th className="text-left py-2 pr-3 text-gray-500 font-medium">Label</th>
                    <th className="text-left py-2 pr-3 text-gray-500 font-medium">Type</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Groupe</th>
                  </tr>
                </thead>
                <tbody>
                  {detectedFields.map((field) => {
                    const key = `${field.nodeId}.${field.propKey}`;
                    const enabled = enabledFields.has(key);
                    return (
                      <tr
                        key={key}
                        onClick={() => toggleField(key)}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="py-2 pr-3">
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              enabled ? "bg-blue-600 border-blue-600" : "border-gray-300"
                            }`}
                          >
                            {enabled && <Check size={10} className="text-white" />}
                          </div>
                        </td>
                        <td className="py-2 pr-3 font-medium text-gray-900">{field.label}</td>
                        <td className="py-2 pr-3">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 text-[10px]">
                            {field.type}
                          </span>
                        </td>
                        <td className="py-2 text-gray-400">{field.group ?? "—"}</td>
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
