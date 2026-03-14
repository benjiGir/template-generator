import { useEditorStore } from "@/store/editor-store";
import type { ThemeColors } from "@template-generator/shared/types/template";

function lighten(hex: string, amount = 0.8): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const COLOR_PAIRS: Array<[keyof ThemeColors, keyof ThemeColors, string]> = [
  ["primary", "primaryLight", "Primaire"],
  ["accent", "accentLight", "Accent"],
  ["success", "successLight", "Succès"],
  ["warning", "warningLight", "Avertissement"],
  ["danger", "dangerLight", "Danger"],
];

const TEXT_COLORS: Array<[keyof ThemeColors, string]> = [
  ["text", "Texte"],
  ["textLight", "Texte clair"],
  ["textMuted", "Texte atténué"],
];

const BG_COLORS: Array<[keyof ThemeColors, string]> = [
  ["background", "Fond"],
  ["backgroundAlt", "Fond alt"],
  ["border", "Bordure"],
  ["borderLight", "Bordure claire"],
];

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onGenerate?: () => void;
}

function ColorRow({ label, value, onChange, onGenerate }: ColorRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0 shrink-0"
      />
      <span className="text-xs text-gray-600 w-28 shrink-0">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 px-1.5 py-0.5 text-xs border border-gray-200 rounded font-mono focus:outline-none focus:border-blue-400"
      />
      {onGenerate && (
        <button
          type="button"
          onClick={onGenerate}
          title="Générer variante claire"
          className="text-xs text-gray-400 hover:text-blue-500 shrink-0"
        >
          ↓
        </button>
      )}
    </div>
  );
}

export function ThemeColorEditor() {
  const theme = useEditorStore((s) => s.template?.theme);
  const updateTheme = useEditorStore((s) => s.updateTheme);

  if (!theme) return null;

  const update = (key: keyof ThemeColors, value: string) => {
    updateTheme({ colors: { ...theme.colors, [key]: value } });
  };

  const generateLight = (baseKey: keyof ThemeColors, lightKey: keyof ThemeColors) => {
    const lightened = lighten(theme.colors[baseKey]);
    updateTheme({ colors: { ...theme.colors, [lightKey]: lightened } });
  };

  return (
    <div className="px-4 space-y-3">
      {/* Paires couleur / variante claire */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Couleurs principales</p>
        {COLOR_PAIRS.map(([base, light, label]) => (
          <div key={base}>
            <ColorRow
              label={label}
              value={theme.colors[base]}
              onChange={(v) => update(base, v)}
              onGenerate={() => generateLight(base, light)}
            />
            <ColorRow
              label={`${label} clair`}
              value={theme.colors[light]}
              onChange={(v) => update(light, v)}
            />
          </div>
        ))}
      </div>

      {/* Texte */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Texte</p>
        {TEXT_COLORS.map(([key, label]) => (
          <ColorRow key={key} label={label} value={theme.colors[key]} onChange={(v) => update(key, v)} />
        ))}
      </div>

      {/* Fond et bordures */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Fond & bordures</p>
        {BG_COLORS.map(([key, label]) => (
          <ColorRow key={key} label={label} value={theme.colors[key]} onChange={(v) => update(key, v)} />
        ))}
      </div>
    </div>
  );
}
