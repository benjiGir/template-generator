import { useEditorStore } from "@/store/editor-store";

export function ThemeBorderEditor() {
  const theme = useEditorStore((s) => s.template?.theme);
  const updateTheme = useEditorStore((s) => s.updateTheme);

  if (!theme) return null;

  const b = theme.borders;

  const update = (key: string, value: number) => {
    updateTheme({ borders: { ...b, [key]: value } });
  };

  return (
    <div className="px-4 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Rayon (px)</label>
          <input
            type="number" min={0} max={32}
            value={b.radius}
            onChange={(e) => update("radius", Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Rayon large</label>
          <input
            type="number" min={0} max={64}
            value={b.radiusLg}
            onChange={(e) => update("radiusLg", Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Épaisseur</label>
          <input
            type="number" min={0} max={4}
            value={b.width}
            onChange={(e) => update("width", Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="flex gap-3 justify-center mt-1">
        <div
          style={{
            width: 48,
            height: 32,
            borderRadius: b.radius,
            border: `${b.width}px solid ${theme.colors.primary}`,
            backgroundColor: theme.colors.primaryLight,
          }}
        />
        <div
          style={{
            width: 64,
            height: 32,
            borderRadius: b.radiusLg,
            border: `${b.width}px solid ${theme.colors.accent}`,
            backgroundColor: theme.colors.accentLight,
          }}
        />
      </div>
    </div>
  );
}
