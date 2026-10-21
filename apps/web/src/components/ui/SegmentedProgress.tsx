import { KIND_STYLES, type ObjectKind } from "./ObjectIdentity";

interface Props {
  filled: number;
  total: number;
  kind?: ObjectKind;
  /** Hauteur des segments en px */
  height?: number;
}

/**
 * Progression en segments : un segment par champ quand il y en a peu (on compte ce qui reste),
 * par dizaine de pourcents au-delà.
 */
export function SegmentedProgress({ filled, total, kind = "doc", height = 7 }: Props) {
  const perField = total > 0 && total <= 24;
  const count = perField ? total : 10;
  const done = perField ? filled : Math.round(((total > 0 ? filled / total : 1) * 100) / 10);
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`flex-1 ${i < done ? KIND_STYLES[kind].bg : "bg-rule"}`} style={{ height }} />
      ))}
    </div>
  );
}
