import { BUILTIN_THEMES } from "@template-generator/shared/themes/presets";
import { DEFAULT_THEME } from "@template-generator/shared/types/template";
import { ComponentPreview } from "@/components/document-view/ComponentPreview";
import { useComponentDraftStore } from "@/store/component-draft-store";

/**
 * Aperçu du preset dans une page simulée. Un preset n'a pas de thème propre :
 * il prendra celui du template qui l'utilise, d'où le choix du thème d'aperçu.
 */
export function PresetPreviewPane({ type, props }: { type: string; props: Record<string, unknown> }) {
  const previewTheme = useComponentDraftStore((s) => s.previewTheme);
  const setPreviewTheme = useComponentDraftStore((s) => s.setPreviewTheme);
  const theme = BUILTIN_THEMES.find((t) => t.name === previewTheme) ?? DEFAULT_THEME;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-2 text-xs">
        <label htmlFor="preview-theme" className="text-gray-500">Aperçu avec le thème</label>
        <select
          id="preview-theme"
          value={theme.name}
          onChange={(e) => setPreviewTheme(e.target.value)}
          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
        >
          {BUILTIN_THEMES.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
        </select>
        <span className="ml-auto text-gray-400">Le preset prendra le thème du template où il sera utilisé.</span>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-200/70 p-8">
        <div className="mx-auto max-w-3xl shadow-[0_1px_3px_rgba(15,23,42,0.12),0_8px_24px_rgba(15,23,42,0.08)]">
          <ComponentPreview type={type} props={props} theme={theme} />
        </div>
        <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] text-gray-500">
          Le composant est montré dans une page, à l’échelle de la largeur disponible. Les éléments estompés ne font pas partie du preset :
          ils montrent le contexte dans lequel il s'affiche.
        </p>
      </div>
    </div>
  );
}
