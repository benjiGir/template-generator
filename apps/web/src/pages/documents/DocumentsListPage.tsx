import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import type { DocumentSummary } from "@/api/client";
import { useDeleteDocument, useDocuments, useDuplicateDocument } from "@/api/hooks/documents";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { DocumentCard } from "@/components/document/DocumentCard";
import { SpaceHeader } from "@/components/ui/SpaceHeader";
import { Button } from "@/components/ui/Button";
import { documentDisplayStatus } from "@template-generator/shared/utils/fields";
import type { DocumentDisplayStatus } from "@template-generator/shared/types/document";

type StatusFilter = "all" | DocumentDisplayStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillons" },
  { value: "finalized", label: "Finalisés" },
  { value: "modified-after-export", label: "Modifiés depuis l'export" },
];

export function DocumentsListPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [template, setTemplate] = useState<string>("all");

  const { data: documents = [], isLoading, error } = useDocuments();
  const duplicateMutation = useDuplicateDocument();
  const deleteMutation = useDeleteDocument();

  const handleDelete = async (doc: DocumentSummary) => {
    const ok = await confirm({
      title: `Supprimer « ${doc.name} » ?`,
      consequences: ["Le contenu saisi sera définitivement perdu.", "Les PDF déjà exportés ne sont pas concernés."],
      confirmLabel: "Supprimer le document",
      tone: "danger",
    });
    if (ok) deleteMutation.mutate(doc.id);
  };

  const templateNames = Array.from(
    new Set(documents.map((d) => d.templateName).filter((n): n is string => !!n)),
  ).toSorted();
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
      (!query || `${d.name} ${d.templateName ?? ""}`.toLowerCase().includes(query)),
  );
  const filtersActive = status !== "all" || template !== "all" || query !== "";

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <SpaceHeader
        kind="doc"
        tag="Documents"
        title="Studio"
        subtitle="Remplissez un template et exportez votre document en PDF."
        action={
          <Button variant="primary" tone="doc" size="lg" onClick={() => navigate("/documents/new")}>
            Nouveau document
          </Button>
        }
      />

      {documents.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-rule px-8 py-3">
          <div className="flex flex-wrap items-center gap-5" role="group" aria-label="Filtrer par statut">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                aria-pressed={status === f.value}
                className={`border-b-2 py-1 text-[13px] transition-colors ${
                  status === f.value
                    ? "border-ink font-semibold text-ink"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {f.label}{" "}
                <span className="font-mono text-[11px] font-normal text-ink-soft">{counts.get(f.value) ?? 0}</span>
              </button>
            ))}
          </div>
          {templateNames.length > 1 && (
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              aria-label="Filtrer par template"
              className="rounded-md border border-rule bg-white px-2 py-1.5 text-xs text-ink-soft focus:border-ink focus:outline-none"
            >
              <option value="all">Tous les templates</option>
              {templateNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
          <label className="ml-auto flex w-64 items-center gap-2 rounded-md border border-rule px-2.5 py-1.5 focus-within:border-ink">
            <Search size={14} className="text-ink-faint" />
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
        {isLoading && <p className="text-sm text-ink-faint">Chargement...</p>}
        {error && <p className="text-sm text-danger">Impossible de charger les documents.</p>}

        {!isLoading && !error && documents.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-ink-soft">Aucun document pour l'instant</p>
            <p className="mb-4 mt-1 text-sm text-ink-subtle">
              Choisissez un template, remplissez-le, puis exportez-le en PDF.
            </p>
            <Button variant="primary" tone="doc" size="lg" onClick={() => navigate("/documents/new")}>
              Créer mon premier document
            </Button>
          </div>
        )}

        {documents.length > 0 && filtered.length === 0 && filtersActive && (
          <p className="py-16 text-center text-sm text-ink-subtle">
            Aucun document ne correspond à ces filtres.{" "}
            <Button
              variant="link"
              tone="doc"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setTemplate("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </p>
        )}

        <div className="grid max-w-6xl grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDuplicate={(d) =>
                duplicateMutation.mutate(d.id, { onSuccess: (copy) => navigate(`/documents/${copy.id}/fill`) })
              }
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
