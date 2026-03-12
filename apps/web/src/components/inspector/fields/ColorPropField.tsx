import { useState, useRef, useEffect } from "react";
import Colorful from "@uiw/react-color-colorful";
import { useEditorStore } from "@/store/editor-store";
import type { ThemeColors } from "@template-generator/shared/types/template";

const THEME_REFS: Array<{ key: keyof ThemeColors; label: string }> = [
  { key: "primary",  label: "Primaire" },
  { key: "accent",   label: "Accent" },
  { key: "success",  label: "Succès" },
  { key: "warning",  label: "Avert." },
  { key: "danger",   label: "Danger" },
  { key: "text",     label: "Texte" },
  { key: "textLight",label: "Texte clair" },
];

const EXTENDED_PALETTE = [
  "#1E40AF", "#2563EB", "#3B82F6", "#60A5FA", "#BFDBFE",
  "#14532D", "#16A34A", "#22C55E", "#86EFAC", "#DCFCE7",
  "#78350F", "#D97706", "#F59E0B", "#FCD34D", "#FEF3C7",
  "#7F1D1D", "#DC2626", "#EF4444", "#FCA5A5", "#FEE2E2",
  "#4C1D95", "#7C3AED", "#A855F7", "#D8B4FE", "#F3E8FF",
  "#111827", "#374151", "#6B7280", "#D1D5DB", "#FFFFFF",
];

function resolveDisplayColor(value: string, colors: ThemeColors | undefined): string {
  if (value.startsWith("theme.") && colors) {
    const k = value.slice(6) as keyof ThemeColors;
    return colors[k] ?? "#000000";
  }
  return value || "#000000";
}

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function ColorPropField({ label, value, onChange }: Props) {
  const themeColors = useEditorStore((s) => s.template?.theme.colors);
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const displayColor = resolveDisplayColor(value, themeColors);
  const isThemeRef = value.startsWith("theme.");

  useEffect(() => {
    setHexInput(displayColor);
  }, [displayColor]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleHexInput = (v: string) => {
    setHexInput(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-2 py-1.5 border border-gray-200 rounded hover:border-gray-300 transition-colors text-left"
      >
        <span
          style={{ backgroundColor: displayColor, border: "1px solid rgba(0,0,0,0.12)" }}
          className="w-5 h-5 rounded-sm shrink-0"
        />
        <span className="text-xs font-mono text-gray-600 truncate flex-1">
          {isThemeRef ? value : displayColor}
        </span>
        {isThemeRef && (
          <span className="text-xs text-blue-500 shrink-0">lié</span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-60 bg-white border border-gray-200 rounded-lg shadow-xl p-3 space-y-3">

          {/* Palette thème */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Couleurs du thème</p>
            <div className="flex gap-1.5 flex-wrap">
              {THEME_REFS.map(({ key, label: l }) => {
                const ref = `theme.${key}`;
                const hex = themeColors?.[key] ?? "#ccc";
                return (
                  <button
                    key={ref}
                    type="button"
                    onClick={() => { onChange(ref); setOpen(false); }}
                    title={l}
                    style={{
                      backgroundColor: hex,
                      border: value === ref ? "2px solid #2563EB" : "1px solid rgba(0,0,0,0.15)",
                    }}
                    className="w-6 h-6 rounded transition-transform hover:scale-110"
                  />
                );
              })}
            </div>
          </div>

          {/* Palette étendue */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Palette</p>
            <div className="grid grid-cols-5 gap-1">
              {EXTENDED_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { onChange(color); setOpen(false); }}
                  title={color}
                  style={{
                    backgroundColor: color,
                    border: displayColor === color && !isThemeRef ? "2px solid #2563EB" : "1px solid rgba(0,0,0,0.1)",
                  }}
                  className="w-full aspect-square rounded-sm transition-transform hover:scale-110"
                />
              ))}
            </div>
          </div>

          {/* Color picker */}
          <Colorful
            color={displayColor}
            onChange={(color) => { onChange(color.hex); setHexInput(color.hex); }}
            style={{ width: "100%" }}
          />

          {/* Input hex */}
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value)}
            placeholder="#000000"
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 font-mono"
          />
        </div>
      )}
    </div>
  );
}
