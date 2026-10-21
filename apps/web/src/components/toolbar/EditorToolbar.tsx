import { Redo2, Undo2 } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";

export function EditorToolbar() {
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const historyLength = useEditorStore((s) => s.history.length);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-gray-200 bg-white px-3">
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Annuler (Ctrl+Z)"
        className="rounded p-1.5 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Undo2 size={15} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Rétablir (Ctrl+Shift+Z)"
        className="rounded p-1.5 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Redo2 size={15} />
      </button>
      <span className="ml-3 text-[11px] text-gray-400">
        Les pages blanches sont le document exporté en PDF. Panneaux, poignées et contours n'apparaissent pas à
        l'export.
      </span>
    </div>
  );
}
