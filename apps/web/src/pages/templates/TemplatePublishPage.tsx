import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, MousePointerClick, RotateCcw, Send } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useEditorStore } from "@/store/editor-store";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { TemplateTitle } from "@/components/inspector/TemplateTitle";
import { PreviewPane } from "@/components/document-view/PreviewPane";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useWorkflowSession } from "@/workflow/session";
import { TEMPLATE_WORKFLOW } from "@/workflow/definitions";
import { get } from "@template-generator/component-registry/registry";
import { templateStatus } from "@template-generator/shared/utils/fields";
import { detectFields, reconcileFields, suggestedFields } from "@template-generator/shared/utils/field-detection";
import { FieldsEditor } from "./fields/FieldsEditor";
import { FormPreview } from "./fields/FormPreview";

type Tab = "fields" | "form" | "info";

/**
 * Étape 4 de l'Atelier : choisir ce qui sera remplissable dans le Studio, puis publier.
 * La liste des champs et le document sont reliés : survoler un champ montre sa zone,
 * cliquer sur une zone du document retrouve ses champs.
 */
export function TemplatePublishPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const session = useWorkflowSession();
  const template = useEditorStore((s) => s.template)!;
  const updateTemplateMeta = useEditorStore((s) => s.updateTemplateMeta);
  const setEditableFields = useEditorStore((s) => s.setEditableFields);
  const applyServerState = useEditorStore((s) => s.applyServerState);

  const [tab, setTab] = useState<Tab>("fields");
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showZones, setShowZones] = useState(true);
  const [pickMessage, setPickMessage] = useState<string | null>(null);

  const detected = useMemo(() => detectFields(template, (type) => get(type)), [template]);
  const { retained, excluded } = useMemo(
    () => reconcileFields(template.editableFields, detected),
    [template.editableFields, detected],
  );

  // Première visite d'un brouillon : la pré-sélection sert de point de départ
  useEffect(() => {
    if (template.editableFields.length === 0 && !template.published && detected.length > 0) {
      setEditableFields(suggestedFields(detected));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetToSuggestion = async () => {
    const ok = await confirm({
      title: "Revenir à la pré-sélection ?",
      message:
        "Les champs, libellés, groupes et champs obligatoires que vous avez définis seront remplacés par la proposition automatique.",
      confirmLabel: "Remplacer",
      tone: "danger",
    });
    if (ok) setEditableFields(suggestedFields(detected));
  };

  // Clic dans le document : le composant le plus proche qui a des contenus modifiables
  const handlePick = (e: React.MouseEvent) => {
    let el = e.target as HTMLElement | null;
    while (el) {
      const nodeId = el.dataset?.["nodeId"];
      if (nodeId && detected.some((f) => f.nodeId === nodeId)) {
        setSelectedNode(nodeId);
        setPickMessage(null);
        setTab("fields");
        return;
      }
      el = el.parentElement;
    }
    setSelectedNode(null);
    setPickMessage("Cette zone n'a pas de texte modifiable (décor, espacement…).");
  };

  const status = templateStatus(template);
  const nameMissing = template.name.trim().length === 0;

  const publish = async () => {
    await session?.flush();
    const result = await api.templates.publish(template.id, {
      editableFields: retained.map(({ location: _l, ...f }) => f),
    });
    applyServerState(result);
    queryClient.setQueryData(queryKeys.templates.detail(result.id), result);
    await queryClient.invalidateQueries({ queryKey: ["templates", "list"] });
    navigate("/templates");
  };

  const retainedNodeIds = useMemo(() => Array.from(new Set(retained.map((f) => f.nodeId))), [retained]);

  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: "fields", label: "Champs", badge: String(retained.length) },
    { key: "form", label: "Formulaire du Studio" },
    { key: "info", label: "Nom et description", badge: nameMissing ? "!" : undefined },
  ];

  return (
    <WorkflowLayout
      workflow={TEMPLATE_WORKFLOW}
      current="publish"
      entityId={template.id}
      title={<TemplateTitle />}
      finalAction={{
        label:
          status === "draft"
            ? "Publier dans le Studio"
            : status === "published-with-changes"
              ? "Publier les modifications"
              : "Republier",
        icon: <Send size={14} />,
        onClick: publish,
        disabled: nameMissing,
      }}
      guard={nameMissing ? { ok: false, reason: "Donnez un nom au template" } : undefined}
    >
      <div className="flex h-full overflow-hidden">
        <aside className="flex w-[460px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="flex shrink-0 gap-1 border-b border-gray-200 px-3 pt-2" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-xs font-medium ${
                  tab === t.key
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
                {t.badge && (
                  <span
                    className={`rounded-full px-1.5 text-[10px] ${t.badge === "!" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {status !== "draft" && tab === "fields" && (
              <p className="mb-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
                {status === "published-with-changes"
                  ? "Publié, mais vos modifications récentes ne sont pas encore visibles dans le Studio. Les documents existants ne changent pas."
                  : "Publié et à jour dans le Studio."}
              </p>
            )}

            {tab === "fields" && (
              <>
                <FieldsEditor
                  retained={retained}
                  excluded={excluded}
                  onChange={setEditableFields}
                  focusedNodeId={hoverNode ?? selectedNode}
                  onHoverNode={setHoverNode}
                  onSelectNode={setSelectedNode}
                />
                <button
                  onClick={resetToSuggestion}
                  className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-700"
                >
                  <RotateCcw size={12} />
                  Revenir à la pré-sélection automatique
                </button>
              </>
            )}

            {tab === "form" && <FormPreview fields={retained.map(({ location: _l, ...f }) => f)} />}

            {tab === "info" && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="tpl-name" className="mb-1 block text-xs font-medium text-gray-600">
                    Nom <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="tpl-name"
                    type="text"
                    value={template.name}
                    onChange={(e) => updateTemplateMeta(e.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    C'est ce nom que les contributeurs verront dans le Studio.
                  </p>
                </div>
                <div>
                  <label htmlFor="tpl-desc" className="mb-1 block text-xs font-medium text-gray-600">
                    Description
                  </label>
                  <textarea
                    id="tpl-desc"
                    value={template.description ?? ""}
                    onChange={(e) => updateTemplateMeta(template.name, e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-2 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500">
              <MousePointerClick size={13} />
              {pickMessage ?? "Cliquez sur une zone du document pour retrouver ses champs."}
            </span>
            <button
              onClick={() => setShowZones((v) => !v)}
              aria-pressed={showZones}
              className="ml-auto flex items-center gap-1.5 rounded px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              {showZones ? <EyeOff size={13} /> : <Eye size={13} />}
              {showZones ? "Masquer les zones retenues" : "Montrer les zones retenues"}
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <PreviewPane
              template={template}
              highlightNodeId={hoverNode ?? selectedNode}
              outlineNodeIds={showZones ? retainedNodeIds : undefined}
              pickable
              onBackgroundClick={handlePick}
            />
          </div>
        </div>
      </div>
    </WorkflowLayout>
  );
}
