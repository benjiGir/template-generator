import { useState, useCallback } from "react";
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { get } from "@template-generator/component-registry/registry";
import { generateNodeId } from "@template-generator/shared/utils/tree";
import type { ComponentNode } from "@template-generator/shared/types/template";
import { useEditorStore } from "@/store/editor-store";

/** Données attachées à un élément draggable depuis la bibliothèque */
export interface LibraryDragData {
  source: "library";
  componentType: string;
}

/** Données attachées à un élément draggable depuis le canvas */
export interface CanvasDragData {
  source: "canvas";
  nodeId: string;
  pageIndex: number;
}

/** Données attachées à un preset draggable */
export interface PresetDragData {
  source: "preset";
  presetId: string;
  baseType: string;
  defaultProps: Record<string, unknown>;
}

export type DragData = LibraryDragData | CanvasDragData | PresetDragData;

/** Données attachées à une DropZone */
export interface DropZoneData {
  type: "dropzone";
  pageIndex: number;
  parentId: string | null;
  index: number;
}

export function useDragAndDrop() {
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const addNode = useEditorStore((s) => s.addNode);
  const moveNode = useEditorStore((s) => s.moveNode);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragData(event.active.data.current as DragData);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragData(null);
      const { active, over } = event;
      if (!over) return;

      const drag = active.data.current as DragData;
      const drop = over.data.current as DropZoneData;
      if (!drop || drop.type !== "dropzone") return;

      if (drag.source === "library") {
        const definition = get(drag.componentType);
        if (!definition) return;

        const newNode: ComponentNode = {
          id: generateNodeId(),
          type: drag.componentType,
          props: { ...definition.defaultProps },
          children: definition.acceptsChildren ? [] : undefined,
        };
        addNode(drop.pageIndex, drop.parentId, drop.index, newNode);
      } else if (drag.source === "preset") {
        const definition = get(drag.baseType);
        if (!definition) return;

        const newNode: ComponentNode = {
          id: generateNodeId(),
          type: drag.baseType,
          props: { ...definition.defaultProps, ...drag.defaultProps },
          children: definition.acceptsChildren ? [] : undefined,
        };
        addNode(drop.pageIndex, drop.parentId, drop.index, newNode);
      } else if (drag.source === "canvas") {
        moveNode(drag.pageIndex, drop.pageIndex, drag.nodeId, drop.parentId, drop.index);
      }
    },
    [addNode, moveNode]
  );

  return { sensors, activeDragData, handleDragStart, handleDragEnd };
}
