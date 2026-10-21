import { useNavigate } from "react-router-dom";
import { Copy, LayoutTemplate, Trash2 } from "lucide-react";
import type { TemplateSummary } from "@/api/client";
import { useDeleteTemplate, useDuplicateTemplate, useTemplates } from "@/api/hooks/templates";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { TemplateStatusBadge } from "@/components/ui/StatusBadge";
import { BlueprintFrame } from "@/components/ui/ObjectIdentity";
import { CreateButton, SpaceHeader } from "@/components/ui/SpaceHeader";
import { DocumentThumbnail } from "@/components/document-view/DocumentView";

export function TemplatesListPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: templates = [], isLoading, error } = useTemplates();
  const duplicateMutation = useDuplicateTemplate();
  const deleteMutation = useDeleteTemplate();

  const handleDelete = async (e: React.MouseEvent, t: TemplateSummary) => {
    e.stopPropagation();
    const consequences = [
      t.published
        ? "Il ne sera plus proposé dans le Studio : plus aucun document ne pourra être créé à partir de lui."
        : "Ce brouillon n'a jamais été publié.",
    ];
    if (t.documentCount > 0) {
      consequences.push(
        `${t.documentCount} document${t.documentCount > 1 ? "s ont" : " a"} été créé${t.documentCount > 1 ? "s" : ""} à partir de ce template. ${
          t.documentCount > 1 ? "Ils restent" : "Il reste"
        } consultable${t.documentCount > 1 ? "s" : ""}, modifiable${t.documentCount > 1 ? "s" : ""} et exportable${t.documentCount > 1 ? "s" : ""}.`,
      );
    }
    consequences.push("Cette action est irréversible.");
    const ok = await confirm({
      title: `Supprimer le template « ${t.name} » ?`,
      consequences,
      confirmLabel: "Supprimer le template",
      tone: "danger",
    });
    if (ok) deleteMutation.mutate(t.id);
  };

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <SpaceHeader
        kind="tpl"
        tag="Templates"
        title="Atelier"
        subtitle="Dessinez les templates que le Studio utilisera pour produire les documents."
        action={
          <CreateButton kind="tpl" onClick={() => navigate("/templates/new")}>
            Nouveau template
          </CreateButton>
        }
      />

      <div className="px-8 py-8">
        {isLoading && <p className="text-sm text-gray-400">Chargement...</p>}
        {error && <p className="text-sm text-red-500">Impossible de charger les templates.</p>}

        {!isLoading && !error && templates.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-gray-700">Aucun template pour l'instant</p>
            <p className="mb-4 mt-1 text-sm text-gray-500">
              Un template définit la mise en page d'un type de document ; le Studio le remplit à chaque édition.
            </p>
            <button
              onClick={() => navigate("/templates/new")}
              className="rounded bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Créer mon premier template
            </button>
          </div>
        )}

        <div className="grid max-w-5xl grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/templates/${t.id}/build`)}
              className="group cursor-pointer overflow-hidden border border-rule bg-white transition-colors hover:border-tpl"
            >
              <BlueprintFrame className="flex h-[200px] w-full justify-center overflow-hidden px-5 pt-4">
                {t.preview ? (
                  <div className="overflow-hidden outline-1 outline-offset-2 outline-dashed outline-white/80">
                    <DocumentThumbnail template={t.preview} width={240} cropHeight={184} />
                  </div>
                ) : (
                  <LayoutTemplate size={32} className="mt-16 text-white/60" />
                )}
              </BlueprintFrame>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-ink">{t.name}</h3>
                    <div className="mt-0.5">
                      <TemplateStatusBadge template={t} />
                    </div>
                    {t.description && <p className="mt-1 line-clamp-1 text-xs text-gray-500">{t.description}</p>}
                  </div>
                  <div className="ml-2 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateMutation.mutate(t.id);
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      title="Dupliquer"
                      aria-label={`Dupliquer ${t.name}`}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, t)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Supprimer"
                      aria-label={`Supprimer ${t.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Modifié le{" "}
                  {new Date(t.updatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {t.documentCount > 0 && ` · ${t.documentCount} document${t.documentCount > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
