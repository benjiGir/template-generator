import type { ReactNode } from "react";
import { ObjectTag, type ObjectKind } from "./ObjectIdentity";

/** En-tête d'une liste d'espace : type d'objet, titre, ce qu'on y fait, action de création */
export function SpaceHeader({
  kind,
  tag,
  title,
  subtitle,
  action,
}: {
  kind: ObjectKind;
  tag: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-ink px-8 pb-5 pt-8">
      <div>
        <ObjectTag kind={kind}>{tag}</ObjectTag>
        <h1 className="mt-2 text-[32px] font-bold leading-tight tracking-tight">{title}</h1>
        <p className="text-sm text-ink-soft">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
