import { useEditorStore } from "@/store/editor-store";
import { Field, Input } from "@/components/ui/Field";

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
        <Field label="Rayon (px)">
          <Input
            type="number"
            min={0}
            max={32}
            value={b.radius}
            onChange={(e) => update("radius", Number(e.target.value))}
          />
        </Field>
        <Field label="Rayon large">
          <Input
            type="number"
            min={0}
            max={64}
            value={b.radiusLg}
            onChange={(e) => update("radiusLg", Number(e.target.value))}
          />
        </Field>
        <Field label="Épaisseur">
          <Input
            type="number"
            min={0}
            max={4}
            value={b.width}
            onChange={(e) => update("width", Number(e.target.value))}
          />
        </Field>
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
