import { documentDisplayStatus, templateStatus } from "@template-generator/shared/utils/fields";
import type { Template } from "@template-generator/shared/types/template";
import type { Document } from "@template-generator/shared/types/document";

/**
 * Statuts monochromes, distingués par la forme du repère (vide, plein, losange, pointillés) :
 * la couleur reste réservée aux types d'objets.
 */
type Shape = "hollow" | "filled" | "diamond" | "dashed";

const SHAPES: Record<Shape, string> = {
  hollow: "border-[1.5px] border-ink",
  filled: "bg-ink",
  diamond: "bg-ink rotate-45",
  dashed: "border-[1.5px] border-dashed border-ink",
};

function Status({ shape, children, title }: { shape: Shape; children: string; title?: string }) {
  return (
    <span title={title} className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink">
      <span aria-hidden="true" className={`box-border inline-block h-2 w-2 ${SHAPES[shape]}`} />
      {children}
    </span>
  );
}

export function TemplateStatusBadge({ template }: { template: Pick<Template, "published" | "publishedAt" | "updatedAt"> }) {
  switch (templateStatus(template)) {
    case "draft":
      return <Status shape="dashed" title="Pas encore disponible dans le Studio">Brouillon</Status>;
    case "published":
      return <Status shape="filled" title="Disponible dans le Studio">Publié</Status>;
    case "published-with-changes":
      return <Status shape="diamond" title="Le Studio utilise encore la version publiée précédente">Modifs non publiées</Status>;
  }
}

export function DocumentStatusBadge({ document }: { document: Pick<Document, "status" | "exportedAt" | "updatedAt"> }) {
  switch (documentDisplayStatus(document)) {
    case "draft":
      return <Status shape="hollow">Brouillon</Status>;
    case "finalized":
      return <Status shape="filled" title="Exporté en PDF">Finalisé</Status>;
    case "modified-after-export":
      return <Status shape="diamond" title="Modifié depuis le dernier export PDF">Modifié depuis l'export</Status>;
  }
}
