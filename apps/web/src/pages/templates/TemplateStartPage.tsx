import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FilePlus2, LayoutTemplate, Loader2, Search, Sparkles, Upload } from "lucide-react";
import { WorkflowLayout } from "@/layouts/WorkflowLayout";
import { type TemplateSummary } from "@/api/client";
import { newTemplateDraft } from "@/store/editor-store";
import { DocumentThumbnail } from "@/components/document-view/DocumentView";
import { TemplatePreviewDialog } from "@/components/document-view/TemplatePreviewDialog";
import { TemplateStatusBadge } from "@/components/ui/StatusBadge";
import { BlueprintFrame } from "@/components/ui/ObjectIdentity";
import { TEMPLATE_WORKFLOW, TEMPLATE_PATHS } from "@/workflow/definitions";
import { useCreateTemplate, useDuplicateTemplate, useTemplate, useTemplates } from "@/api/hooks/templates";

/**
 * Étape 1 de l'Atelier. Le cas courant est de repartir du template du trimestre précédent :
 * la duplication est donc l'option principale ; page blanche, import et génération sont secondaires.
 */
export function TemplateStartPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState<string | null>(null);
  const [previewed, setPreviewed] = useState<TemplateSummary | null>(null);
  const [search, setSearch] = useState("");
  const { data: templates = [], isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const duplicateTemplate = useDuplicateTemplate();

  // Le template est créé tout de suite ; on remplace l'URL pour que « retour » ne relance pas une création
  const start = async (source: TemplateSummary | null) => {
    if (creating) return;
    setCreating(source?.id ?? "blank");
    try {
      const created = source
        ? await duplicateTemplate.mutateAsync(source.id)
        : await createTemplate.mutateAsync(newTemplateDraft());
      navigate(TEMPLATE_PATHS.theme(created.id), { replace: true });
    } catch {
      // Échec signalé par le message d'erreur global ; on peut choisir de nouveau
      setCreating(null);
    }
  };

  const query = search.trim().toLowerCase();
  const visible = query
    ? templates.filter((t) => `${t.name} ${t.description ?? ""}`.toLowerCase().includes(query))
    : templates;

  return (
    <WorkflowLayout
      workflow={TEMPLATE_WORKFLOW}
      current="start"
      title="Nouveau template"
      guard={{ ok: false, reason: "Choisissez un point de départ" }}
    >
      <div className="h-full overflow-y-auto bg-gray-50 px-8 py-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {(isLoading || templates.length > 0) && (
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-ink">Repartir d'un template existant</h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    La copie reprend le thème, la mise en page et les champs. Vous l'ajustez ensuite.
                  </p>
                </div>
                {templates.length > 6 && (
                  <label className="flex w-64 items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 focus-within:border-ink">
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

              {isLoading && <p className="text-sm text-gray-400">Chargement…</p>}
              {!isLoading && visible.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">
                  Aucun template ne correspond à « {search} ».{" "}
                  <button onClick={() => setSearch("")} className="text-blue-600 hover:underline">
                    Effacer la recherche
                  </button>
                </p>
              )}

              <div className="grid grid-cols-4 gap-4">
                {visible.map((t) => (
                  <div
                    key={t.id}
                    className={`group relative overflow-hidden border bg-white transition-colors ${
                      creating === t.id ? "border-tpl ring-2 ring-tpl/30" : "border-rule hover:border-tpl"
                    }`}
                  >
                    <button
                      onClick={() => start(t)}
                      disabled={creating !== null}
                      className="block w-full text-left disabled:cursor-wait"
                      aria-label={`Dupliquer ${t.name}`}
                    >
                      <BlueprintFrame className="flex justify-center px-4 pt-4">
                        {t.preview ? (
                          <div className="overflow-hidden outline-1 outline-offset-2 outline-dashed outline-white/80">
                            <DocumentThumbnail template={t.preview} width={180} cropHeight={170} />
                          </div>
                        ) : (
                          <div className="flex h-[170px] w-[180px] items-center justify-center bg-white">
                            <LayoutTemplate size={28} className="text-gray-200" />
                          </div>
                        )}
                      </BlueprintFrame>
                      <div className="p-3">
                        <div className="flex items-center gap-1.5">
                          <h3 className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-900">{t.name}</h3>
                          <TemplateStatusBadge template={t} />
                        </div>
                        <p className="mt-1 text-[11px] text-gray-400">
                          Modifié le{" "}
                          {new Date(t.updatedAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => setPreviewed(t)}
                      className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-gray-700 opacity-0 shadow-sm ring-1 ring-gray-200 transition-opacity hover:text-blue-700 focus:opacity-100 group-hover:opacity-100"
                    >
                      <Eye size={13} />
                      Aperçu
                    </button>
                    {creating === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/70 text-xs font-medium text-blue-700">
                        <Loader2 size={14} className="animate-spin" /> Copie en cours…
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              {templates.length > 0 ? "Ou partir d'autre chose" : "Créer votre premier template"}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => start(null)}
                disabled={creating !== null}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-400 hover:shadow-sm disabled:cursor-wait"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {creating === "blank" ? <Loader2 size={18} className="animate-spin" /> : <FilePlus2 size={18} />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">Page blanche</span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    Choisir un thème puis assembler les composants.
                  </span>
                </span>
              </button>
              <SoonOption
                icon={<Upload size={18} />}
                label="Importer un document Word"
                hint="Reprendre la structure d'un .docx"
              />
              <SoonOption
                icon={<Sparkles size={18} />}
                label="Générer à partir d'une description"
                hint="Décrire le document en quelques phrases"
              />
            </div>
          </section>
        </div>
      </div>

      {previewed && (
        <AtelierTemplatePreview
          template={previewed}
          creating={creating === previewed.id}
          onChoose={() => start(previewed)}
          onClose={() => setPreviewed(null)}
        />
      )}
    </WorkflowLayout>
  );
}

function SoonOption({ icon, label, hint }: { icon: React.ReactNode; label: string; hint: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-dashed border-gray-200 bg-white/60 p-4 text-left"
      aria-disabled="true"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        {icon}
      </span>
      <span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
          {label}
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">Bientôt</span>
        </span>
        <span className="mt-0.5 block text-xs text-gray-400">{hint}</span>
      </span>
    </div>
  );
}

function AtelierTemplatePreview({
  template,
  creating,
  onChoose,
  onClose,
}: {
  template: TemplateSummary;
  creating: boolean;
  onChoose: () => void;
  onClose: () => void;
}) {
  const { data: full } = useTemplate(template.id);
  return (
    <TemplatePreviewDialog
      title={template.name}
      subtitle={template.description ?? undefined}
      template={full ?? null}
      actionLabel="Dupliquer ce template"
      kind="tpl"
      onAction={onChoose}
      pending={creating}
      onClose={onClose}
    />
  );
}
