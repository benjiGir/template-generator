/** Convertit une dimension CSS (mm, cm, in, px) en pixels CSS (96 dpi) */
export function dimToPx(value: string): number {
  if (value.endsWith("mm")) return parseFloat(value) * 3.7795275591;
  if (value.endsWith("cm")) return parseFloat(value) * 37.795275591;
  if (value.endsWith("in")) return parseFloat(value) * 96;
  if (value.endsWith("px")) return parseFloat(value);
  return parseFloat(value) || 794;
}

/** Pixels CSS → millimètres, arrondi au millimètre supérieur */
export function pxToMmCeil(px: number): number {
  return Math.ceil(px * 0.2645833333);
}
