import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, LayoutTemplate, Trash2 } from "lucide-react";
import { api, type TemplateSummary } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { TemplateStatusBadge } from "@/components/ui/StatusBadge";
import { DocumentThumbnail } from "@/components/document-view/DocumentView";

export function TemplatesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: queryKeys.templates.list(),
    queryFn: () => api.templates.list(),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.templates.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates", "list"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.templates.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates", "list"] }),
  });

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
        } consultable${t.documentCount > 1 ? "s" : ""}, modifiable${t.documentCount > 1 ? "s" : ""} et exportable${t.documentCount > 1 ? "s" : ""}.`
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
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Atelier</h1>
          <p className="text-xs text-gray-500">Concevez les templates que le Studio utilisera pour produire les documents.</p>
        </div>
        <button
          onClick={() => navigate("/templates/new")}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Nouveau template
        </button>
      </div>

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
              className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex h-[200px] w-full justify-center overflow-hidden border-b border-gray-100 bg-slate-100 px-5 pt-4">
                {t.preview ? (
                  <div className="overflow-hidden rounded-t shadow-sm">
                    <DocumentThumbnail template={t.preview} width={240} cropHeight={184} />
                  </div>
                ) : (
                  <LayoutTemplate size={32} className="mt-16 text-gray-200" />
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-sm font-semibold text-gray-900">{t.name}</h3>
                      <TemplateStatusBadge template={t} />
                    </div>
                    {t.description && <p className="mt-1 line-clamp-1 text-xs text-gray-500">{t.description}</p>}
                  </div>
                  <div className="ml-2 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate(t.id); }}
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
                  Modifié le {new Date(t.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
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
