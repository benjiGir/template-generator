import type { BorderValue } from "@template-generator/shared/types/component";

interface Props {
  label: string;
  value: BorderValue;
  onChange: (v: unknown) => void;
}

const EMPTY: BorderValue = { style: "solid", width: 1, color: "#000000", radius: 0 };

const BORDER_STYLES: { label: string; value: BorderValue["style"] }[] = [
  { label: "Aucun", value: "none" },
  { label: "Plein", value: "solid" },
  { label: "Tirets", value: "dashed" },
  { label: "Pointillés", value: "dotted" },
];

export function BorderPropField({ label, value, onChange }: Props) {
  const val: BorderValue = { ...EMPTY, ...((value as BorderValue | undefined) ?? {}) };

  const update = <K extends keyof BorderValue>(key: K, v: BorderValue[K]) => {
    onChange({ ...val, [key]: v });
  };

  const previewStyle: React.CSSProperties = {
    border: val.style === "none" ? "none" : `${val.width}px ${val.style} ${val.color}`,
    borderRadius: val.radius,
    height: 28,
    backgroundColor: "#f9fafb",
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>

      <div className="space-y-2">
        {/* Style */}
        <div className="flex gap-1">
          {BORDER_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => update("style", s.value)}
              className={`flex-1 py-1 text-[10px] rounded border transition-colors ${
                val.style === s.value
                  ? "bg-blue-50 border-blue-400 text-blue-700 font-medium"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {val.style !== "none" && (
          <>
            {/* Width + Color */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 block mb-0.5">Épaisseur (px)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={val.width}
                  onChange={(e) => update("width", Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-0.5">Couleur</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={val.color}
                    onChange={(e) => update("color", e.target.value)}
                    className="w-8 h-7 cursor-pointer rounded border border-gray-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={val.color}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) update("color", v);
                    }}
                    className="w-20 px-1.5 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Radius */}
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Rayon (px)</label>
          <input
            type="number"
            min={0}
            value={val.radius}
            onChange={(e) => update("radius", Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Preview */}
        <div style={previewStyle} />
      </div>
    </div>
  );
}
