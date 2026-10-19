import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Trash2 } from "lucide-react";
import { api, type DocumentSummary } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { DocumentStatusBadge } from "@/components/ui/StatusBadge";

export function DocumentsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: queryKeys.documents.list(),
    queryFn: () => api.documents.list(),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.documents.duplicate(id),
    onSuccess: (doc) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.list() });
      navigate(`/documents/${doc.id}/fill`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.documents.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents.list() }),
  });

  const handleDelete = async (e: React.MouseEvent, doc: DocumentSummary) => {
    e.stopPropagation();
    const ok = await confirm({
      title: `Supprimer « ${doc.name} » ?`,
      consequences: [
        "Le contenu saisi sera définitivement perdu.",
        "Les PDF déjà exportés ne sont pas concernés.",
      ],
      confirmLabel: "Supprimer le document",
      tone: "danger",
    });
    if (ok) deleteMutation.mutate(doc.id);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Studio</h1>
          <p className="text-xs text-gray-500">Remplissez un template et exportez votre document en PDF.</p>
        </div>
        <button
          onClick={() => navigate("/documents/new")}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Nouveau document
        </button>
      </div>

      <div className="px-8 py-8">
        {isLoading && <p className="text-sm text-gray-400">Chargement...</p>}
        {error && <p className="text-sm text-red-500">Impossible de charger les documents.</p>}

        {!isLoading && !error && documents.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-gray-700">Aucun document pour l'instant</p>
            <p className="mb-4 mt-1 text-sm text-gray-500">Choisissez un template, remplissez-le, puis exportez-le en PDF.</p>
            <button
              onClick={() => navigate("/documents/new")}
              className="rounded bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Créer mon premier document
            </button>
          </div>
        )}

        <div className="grid max-w-5xl grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/documents/${doc.id}`)}
              className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-gray-900">{doc.name}</h3>
                    <DocumentStatusBadge document={doc} />
                  </div>
                  {doc.templateName && <p className="truncate text-xs text-gray-500">{doc.templateName}</p>}
                  {doc.status === "draft" && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${doc.completionPercent}%` }} />
                      </div>
                      <span className="shrink-0 text-[11px] text-gray-400">{doc.completionPercent}%</span>
                    </div>
                  )}
                </div>
                <div className="ml-2 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate(doc.id); }}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                    title="Dupliquer pour une nouvelle édition"
                    aria-label={`Dupliquer ${doc.name}`}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, doc)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Supprimer"
                    aria-label={`Supprimer ${doc.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Modifié le {new Date(doc.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
