import type { Theme } from "@template-generator/shared/types/template";

export function resolveColor(color: string, theme: Theme): string {
  const map: Record<string, string> = {
    blue:  theme.colors.primary,
    green: theme.colors.success,
    amber: theme.colors.warning,
    red:   theme.colors.danger,
  };
  return map[color] ?? theme.colors.primary;
}

export function resolveLightBg(color: string, theme: Theme): string {
  const map: Record<string, string> = {
    blue:  theme.colors.primaryLight,
    green: theme.colors.successLight,
    amber: theme.colors.warningLight,
    red:   theme.colors.dangerLight,
  };
  return map[color] ?? theme.colors.backgroundAlt;
}
