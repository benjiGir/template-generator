import { useState, type ReactNode } from "react";
import { useEditorStore } from "@/store/editor-store";
import { api } from "@/api/client";
import { ThemePresetPicker } from "./ThemePresetPicker";
import { ThemeColorEditor } from "./ThemeColorEditor";
import { ThemeTypographyEditor } from "./ThemeTypographyEditor";
import { ThemeSpacingEditor } from "./ThemeSpacingEditor";
import { ThemeBorderEditor } from "./ThemeBorderEditor";

function Section({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:bg-gray-50 transition-colors"
      >
        {title}
        <span className="text-gray-300 font-normal">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

export function ThemePanel() {
  const theme = useEditorStore((s) => s.template?.theme);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  if (!theme) return null;

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    try {
      await api.themes.create({ name: saveName.trim(), theme });
      setShowSaveForm(false);
      setSaveName("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Section title="Presets">
        <ThemePresetPicker />
      </Section>

      <Section title="Couleurs">
        <ThemeColorEditor />
      </Section>

      <Section title="Typographie">
        <ThemeTypographyEditor />
      </Section>

      <Section title="Espacement">
        <ThemeSpacingEditor />
      </Section>

      <Section title="Bordures">
        <ThemeBorderEditor />
      </Section>

      {/* Sauvegarde */}
      <div className="px-4 py-3">
        {showSaveForm ? (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setShowSaveForm(false); }}
              placeholder="Nom du thème…"
              className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={handleSave}
              disabled={saving || !saveName.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "…" : "OK"}
            </button>
            <button
              onClick={() => setShowSaveForm(false)}
              className="px-2 py-1.5 text-xs text-gray-500 border border-gray-200 rounded hover:bg-gray-50"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSaveForm(true)}
            className="w-full py-2 text-xs font-medium text-blue-600 border border-dashed border-blue-300 rounded hover:bg-blue-50 transition-colors"
          >
            Sauvegarder comme thème custom
          </button>
        )}
      </div>
    </div>
  );
}
