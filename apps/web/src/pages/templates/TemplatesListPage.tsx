import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTemplatesStore } from "@/store/templates-store";

export function TemplatesListPage() {
  const { templates, loading, error, fetchTemplates, duplicateTemplate, deleteTemplate } =
    useTemplatesStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreate = () => {
    navigate("/templates/new");
  };

  const handleOpen = (id: string) => {
    navigate(`/templates/${id}/edit`);
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await duplicateTemplate(id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce template ?")) return;
    await deleteTemplate(id);
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Atelier Templates</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          + Nouveau template
        </button>
      </div>

      {/* Contenu */}
      <div className="px-8 py-8">
        {loading && <p className="text-sm text-gray-400">Chargement...</p>}

        {error && <p className="text-sm text-red-500">Erreur : {error}</p>}

        {!loading && templates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">Aucun template. Créez-en un pour commencer.</p>
            <button
              onClick={handleCreate}
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
              onClick={() => handleOpen(t.id)}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{t.name}</h3>
                  {t.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                  )}
                </div>
                <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <p className="text-xs text-gray-400 mt-3">
                {new Date(t.updatedAt).toLocaleDateString("fr-FR", {
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
