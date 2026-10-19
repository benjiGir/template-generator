import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { api } from "@/api/client";
import { queryKeys } from "@/api/queryKeys";
import { useDocumentStore } from "@/store/document-store";

/** Nom du document dans l'en-tête du workflow, modifiable sur place */
export function DocumentTitle() {
  const queryClient = useQueryClient();
  const document = useDocumentStore((s) => s.document)!;
  const applyServerState = useDocumentStore((s) => s.applyServerState);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(document.name);

  const commit = async () => {
    setEditing(false);
    const name = draft.trim();
    if (!name || name === document.name) {
      setDraft(document.name);
      return;
    }
    try {
      const updated = await api.documents.rename(document.id, name);
      applyServerState(updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.list() });
    } catch (e) {
      console.error("Renommage impossible :", e);
      setDraft(document.name);
    }
  };

  if (editing) {
    return (
      <input
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { setDraft(document.name); setEditing(false); }
        }}
        aria-label="Nom du document"
        className="w-full rounded border border-blue-400 px-1.5 py-0.5 text-sm font-semibold text-gray-900 focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(document.name); setEditing(true); }}
      title="Renommer le document"
      className="group flex max-w-full items-center gap-1.5 rounded text-left hover:text-blue-700"
    >
      <span className="truncate">{document.name}</span>
      <Pencil size={12} className="shrink-0 text-gray-300 group-hover:text-blue-600" />
    </button>
  );
}
