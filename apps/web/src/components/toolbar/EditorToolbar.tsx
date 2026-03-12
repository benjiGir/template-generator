import { useNavigate } from "react-router-dom";
import { useEditorStore } from "@/store/editor-store";
import { ExportButton } from "./ExportButton";

interface Props {
  onSave?: () => void;
  saving?: boolean;
}

export function EditorToolbar({ onSave, saving }: Props) {
  const navigate = useNavigate();
  const template = useEditorStore((s) => s.template);
  const isDirty = useEditorStore((s) => s.isDirty);
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const history = useEditorStore((s) => s.history);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-12 flex items-center gap-3 px-4 border-b border-gray-200 bg-white shrink-0">
      {/* Retour */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        ← Dashboard
      </button>

      <div className="w-px h-5 bg-gray-200" />

      {/* Nom du template */}
      <span className="text-sm font-semibold text-gray-900 truncate max-w-xs">
        {template?.name ?? "—"}
      </span>
      {saving && <span className="text-xs text-gray-400">Sauvegarde...</span>}
      {!saving && isDirty && <span className="text-xs text-amber-500 font-medium">Non sauvegardé</span>}

      <div className="flex-1" />

      {/* Undo / Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Annuler (Ctrl+Z)"
        className="px-2 py-1 text-sm rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ↩
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Rétablir (Ctrl+Shift+Z)"
        className="px-2 py-1 text-sm rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ↪
      </button>

      <div className="w-px h-5 bg-gray-200" />

      {/* Sauvegarder */}
      <button
        onClick={onSave}
        disabled={!isDirty || saving}
        className="px-3 py-1.5 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Sauvegarder
      </button>

      <ExportButton />
    </div>
  );
}
