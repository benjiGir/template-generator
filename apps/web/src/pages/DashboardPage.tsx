import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, type DocumentSummary, type TemplateSummary } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { DocumentThumbnail } from "@/components/document-view/DocumentView";
import { GettingStarted } from "@/components/ui/GettingStarted";
import { BlueprintGlyph, ObjectTag, TemplateRef } from "@/components/ui/ObjectIdentity";
import { DocumentStatusBadge } from "@/components/ui/StatusBadge";
import { SegmentedProgress } from "@/components/ui/SegmentedProgress";
import { mergeDocumentData, templateStatus } from "@template-generator/shared/utils/fields";
import type { Template } from "@template-generator/shared/types/template";

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).toUpperCase();
}

/** Première page du document avec ses données */
function previewOf(doc: DocumentSummary): Pick<Template, "theme" | "pageFormat" | "pages"> | null {
  const p = doc.preview;
  if (!p?.theme || !p.pageFormat || !p.pages?.length) return null;
  return mergeDocumentData({ ...p, editableFields: p.editableFields ?? [] } as Template, doc.data ?? {});
}

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: allTemplates = [], isSuccess: templatesLoaded } = useQuery({
    queryKey: queryKeys.templates.list(),
    queryFn: () => api.templates.list(),
  });
  const { data: allDocuments = [], isSuccess: documentsLoaded } = useQuery({
    queryKey: queryKeys.documents.list(),
    queryFn: () => api.documents.list(),
  });

  // Le dashboard est un point de reprise : les brouillons d'abord
  const drafts = allDocuments.filter((d) => d.status === "draft").slice(0, 5);
  const exported = allDocuments.filter((d) => d.status === "finalized").slice(0, 3);
  const templates = allTemplates.slice(0, 5);

  const createFrom = useMutation({
    mutationFn: (templateId: string) => api.documents.create({ templateId }),
    onSuccess: (doc) => navigate(`/documents/${doc.id}/fill`),
  });
  const duplicate = useMutation({
    mutationFn: (id: string) => api.documents.duplicate(id),
    onSuccess: (doc) => navigate(`/documents/${doc.id}/fill`),
  });

  const today = useMemo(
    () =>
      new Date()
        .toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        .toUpperCase(),
    [],
  );

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-9 px-14 py-10">
        {templatesLoaded && documentsLoaded && (
          <GettingStarted templates={allTemplates} documentCount={allDocuments.length} />
        )}

        <header className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-ink pb-6">
          <div>
            <div className="font-mono text-xs tracking-[0.06em] text-gray-500">{today}</div>
            <h1 className="mt-1.5 text-[32px] font-bold leading-tight tracking-tight">Reprendre le travail</h1>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/documents/new"
              data-tour="action-document"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-sm bg-doc px-4 font-semibold text-white hover:brightness-95"
            >
              <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="12" height="14" />
                <path d="M4 5h6M4 8h6M4 11h4" />
              </svg>
              Nouveau document
            </Link>
            <Link
              to="/templates/new"
              data-tour="action-template"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-sm bg-tpl px-4 font-semibold text-white hover:brightness-95"
            >
              <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="12" height="14" strokeDasharray="2 2" />
                <path d="M4 5h6M4 9h6" />
              </svg>
              Nouveau template
            </Link>
          </div>
        </header>

        <div className="flex flex-wrap items-start gap-10">
          <section aria-labelledby="dash-docs" className="flex min-w-0 flex-[999_1_560px] flex-col gap-8">
            <div className="flex items-center gap-3">
              <ObjectTag kind="doc">Documents</ObjectTag>
              <h2 id="dash-docs" className="text-sm text-gray-700">
                Ce que vous remplissez et exportez en PDF
              </h2>
            </div>

            <div data-tour="recent-documents">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <h3 className="text-base font-semibold">
                  En cours{" "}
                  <span className="font-mono text-xs font-normal text-gray-500">
                    {drafts.length} brouillon{drafts.length > 1 ? "s" : ""}
                  </span>
                </h3>
                <Link to="/documents" className="text-[13px] underline-offset-2 hover:underline">
                  Tous les documents
                </Link>
              </div>
              {documentsLoaded && drafts.length === 0 ? (
                <p className="border-t border-rule py-4 text-sm text-gray-600">Aucun brouillon en cours.</p>
              ) : (
                <ul>
                  {drafts.map((d) => (
                    <DocumentRow key={d.id} doc={d}>
                      <div>
                        <SegmentedProgress filled={d.completionPercent} total={100} />
                        <div className="mt-1 font-mono text-[11px] text-gray-700">
                          {d.completionPercent} % rempli · {shortDate(d.updatedAt)}
                        </div>
                      </div>
                      <Link
                        to={`/documents/${d.id}`}
                        className="justify-self-end text-[13px] font-semibold text-doc-strong hover:underline"
                      >
                        Reprendre →
                      </Link>
                    </DocumentRow>
                  ))}
                </ul>
              )}
            </div>

            {exported.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold">Exportés récemment</h3>
                  <span className="text-[13px] text-gray-500">Pour l'édition suivante, dupliquez le précédent.</span>
                </div>
                <ul>
                  {exported.map((d) => (
                    <DocumentRow key={d.id} doc={d}>
                      <span className="flex items-center gap-2">
                        <DocumentStatusBadge document={d} />
                        <span className="font-mono text-[11px] text-gray-500">{shortDate(d.updatedAt)}</span>
                      </span>
                      <button
                        onClick={() => duplicate.mutate(d.id)}
                        disabled={duplicate.isPending}
                        className="justify-self-end text-[13px] font-semibold text-doc-strong hover:underline disabled:opacity-50"
                      >
                        Dupliquer →
                      </button>
                    </DocumentRow>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <aside aria-labelledby="dash-tpls" className="min-w-0 flex-[1_1_300px] border border-tpl bg-tpl-tint p-5">
            <div className="mb-3.5 flex flex-col gap-1.5">
              <span className="self-start">
                <ObjectTag kind="tpl">Templates</ObjectTag>
              </span>
              <h2 id="dash-tpls" className="text-sm text-gray-800">
                Les modèles : mise en page fixe, champs à remplir. Chaque document part de l'un d'eux.
              </h2>
            </div>
            {templatesLoaded && templates.length === 0 ? (
              <p className="border-t border-tpl-rule py-4 text-sm text-gray-700">Aucun template pour l'instant.</p>
            ) : (
              <ul>
                {templates.map((t) => (
                  <TemplateRow
                    key={t.id}
                    template={t}
                    onCreate={() => createFrom.mutate(t.id)}
                    creating={createFrom.isPending}
                  />
                ))}
              </ul>
            )}
            <Link to="/templates" className="mt-3 inline-block text-[13px] font-semibold text-tpl hover:underline">
              Dessiner ou modifier dans l'Atelier →
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

/** Une ligne de document : miniature (feuille à ombre orange), nom, template d'origine, puis le contenu propre à la liste */
function DocumentRow({ doc, children }: { doc: DocumentSummary; children: React.ReactNode }) {
  const preview = previewOf(doc);
  return (
    <li className="grid grid-cols-[48px_minmax(0,1fr)_170px_110px] items-center gap-4 border-t border-rule py-3">
      <Link
        to={`/documents/${doc.id}`}
        aria-label={`Ouvrir ${doc.name}`}
        className="block h-[54px] w-10 overflow-hidden border border-gray-300 bg-white shadow-[3px_3px_0_var(--color-doc)]"
      >
        {preview && <DocumentThumbnail template={preview} width={38} cropHeight={52} />}
      </Link>
      <div className="min-w-0">
        <Link to={`/documents/${doc.id}`} className="block truncate font-semibold hover:underline">
          {doc.name}
        </Link>
        {doc.templateName && <TemplateRef name={doc.templateName} />}
      </div>
      {children}
    </li>
  );
}

/** Un template : vignette « plan » (tracé blanc sur cobalt), nom, statut, et de quoi en tirer un document */
function TemplateRow({
  template,
  onCreate,
  creating,
}: {
  template: TemplateSummary;
  onCreate: () => void;
  creating: boolean;
}) {
  const status = templateStatus(template);
  const published = status !== "draft";
  return (
    <li className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3 border-t border-tpl-rule py-2.5">
      <BlueprintGlyph />
      <div className="min-w-0">
        <Link to={`/templates/${template.id}/build`} className="block truncate font-semibold hover:underline">
          {template.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="font-mono text-[11px] text-gray-700">
            {published ? "PUBLIÉ" : "BROUILLON"} ·{" "}
            {template.documentCount === 0
              ? "AUCUN DOCUMENT"
              : `${template.documentCount} DOCUMENT${template.documentCount > 1 ? "S" : ""}`}
          </span>
          {published ? (
            <button
              onClick={onCreate}
              disabled={creating}
              className="text-xs font-semibold text-doc-strong hover:underline disabled:opacity-50"
            >
              Créer un document →
            </button>
          ) : (
            <Link to={`/templates/${template.id}/publish`} className="text-xs font-semibold text-tpl hover:underline">
              Finir et publier →
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}
