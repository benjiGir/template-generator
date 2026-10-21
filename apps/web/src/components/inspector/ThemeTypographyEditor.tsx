import { useEditorStore } from "@/store/editor-store";
import { Field, Input } from "@/components/ui/Field";

const FONT_SUGGESTIONS = [
  "Inter, system-ui, sans-serif",
  "Plus Jakarta Sans, system-ui, sans-serif",
  "DM Sans, system-ui, sans-serif",
  "Montserrat, system-ui, sans-serif",
  "Open Sans, system-ui, sans-serif",
  "Lato, system-ui, sans-serif",
  "Raleway, system-ui, sans-serif",
  "Georgia, 'Times New Roman', serif",
  "Playfair Display, Georgia, serif",
  "Merriweather, Georgia, serif",
  "Source Code Pro, monospace",
];

export function ThemeTypographyEditor() {
  const theme = useEditorStore((s) => s.template?.theme);
  const updateTheme = useEditorStore((s) => s.updateTheme);

  if (!theme) return null;

  const t = theme.typography;

  const update = (key: string, value: string | number) => {
    updateTheme({ typography: { ...t, [key]: value } });
  };

  const updateHeading = (key: string, value: number) => {
    updateTheme({ typography: { ...t, headingSizes: { ...t.headingSizes, [key]: value } } });
  };

  return (
    <div className="px-4 space-y-3">
      {/* Fontes */}
      <Field label="Fonte principale">
        <Input list="font-suggestions" value={t.fontFamily} onChange={(e) => update("fontFamily", e.target.value)} />
        <datalist id="font-suggestions">
          {FONT_SUGGESTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </datalist>
      </Field>

      <Field label="Fonte titres">
        <Input
          list="font-suggestions"
          value={t.headingFontFamily}
          onChange={(e) => update("headingFontFamily", e.target.value)}
        />
      </Field>

      {/* Taille de base + interlignage */}
      <div className="grid grid-cols-2 gap-2">
        <Field label="Taille base (px)">
          <Input
            type="number"
            min={10}
            max={20}
            value={t.baseFontSize}
            onChange={(e) => update("baseFontSize", Number(e.target.value))}
          />
        </Field>
        <Field label="Interlignage">
          <Input
            type="number"
            min={1}
            max={2.5}
            step={0.05}
            value={t.lineHeight}
            onChange={(e) => update("lineHeight", Number(e.target.value))}
          />
        </Field>
      </div>

      {/* Tailles de titres */}
      <div>
        <p className="text-xs text-ink-faint mb-1">Tailles des titres (px)</p>
        <div className="grid grid-cols-3 gap-2">
          {(["h1", "h2", "h3"] as const).map((h) => (
            <Field key={h} label={h.toUpperCase()}>
              <Input
                type="number"
                min={10}
                max={60}
                value={t.headingSizes[h]}
                onChange={(e) => updateHeading(h, Number(e.target.value))}
              />
            </Field>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div
        className="mt-2 p-2 bg-paper rounded border border-rule"
        style={{ fontFamily: t.fontFamily, fontSize: t.baseFontSize, lineHeight: t.lineHeight }}
      >
        <div
          style={{ fontSize: t.headingSizes.h1, fontWeight: t.fontWeights.extrabold, lineHeight: 1.2, marginBottom: 4 }}
        >
          Titre H1
        </div>
        <div style={{ fontSize: t.headingSizes.h2, fontWeight: t.fontWeights.bold, lineHeight: 1.3, marginBottom: 4 }}>
          Titre H2
        </div>
        <div>Texte courant — Lorem ipsum dolor sit amet, consectetur adipiscing.</div>
      </div>
    </div>
  );
}
