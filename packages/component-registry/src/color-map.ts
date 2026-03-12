import type { Theme } from "@template-generator/shared/types/template";

const COLOR_MAP: Record<string, { hex: string; lightBg: string }> = {
  blue:  { hex: "#2563EB", lightBg: "#EFF6FF" },
  green: { hex: "#16A34A", lightBg: "#F0FDF4" },
  amber: { hex: "#D97706", lightBg: "#FFFBEB" },
  red:   { hex: "#DC2626", lightBg: "#FEF2F2" },
};

export function resolveColor(color: string, theme: Theme): string {
  return COLOR_MAP[color]?.hex ?? theme.colors.primary;
}

export function resolveLightBg(color: string): string {
  return COLOR_MAP[color]?.lightBg ?? "#F8FAFC";
}
