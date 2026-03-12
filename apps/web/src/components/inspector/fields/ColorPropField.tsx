const PRESETS = [
  "#2563EB", "#3B82F6", "#60A5FA",
  "#16A34A", "#22C55E", "#86EFAC",
  "#D97706", "#F59E0B", "#FCD34D",
  "#DC2626", "#EF4444", "#FCA5A5",
  "#7C3AED", "#A855F7",
  "#374151", "#6B7280", "#D1D5DB",
  "#111827", "#FFFFFF",
];

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function ColorPropField({ label, value, onChange }: Props) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {/* Palette */}
      <div className="flex flex-wrap gap-1 mb-2">
        {PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            title={color}
            style={{ backgroundColor: color }}
            className={`w-5 h-5 rounded-sm border transition-transform hover:scale-110 ${
              value === color ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-300"
            }`}
          />
        ))}
      </div>
      {/* Valeur custom */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-gray-200"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 font-mono"
        />
      </div>
    </div>
  );
}
