import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api, type DocumentSummary } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { DocumentCard } from "@/components/document/DocumentCard";
import { documentDisplayStatus } from "@template-generator/shared/utils/fields";
import type { DocumentDisplayStatus } from "@template-generator/shared/types/document";

type StatusFilter = "all" | DocumentDisplayStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all",                   label: "Tous" },
  { value: "draft",                 label: "Brouillons" },
  { value: "finalized",             label: "Finalisés" },
  { value: "modified-after-export", label: "Modifiés depuis l'export" },
];

export function DocumentsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [template, setTemplate] = useState<string>("all");

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

  const handleDelete = async (doc: DocumentSummary) => {
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

  const templateNames = Array.from(new Set(documents.map((d) => d.templateName).filter((n): n is string => !!n))).sort();
  const counts = new Map<StatusFilter, number>([["all", documents.length]]);
  for (const d of documents) {
    const s = documentDisplayStatus(d);
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }

  const query = search.trim().toLowerCase();
  const filtered = documents.filter(
    (d) =>
      (status === "all" || documentDisplayStatus(d) === status) &&
      (template === "all" || d.templateName === template) &&
      (!query || `${d.name} ${d.templateName ?? ""}`.toLowerCase().includes(query))
  );
  const filtersActive = status !== "all" || template !== "all" || query !== "";

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

      {documents.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-white px-8 py-2.5">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5" role="group" aria-label="Filtrer par statut">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                aria-pressed={status === f.value}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  status === f.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {f.label} <span className="text-gray-400">{counts.get(f.value) ?? 0}</span>
              </button>
            ))}
          </div>
          {templateNames.length > 1 && (
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              aria-label="Filtrer par template"
              className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-blue-400 focus:outline-none"
            >
              <option value="all">Tous les templates</option>
              {templateNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          )}
          <label className="ml-auto flex w-64 items-center gap-2 rounded-md border border-gray-200 px-2.5 py-1.5 focus-within:border-blue-400">
            <Search size={14} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un document…"
              className="min-w-0 flex-1 text-xs focus:outline-none"
            />
          </label>
        </div>
      )}

      <div className="px-8 py-6">
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

        {documents.length > 0 && filtered.length === 0 && filtersActive && (
          <p className="py-16 text-center text-sm text-gray-500">
            Aucun document ne correspond à ces filtres.{" "}
            <button
              onClick={() => { setSearch(""); setStatus("all"); setTemplate("all"); }}
              className="text-blue-600 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </p>
        )}

        <div className="grid max-w-6xl grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onDuplicate={(d) => duplicateMutation.mutate(d.id)} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}
