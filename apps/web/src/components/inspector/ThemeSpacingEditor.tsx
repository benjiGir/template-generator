import { useEditorStore } from "@/store/editor-store";

export function ThemeSpacingEditor() {
  const theme = useEditorStore((s) => s.template?.theme);
  const updateTheme = useEditorStore((s) => s.updateTheme);

  if (!theme) return null;

  const sp = theme.spacing;

  const update = (key: string, value: string | number) => {
    updateTheme({ spacing: { ...sp, [key]: value } });
  };

  return (
    <div className="px-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Unité de base (px)</label>
          <input
            type="number" min={1} max={16}
            value={sp.unit}
            onChange={(e) => update("unit", Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Écart sections</label>
          <input
            type="number" min={0} max={16}
            value={sp.sectionGap}
            onChange={(e) => update("sectionGap", Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Écart composants</label>
          <input
            type="number" min={0} max={16}
            value={sp.componentGap}
            onChange={(e) => update("componentGap", Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Padding de page</label>
        <input
          type="text"
          value={sp.pagePadding}
          onChange={(e) => update("pagePadding", e.target.value)}
          placeholder="28px 36px 32px"
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 font-mono"
        />
      </div>

      {/* Preview schéma */}
      <div className="flex items-center justify-center mt-1">
        <div
          className="border-2 border-dashed border-gray-300 relative"
          style={{ width: 80, height: 60, padding: `${sp.unit * sp.componentGap}px ${sp.unit * 4}px` }}
        >
          <div className="bg-blue-200 w-full h-2 mb-1 rounded-sm" />
          <div className="bg-blue-100 w-full h-2 rounded-sm" />
          <span className="absolute -top-3.5 left-0 text-gray-400" style={{ fontSize: 9 }}>
            {sp.pagePadding}
          </span>
        </div>
      </div>
    </div>
  );
}
