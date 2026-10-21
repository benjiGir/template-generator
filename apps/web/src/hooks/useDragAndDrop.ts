import { useState, useCallback } from "react";
import { useSensor, useSensors, PointerSensor, KeyboardSensor, useDndContext } from "@dnd-kit/core";
import type { Data, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { get } from "@template-generator/component-registry/registry";
import { findNode, generateNodeId } from "@template-generator/shared/utils/tree";
import type { ComponentNode, Template } from "@template-generator/shared/types/template";
import { useEditorStore } from "@/store/editor-store";
import type { PropValues } from "@template-generator/shared/types/component";
import { isPropValues } from "@template-generator/shared/utils/prop-values";

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
  defaultProps: PropValues;
}

export type DragData = LibraryDragData | CanvasDragData | PresetDragData;

/** Données attachées à une DropZone */
export interface DropZoneData {
  type: "dropzone";
  pageIndex: number;
  parentId: string | null;
  index: number;
}

/** Données d'un élément glissé, vérifiées (dnd-kit les type `any`) ; null si elles ne sont pas reconnues */
function readDragData(data: Data | undefined): DragData | null {
  if (data?.source === "library" && typeof data.componentType === "string") {
    return { source: "library", componentType: data.componentType };
  }
  if (data?.source === "canvas" && typeof data.nodeId === "string" && typeof data.pageIndex === "number") {
    return { source: "canvas", nodeId: data.nodeId, pageIndex: data.pageIndex };
  }
  if (data?.source === "preset" && typeof data.presetId === "string" && typeof data.baseType === "string") {
    const defaultProps = isPropValues(data.defaultProps) ? data.defaultProps : {};
    return { source: "preset", presetId: data.presetId, baseType: data.baseType, defaultProps };
  }
  return null;
}

/** Données d'une zone de dépôt, vérifiées ; null pour toute autre cible */
function readDropData(data: Data | undefined): DropZoneData | null {
  if (
    data?.type === "dropzone" &&
    typeof data.pageIndex === "number" &&
    typeof data.index === "number" &&
    (data.parentId === null || typeof data.parentId === "string")
  ) {
    return { type: "dropzone", pageIndex: data.pageIndex, parentId: data.parentId, index: data.index };
  }
  return null;
}

export interface DropCheck {
  ok: boolean;
  reason?: string;
}

function draggedType(drag: DragData, template: Template): string | null {
  if (drag.source === "library") return drag.componentType;
  if (drag.source === "preset") return drag.baseType;
  const page = template.pages[drag.pageIndex];
  return page ? (findNode(page.children, drag.nodeId)?.type ?? null) : null;
}

/** Ce dépôt est-il possible ? (enfants autorisés, nombre maximal, pas de dépôt dans soi-même) */
export function checkDrop(drag: DragData, drop: DropZoneData, template: Template): DropCheck {
  if (drop.parentId === null) return { ok: true };
  const page = template.pages[drop.pageIndex];
  const parent = page ? findNode(page.children, drop.parentId) : null;
  if (!parent) return { ok: true };
  const parentDef = get(parent.type);
  const type = draggedType(drag, template);

  if (drag.source === "canvas") {
    const fromPage = template.pages[drag.pageIndex];
    const moved = fromPage ? findNode(fromPage.children, drag.nodeId) : null;
    if (moved && (moved.id === parent.id || findNode(moved.children ?? [], parent.id))) {
      return { ok: false, reason: "Un composant ne peut pas être déposé dans lui-même" };
    }
  }
  if (parentDef?.allowedChildren && type && !parentDef.allowedChildren.includes(type)) {
    const allowed = parentDef.allowedChildren.map((t) => get(t)?.label ?? t).join(", ");
    return { ok: false, reason: `« ${parentDef.label} » n'accepte que : ${allowed}` };
  }
  const alreadyInside = drag.source === "canvas" && parent.children?.some((c) => c.id === drag.nodeId);
  if (parentDef?.maxChildren && !alreadyInside && (parent.children?.length ?? 0) >= parentDef.maxChildren) {
    return { ok: false, reason: `« ${parentDef.label} » contient déjà ${parentDef.maxChildren} éléments au maximum` };
  }
  return { ok: true };
}

/** Pendant un glisser-déposer : la zone survolée et la validité du dépôt */
export function useDropTarget(): { drop: DropZoneData | null; check: DropCheck } {
  const { active, over } = useDndContext();
  const template = useEditorStore((s) => s.template);
  const drop = readDropData(over?.data.current);
  const drag = readDragData(active?.data.current);
  if (!drop || !drag || !template) return { drop: null, check: { ok: true } };
  return { drop, check: checkDrop(drag, drop, template) };
}

export function useDragAndDrop() {
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const addNode = useEditorStore((s) => s.addNode);
  const moveNode = useEditorStore((s) => s.moveNode);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragData(readDragData(event.active.data.current));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragData(null);
      const { active, over } = event;
      if (!over) return;

      const drag = readDragData(active.data.current);
      const drop = readDropData(over.data.current);
      if (!drag || !drop) return;
      const template = useEditorStore.getState().template;
      if (!template || !checkDrop(drag, drop, template).ok) return;

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
    [addNode, moveNode],
  );

  return { sensors, activeDragData, handleDragStart, handleDragEnd };
}
