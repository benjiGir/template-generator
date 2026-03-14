import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { LayoutTemplate, Puzzle, FileText } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { TemplateThumbnail } from "@/components/shared/TemplateThumbnail";

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: templateSummaries = [] } = useQuery({
    queryKey: queryKeys.templates.list(),
    queryFn: () => api.templates.list(),
    select: (list) => list.slice(0, 6),
  });

  const { data: recentDocuments = [] } = useQuery({
    queryKey: queryKeys.documents.list(),
    queryFn: () => api.documents.list(),
    select: (list) => list.slice(0, 6),
  });

  const templateDetailQueries = useQueries({
    queries: templateSummaries.map((t) => ({
      queryKey: queryKeys.templates.detail(t.id),
      queryFn: (): Promise<import("@template-generator/shared/types/template").Template> =>
        api.templates.get(t.id),
    })),
  });

  const recentTemplates = templateDetailQueries.flatMap((q) => (q.data ? [q.data] : []));

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
            <div className="grid grid-cols-3 gap-3">
              {recentDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/documents/${doc.id}/fill`)}
                  className="text-left bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900 truncate flex-1">{doc.name}</span>
                    <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      doc.status === "finalized"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {doc.status === "finalized" ? "Finalisé" : "Brouillon"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${doc.completionPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{doc.completionPercent}%</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {new Date(doc.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </button>
              ))}
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
                const fullTemplate = recentTemplates.find((t) => t.id === summary.id);
                return (
                  <button
                    key={summary.id}
                    onClick={() => navigate(`/templates/${summary.id}/edit`)}
                    className="text-left bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden"
                  >
                    <div className="w-full overflow-hidden border-b border-gray-100 bg-gray-50">
                      {fullTemplate ? (
                        <TemplateThumbnail template={fullTemplate} width={220} />
                      ) : (
                        <div className="aspect-[210/297] flex items-center justify-center">
                          <LayoutTemplate size={24} className="text-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-900 truncate flex-1">{summary.name}</p>
                      {summary.published && (
                        <span className="shrink-0 text-[9px] font-medium px-1 py-0.5 rounded bg-green-100 text-green-700">
                          Publié
                        </span>
                      )}
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
