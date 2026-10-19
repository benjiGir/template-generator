import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Eye, LayoutTemplate, Loader2, Search, X } from "lucide-react";
import { api, type TemplateSummary } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { DocumentThumbnail } from "@/components/document-view/DocumentView";
import { PreviewPane } from "@/components/document-view/PreviewPane";
import { DOCUMENT_WORKFLOW } from "@/workflow/definitions";

/** L'effort se lit en taille de formulaire plutôt qu'en nombre brut */
function effortOf(t: TemplateSummary) {
  const fields = t.editableFields ?? [];
  const required = fields.filter((f) => f.required).length;
  const size = fields.length <= 8 ? "Court" : fields.length <= 20 ? "Moyen" : "Long";
  return { total: fields.length, required, size };
}

export function DocumentSelectPage() {
  const navigate = useNavigate();
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [previewed, setPreviewed] = useState<TemplateSummary | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: queryKeys.templates.list({ published: true }),
    queryFn: () => api.templates.list({ published: true }),
  });

  // Choisir un template crée le document ; on remplace l'URL pour ne pas recréer au retour
  const choose = async (template: TemplateSummary) => {
    if (creatingId) return;
    setCreatingId(template.id);
    setError(null);
    try {
      const doc = await api.documents.create({ templateId: template.id });
      navigate(DOCUMENT_WORKFLOW.steps[1]!.path(doc.id), { replace: true });
    } catch (e) {
      console.error("Erreur création document:", e);
      setError("La création du document a échoué. Réessayez.");
      setCreatingId(null);
    }
  };

  const query = search.trim().toLowerCase();
  const visible = query
    ? templates.filter((t) => `${t.name} ${t.description ?? ""}`.toLowerCase().includes(query))
    : templates;

  return (
    <WorkflowLayout
      workflow={DOCUMENT_WORKFLOW}
      current="select"
      title="Nouveau document"
      guard={{ ok: false, reason: "Cliquez sur un template pour commencer" }}
    >
      <div className="h-full overflow-y-auto bg-gray-50 px-8 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Quel document voulez-vous produire ?</h2>
              <p className="mt-0.5 text-sm text-gray-500">Le document reprend la mise en page du template ; vous n'aurez qu'à remplir le contenu.</p>
            </div>
            {templates.length > 6 && (
              <label className="flex w-64 items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 focus-within:border-blue-400">
                <Search size={14} className="text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un template…"
                  className="min-w-0 flex-1 text-sm focus:outline-none"
                />
              </label>
            )}
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-gray-400">Chargement...</p>}

          {!isLoading && templates.length === 0 && (
            <div className="mx-auto max-w-md py-16 text-center">
              <p className="text-sm font-medium text-gray-700">Aucun template n'est encore publié</p>
              <p className="mt-1 text-sm text-gray-500">
                Un document part toujours d'un template publié. Le concepteur des templates doit en publier un
                depuis l'Atelier pour qu'il apparaisse ici.
              </p>
              <button onClick={() => navigate("/templates")} className="mt-3 text-sm text-blue-600 hover:underline">
                Ouvrir l'Atelier
              </button>
            </div>
          )}

          {!isLoading && templates.length > 0 && visible.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-500">
              Aucun template ne correspond à « {search} ».{" "}
              <button onClick={() => setSearch("")} className="text-blue-600 hover:underline">Effacer la recherche</button>
            </p>
          )}

          <div className="grid grid-cols-3 gap-5">
            {visible.map((t) => {
              const effort = effortOf(t);
              const creating = creatingId === t.id;
              return (
                <div
                  key={t.id}
                  className={`group relative overflow-hidden rounded-xl border bg-white transition-all ${
                    creating ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-400 hover:shadow-md"
                  }`}
                >
                  <button
                    onClick={() => choose(t)}
                    disabled={creatingId !== null}
                    className="block w-full text-left disabled:cursor-wait"
                    aria-label={`Créer un document à partir de ${t.name}`}
                  >
                    <div className="flex justify-center border-b border-gray-100 bg-slate-100 px-6 pt-5">
                      {t.preview ? (
                        <div className="overflow-hidden rounded-t shadow-sm">
                          <DocumentThumbnail template={t.preview} width={220} cropHeight={230} />
                        </div>
                      ) : (
                        <div className="flex h-[230px] w-[220px] items-center justify-center bg-white">
                          <LayoutTemplate size={32} className="text-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="truncate text-sm font-semibold text-gray-900">{t.name}</h3>
                      {t.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{t.description}</p>}
                      <p className="mt-3 text-xs text-gray-500">
                        <span className="mr-1.5 rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700">{effort.size}</span>
                        {effort.total} champ{effort.total > 1 ? "s" : ""} à remplir
                        {effort.required > 0 && `, dont ${effort.required} obligatoire${effort.required > 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPreviewed(t)}
                    className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-gray-700 opacity-0 shadow-sm ring-1 ring-gray-200 transition-opacity hover:text-blue-700 focus:opacity-100 group-hover:opacity-100"
                  >
                    <Eye size={13} />
                    Aperçu
                  </button>

                  {creating && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/70 text-sm font-medium text-blue-700">
                      <Loader2 size={16} className="animate-spin" />
                      Création du document…
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {previewed && (
        <TemplatePreviewDialog
          template={previewed}
          onClose={() => setPreviewed(null)}
          onChoose={() => choose(previewed)}
          creating={creatingId === previewed.id}
        />
      )}
    </WorkflowLayout>
  );
}

function TemplatePreviewDialog({
  template,
  onClose,
  onChoose,
  creating,
}: {
  template: TemplateSummary;
  onClose: () => void;
  onChoose: () => void;
  creating: boolean;
}) {
  // La liste ne contient que la première page : on charge la version publiée complète
  const { data: full } = useQuery({
    queryKey: queryKeys.templates.detail(template.id),
    queryFn: () => api.templates.get(template.id),
  });
  const version = full?.publishedVersion ?? template.preview;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const effort = effortOf(template);

  return (
    <div className="fixed inset-0 z-[900] flex bg-slate-900/50 p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Aperçu de ${template.name}`}
        className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 border-b border-gray-200 px-5 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-gray-900">{template.name}</h2>
            <p className="text-xs text-gray-500">
              {effort.total} champ{effort.total > 1 ? "s" : ""} à remplir
              {effort.required > 0 && `, dont ${effort.required} obligatoire${effort.required > 1 ? "s" : ""}`} · contenu d'exemple du template
            </p>
          </div>
          <button
            onClick={onChoose}
            disabled={creating}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {creating && <Loader2 size={14} className="animate-spin" />}
            Utiliser ce template
          </button>
          <button onClick={onClose} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1">{version && <PreviewPane template={version} />}</div>
      </div>
    </div>
  );
}
