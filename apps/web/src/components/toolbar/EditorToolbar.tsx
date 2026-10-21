import { Redo2, Undo2 } from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { IconButton } from "@/components/ui/Button";

export function EditorToolbar() {
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const historyLength = useEditorStore((s) => s.history.length);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-rule bg-white px-3">
      <IconButton label="Annuler (Ctrl+Z)" icon={<Undo2 size={15} />} disabled={!canUndo} onClick={undo} />
      <IconButton label="Rétablir (Ctrl+Shift+Z)" icon={<Redo2 size={15} />} disabled={!canRedo} onClick={redo} />
      <span className="ml-3 text-[11px] text-ink-faint">
        Les pages blanches sont le document exporté en PDF. Panneaux, poignées et contours n'apparaissent pas à
        l'export.
      </span>
    </div>
  );
}
