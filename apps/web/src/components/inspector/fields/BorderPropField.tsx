import type { CSSProperties } from "react";
import type { BorderValue } from "@template-generator/shared/types/component";
import { Field, Input } from "@/components/ui/Field";

interface Props {
  label: string;
  value: BorderValue;
  onChange: (v: BorderValue) => void;
}

const BORDER_STYLES: { label: string; value: BorderValue["style"] }[] = [
  { label: "Aucun", value: "none" },
  { label: "Plein", value: "solid" },
  { label: "Tirets", value: "dashed" },
  { label: "Pointillés", value: "dotted" },
];

export function BorderPropField({ label, value, onChange }: Props) {
  const val = value;

  const update = <K extends keyof BorderValue>(key: K, v: BorderValue[K]) => {
    onChange({ ...val, [key]: v });
  };

  const previewStyle: CSSProperties = {
    border: val.style === "none" ? "none" : `${val.width}px ${val.style} ${val.color}`,
    borderRadius: val.radius,
    height: 28,
    backgroundColor: "#f9fafb",
  };

  return (
    <div>
      <label className="block text-xs font-medium text-ink-muted mb-2">{label}</label>

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
                  ? "bg-tpl-tint border-tpl text-tpl-strong font-medium"
                  : "border-rule text-ink-subtle hover:border-rule-strong"
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
              <Field label="Épaisseur (px)" className="flex-1">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={val.width}
                  onChange={(e) => update("width", Number(e.target.value))}
                />
              </Field>
              <div>
                <span className="text-[10px] text-ink-faint block mb-0.5">Couleur</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    aria-label="Couleur de la bordure"
                    value={val.color}
                    onChange={(e) => update("color", e.target.value)}
                    className="w-8 h-7 cursor-pointer rounded border border-rule p-0.5"
                  />
                  <input
                    type="text"
                    aria-label="Code hexadécimal de la couleur"
                    value={val.color}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) update("color", v);
                    }}
                    className="w-20 px-1.5 py-1 text-xs border border-rule rounded focus:outline-none focus:border-focus font-mono"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Radius */}
        <Field label="Rayon (px)">
          <Input type="number" min={0} value={val.radius} onChange={(e) => update("radius", Number(e.target.value))} />
        </Field>

        {/* Preview */}
        <div style={previewStyle} />
      </div>
    </div>
  );
}
