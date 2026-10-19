import { useState } from "react";
import { Pencil } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";

/** Nom du template dans l'en-tête du workflow, modifiable sur place (sauvegarde automatique) */
export function TemplateTitle() {
  const name = useEditorStore((s) => s.template?.name ?? "");
  const description = useEditorStore((s) => s.template?.description);
  const updateTemplateMeta = useEditorStore((s) => s.updateTemplateMeta);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== name) updateTemplateMeta(next, description);
    else setDraft(name);
  };

  if (editing) {
    return (
      <input
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { setDraft(name); setEditing(false); }
        }}
        aria-label="Nom du template"
        className="w-full rounded border border-blue-400 px-1.5 py-0.5 text-sm font-semibold text-gray-900 focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(name); setEditing(true); }}
      title="Renommer le template"
      className="group flex max-w-full items-center gap-1.5 rounded text-left hover:text-blue-700"
    >
      <span className="truncate">{name || "Sans nom"}</span>
      <Pencil size={12} className="shrink-0 text-gray-300 group-hover:text-blue-600" />
    </button>
  );
}
