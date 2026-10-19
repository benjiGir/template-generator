import { useEffect } from "react";
import { DndContext, closestCenter, pointerWithin, type CollisionDetection } from "@dnd-kit/core";
import { ComponentLibrary } from "@/components/sidebar/ComponentLibrary";
import { Canvas } from "@/components/canvas/Canvas";
import { Inspector } from "@/components/inspector/Inspector";
import { EditorToolbar } from "@/components/toolbar/EditorToolbar";
import { DragOverlay } from "@/components/canvas/DragOverlay";
import { useEditorStore } from "@/store/editor-store";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useWorkflowSession } from "@/workflow/session";
import { findNode } from "@template-generator/shared/utils/tree";

/** Zone sous le pointeur d'abord (précis dans les structures imbriquées), la plus proche sinon */
const collisionDetection: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  return within.length > 0 ? within : closestCenter(args);
};

export function EditorLayout() {
  const template = useEditorStore((s) => s.template);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const removeNode = useEditorStore((s) => s.removeNode);
  const selectNode = useEditorStore((s) => s.selectNode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const { sensors, activeDragData, handleDragStart, handleDragEnd } = useDragAndDrop();
  const session = useWorkflowSession();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (ctrl && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      if (ctrl && e.key === "s") {
        e.preventDefault();
        void session?.flush();
        return;
      }

      if (e.key === "Delete") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        if (!selectedNodeId || !template) return;
        for (let i = 0; i < template.pages.length; i++) {
          const page = template.pages[i];
          if (!page) continue;
          const found = findNode(page.children, selectedNodeId);
          if (found) {
            removeNode(i, selectedNodeId);
            selectNode(null);
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, session, selectedNodeId, template, removeNode, selectNode]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col overflow-hidden">
        <EditorToolbar />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[280px] shrink-0 overflow-hidden">
            <ComponentLibrary />
          </div>
          <Canvas />
          <div className="w-[320px] shrink-0 overflow-hidden">
            <Inspector />
          </div>
        </div>
      </div>

      <DragOverlay activeDragData={activeDragData} />
    </DndContext>
  );
}
