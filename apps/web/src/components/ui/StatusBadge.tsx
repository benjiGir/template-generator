import { documentDisplayStatus, templateStatus } from "@template-generator/shared/utils/fields";
import type { Template } from "@template-generator/shared/types/template";
import type { Document } from "@template-generator/shared/types/document";

const STYLES = {
  gray:  "bg-gray-100 text-gray-600",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-800",
  blue:  "bg-blue-100 text-blue-700",
};

function Badge({ tone, children, title }: { tone: keyof typeof STYLES; children: string; title?: string }) {
  return (
    <span title={title} className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${STYLES[tone]}`}>
      {children}
    </span>
  );
}

export function TemplateStatusBadge({ template }: { template: Pick<Template, "published" | "publishedAt" | "updatedAt"> }) {
  switch (templateStatus(template)) {
    case "draft":
      return <Badge tone="gray" title="Pas encore disponible dans le Studio">Brouillon</Badge>;
    case "published":
      return <Badge tone="green" title="Disponible dans le Studio">Publié</Badge>;
    case "published-with-changes":
      return <Badge tone="amber" title="Le Studio utilise encore la version publiée précédente">Modifications non publiées</Badge>;
  }
}

export function DocumentStatusBadge({ document }: { document: Pick<Document, "status" | "exportedAt" | "updatedAt"> }) {
  switch (documentDisplayStatus(document)) {
    case "draft":
      return <Badge tone="blue">Brouillon</Badge>;
    case "finalized":
      return <Badge tone="green" title="Exporté en PDF">Finalisé</Badge>;
    case "modified-after-export":
      return <Badge tone="amber" title="Modifié depuis le dernier export PDF">Modifié depuis l'export</Badge>;
  }
}
