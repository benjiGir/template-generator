import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { duplicateTemplate } from "@/store/templates-store";

export function TemplatesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: queryKeys.templates.list(),
    queryFn: () => api.templates.list(),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates.list() }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.templates.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates.list() }),
  });

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    duplicateMutation.mutate(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce template ?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Atelier Templates</h1>
        <button
          onClick={() => navigate("/templates/new")}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          + Nouveau template
        </button>
      </div>

      <div className="px-8 py-8">
        {isLoading && <p className="text-sm text-gray-400">Chargement...</p>}
        {error && <p className="text-sm text-red-500">Erreur : {String(error)}</p>}

        {!isLoading && templates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">Aucun template. Créez-en un pour commencer.</p>
            <button
              onClick={() => navigate("/templates/new")}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Créer mon premier template
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 max-w-5xl">
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/templates/${t.id}/edit`)}
              className="bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group overflow-hidden"
            >
              <div className="w-full aspect-[210/297] bg-gray-50 flex items-center justify-center border-b border-gray-100">
                <LayoutTemplate size={32} className="text-gray-200" />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h3>
                      {t.published && (
                        <span className="shrink-0 text-[9px] font-medium px-1 py-0.5 rounded bg-green-100 text-green-700">
                          Publié
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.description}</p>
                    )}
                  </div>
                  <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => handleDuplicate(e, t.id)}
                      className="text-gray-400 hover:text-blue-500 text-xs p-1"
                      title="Dupliquer"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, t.id)}
                      className="text-gray-400 hover:text-red-500 text-xs p-1"
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(t.updatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
