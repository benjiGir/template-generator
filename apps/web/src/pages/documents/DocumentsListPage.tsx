import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";

export function DocumentsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: queryKeys.documents.list(),
    queryFn: () => api.documents.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.documents.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents.list() }),
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce document ?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Studio de Publication</h1>
        <button
          onClick={() => navigate("/documents/new")}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          + Nouveau document
        </button>
      </div>

      <div className="px-8 py-8">
        {isLoading && <p className="text-sm text-gray-400">Chargement...</p>}

        {!isLoading && documents.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">Aucun document. Commencez par choisir un template publié.</p>
            <button
              onClick={() => navigate("/documents/new")}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Créer mon premier document
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 max-w-5xl">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/documents/${doc.id}/fill`)}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{doc.name}</h3>
                    <span
                      className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        doc.status === "finalized"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {doc.status === "finalized" ? "Finalisé" : "Brouillon"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${doc.completionPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">{doc.completionPercent}%</span>
                  </div>
                </div>
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="text-gray-400 hover:text-red-500 text-xs p-1"
                    title="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(doc.updatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
