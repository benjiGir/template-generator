import { useEditorStore } from "@/store/editor-store";
import { Field, Input } from "@/components/ui/Field";

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
        <Field label="Unité de base (px)">
          <Input
            type="number"
            min={1}
            max={16}
            value={sp.unit}
            onChange={(e) => update("unit", Number(e.target.value))}
          />
        </Field>
        <Field label="Écart sections">
          <Input
            type="number"
            min={0}
            max={16}
            value={sp.sectionGap}
            onChange={(e) => update("sectionGap", Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Écart composants">
          <Input
            type="number"
            min={0}
            max={16}
            value={sp.componentGap}
            onChange={(e) => update("componentGap", Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Padding de page">
        <Input
          value={sp.pagePadding}
          onChange={(e) => update("pagePadding", e.target.value)}
          placeholder="28px 36px 32px"
          className="font-mono"
        />
      </Field>

      {/* Preview schéma */}
      <div className="flex items-center justify-center mt-1">
        <div
          className="border-2 border-dashed border-rule-strong relative"
          style={{ width: 80, height: 60, padding: `${sp.unit * sp.componentGap}px ${sp.unit * 4}px` }}
        >
          <div className="bg-tpl-rule w-full h-2 mb-1 rounded-sm" />
          <div className="bg-tpl-tint w-full h-2 rounded-sm" />
          <span className="absolute -top-3.5 left-0 text-ink-faint" style={{ fontSize: 9 }}>
            {sp.pagePadding}
          </span>
        </div>
      </div>
    </div>
  );
}
