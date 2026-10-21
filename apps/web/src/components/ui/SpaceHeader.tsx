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
        <p className="text-sm text-gray-700">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

/** Bouton de création dans la couleur du type d'objet */
export function CreateButton({
  kind,
  onClick,
  children,
}: {
  kind: ObjectKind;
  onClick: () => void;
  children: ReactNode;
}) {
  const bg = kind === "doc" ? "bg-doc" : kind === "tpl" ? "bg-tpl" : "bg-preset";
  return (
    <button
      onClick={onClick}
      className={`inline-flex min-h-[42px] items-center gap-2 rounded-sm px-4 font-semibold text-white hover:brightness-95 ${bg}`}
    >
      {children}
    </button>
  );
}
