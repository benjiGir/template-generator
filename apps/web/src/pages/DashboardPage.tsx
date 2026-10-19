import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate, Puzzle, FileText } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { DocumentThumbnail } from "@/components/document-view/DocumentView";
import { TemplateStatusBadge } from "@/components/ui/StatusBadge";
import { DocumentCard } from "@/components/document/DocumentCard";

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: templateSummaries = [] } = useQuery({
    queryKey: queryKeys.templates.list(),
    queryFn: () => api.templates.list(),
    select: (list) => list.slice(0, 4),
  });

  // Le dashboard est un point de reprise : les brouillons d'abord, puis les plus récents
  const { data: recentDocuments = [] } = useQuery({
    queryKey: queryKeys.documents.list(),
    queryFn: () => api.documents.list(),
    select: (list) => [...list].sort((a, b) => Number(b.status === "draft") - Number(a.status === "draft")).slice(0, 6),
  });

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">

        {/* Section 1 — Actions rapides */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Actions rapides</h2>
          <div className="grid grid-cols-3 gap-4">
            <ActionCard
              icon={<LayoutTemplate size={20} />}
              title="Créer un template"
              description="Construisez la structure et le style d'un nouveau template."
              action="Nouveau template"
              to="/templates/new"
            />
            <ActionCard
              icon={<Puzzle size={20} />}
              title="Créer un preset"
              description="Configurez un composant réutilisable et sauvegardez-le."
              action="Nouveau preset"
              to="/components/new"
            />
            <ActionCard
              icon={<FileText size={20} />}
              title="Nouveau document"
              description="Choisissez un template publié et remplissez vos données."
              action="Nouveau document"
              to="/documents/new"
            />
          </div>
        </section>

        {/* Section 2 — Documents récents */}
        {recentDocuments.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Documents récents</h2>
              <Link to="/documents" className="text-xs text-blue-600 hover:underline">Voir tous</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {recentDocuments.map((doc) => <DocumentCard key={doc.id} doc={doc} compact />)}
            </div>
          </section>
        )}

        {/* Section 3 — Templates récents */}
        {templateSummaries.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Templates récents</h2>
              <Link to="/templates" className="text-xs text-blue-600 hover:underline">Voir tous</Link>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {templateSummaries.map((summary) => {
                return (
                  <button
                    key={summary.id}
                    onClick={() => navigate(`/templates/${summary.id}/build`)}
                    className="text-left bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden"
                  >
                    <div className="w-full overflow-hidden border-b border-gray-100 bg-gray-50">
                      {summary.preview ? (
                        <DocumentThumbnail template={summary.preview} width={220} />
                      ) : (
                        <div className="aspect-[210/297] flex items-center justify-center">
                          <LayoutTemplate size={24} className="text-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-900 truncate flex-1">{summary.name}</p>
                      <TemplateStatusBadge template={summary} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {templateSummaries.length === 0 && recentDocuments.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Aucun contenu pour l'instant. Commencez par créer un template.</p>
          </div>
        )}

      </div>
    </div>
  );
}

function ActionCard({
  icon, title, description, action, to,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  to: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <Link
        to={to}
        className="self-start px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        {action}
      </Link>
    </div>
  );
}
