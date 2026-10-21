import { createElement } from "react";
import * as lucide from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";

type LucideExport = (typeof lucide)[keyof typeof lucide];

/** Les exports de Lucide mêlent icônes (composants React) et utilitaires : on ne garde que les icônes */
function isIcon(value: LucideExport): value is LucideIcon {
  return typeof value === "object" && value !== null && "render" in value;
}

/**
 * Icônes Lucide par nom, alias compris (« AlertTriangle » comme « TriangleAlert »),
 * tel qu'il est stocké dans les props de type `icon`.
 */
export const ICONS: ReadonlyMap<string, LucideIcon> = new Map(
  Object.entries(lucide).filter((entry): entry is [string, LucideIcon] => isIcon(entry[1])),
);

/** Icône désignée par son nom ; l'icône de repli si le nom est inconnu */
export function IconByName({ name, fallback, ...props }: LucideProps & { name: string; fallback: LucideIcon }) {
  return createElement(ICONS.get(name) ?? fallback, props);
}
