import { useNavigate } from "react-router-dom";
import { Copy, LayoutTemplate, Trash2 } from "lucide-react";
import type { TemplateSummary } from "@/api/client";
import { useDeleteTemplate, useDuplicateTemplate, useTemplates } from "@/api/hooks/templates";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { TemplateStatusBadge } from "@/components/ui/StatusBadge";
import { BlueprintFrame } from "@/components/ui/ObjectIdentity";
import { SpaceHeader } from "@/components/ui/SpaceHeader";
import { Button, IconButton } from "@/components/ui/Button";
import { DocumentThumbnail } from "@/components/document-view/DocumentView";

export function TemplatesListPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: templates = [], isLoading, error } = useTemplates();
  const duplicateMutation = useDuplicateTemplate();
  const deleteMutation = useDeleteTemplate();

  const handleDelete = async (e: React.MouseEvent, t: TemplateSummary) => {
    e.stopPropagation();
    const consequences = [
      t.published
        ? "Il ne sera plus proposé dans le Studio : plus aucun document ne pourra être créé à partir de lui."
        : "Ce brouillon n'a jamais été publié.",
    ];
    if (t.documentCount > 0) {
      consequences.push(
        `${t.documentCount} document${t.documentCount > 1 ? "s ont" : " a"} été créé${t.documentCount > 1 ? "s" : ""} à partir de ce template. ${
          t.documentCount > 1 ? "Ils restent" : "Il reste"
        } consultable${t.documentCount > 1 ? "s" : ""}, modifiable${t.documentCount > 1 ? "s" : ""} et exportable${t.documentCount > 1 ? "s" : ""}.`,
      );
    }
    consequences.push("Cette action est irréversible.");
    const ok = await confirm({
      title: `Supprimer le template « ${t.name} » ?`,
      consequences,
      confirmLabel: "Supprimer le template",
      tone: "danger",
    });
    if (ok) deleteMutation.mutate(t.id);
  };

  return (
    <div className="h-full overflow-y-auto bg-paper">
      <SpaceHeader
        kind="tpl"
        tag="Templates"
        title="Atelier"
        subtitle="Dessinez les templates que le Studio utilisera pour produire les documents."
        action={
          <Button variant="primary" tone="tpl" size="lg" onClick={() => navigate("/templates/new")}>
            Nouveau template
          </Button>
        }
      />

      <div className="px-8 py-8">
        {isLoading && <p className="text-sm text-ink-faint">Chargement...</p>}
        {error && <p className="text-sm text-danger">Impossible de charger les templates.</p>}

        {!isLoading && !error && templates.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-ink-soft">Aucun template pour l'instant</p>
            <p className="mb-4 mt-1 text-sm text-ink-subtle">
              Un template définit la mise en page d'un type de document ; le Studio le remplit à chaque édition.
            </p>
            <Button variant="primary" tone="tpl" size="lg" onClick={() => navigate("/templates/new")}>
              Créer mon premier template
            </Button>
          </div>
        )}

        <div className="grid max-w-5xl grid-cols-3 gap-4">
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/templates/${t.id}/build`)}
              className="group cursor-pointer overflow-hidden border border-rule bg-white transition-colors hover:border-tpl"
            >
              <BlueprintFrame className="flex h-[200px] w-full justify-center overflow-hidden px-5 pt-4">
                {t.preview ? (
                  <div className="overflow-hidden outline-1 outline-offset-2 outline-dashed outline-white/80">
                    <DocumentThumbnail template={t.preview} width={240} cropHeight={184} />
                  </div>
                ) : (
                  <LayoutTemplate size={32} className="mt-16 text-white/60" />
                )}
              </BlueprintFrame>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-ink">{t.name}</h3>
                    <div className="mt-0.5">
                      <TemplateStatusBadge template={t} />
                    </div>
                    {t.description && <p className="mt-1 line-clamp-1 text-xs text-ink-subtle">{t.description}</p>}
                  </div>
                  <div className="ml-2 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconButton
                      label={`Dupliquer ${t.name}`}
                      title="Dupliquer"
                      icon={<Copy size={14} />}
                      tone="tpl"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateMutation.mutate(t.id);
                      }}
                    />
                    <IconButton
                      label={`Supprimer ${t.name}`}
                      title="Supprimer"
                      icon={<Trash2 size={14} />}
                      tone="danger"
                      size="sm"
                      onClick={(e) => handleDelete(e, t)}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink-faint">
                  Modifié le{" "}
                  {new Date(t.updatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {t.documentCount > 0 && ` · ${t.documentCount} document${t.documentCount > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
