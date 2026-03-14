import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Template, ComponentNode, TemplatePage, Theme, PageFormat } from "@template-generator/shared/types/template";
import { DEFAULT_THEME, DEFAULT_PAGE_FORMAT } from "@template-generator/shared/types/template";
import {
  findNode,
  insertNode,
  removeNode as treeRemoveNode,
  moveNode as treeMoveNode,
  duplicateNode as treeDuplicateNode,
  generateNodeId,
} from "@template-generator/shared/utils/tree";

interface EditorState {
  template: Template | null;
  selectedNodeId: string | null;
  selectedPageIndex: number;
  isDirty: boolean;
  history: Template[];
  historyIndex: number;

  loadTemplate: (template: Template) => void;
  updateTemplateMeta: (name: string, description?: string) => void;
  updateTheme: (theme: Partial<Theme>) => void;
  updatePageFormat: (format: Partial<PageFormat>) => void;

  addPage: () => void;
  removePage: (pageIndex: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;

  addNode: (pageIndex: number, parentId: string | null, index: number, node: ComponentNode) => void;
  removeNode: (pageIndex: number, nodeId: string) => void;
  moveNode: (fromPageIndex: number, toPageIndex: number, nodeId: string, newParentId: string | null, newIndex: number) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  duplicateNode: (pageIndex: number, nodeId: string) => void;

  selectNode: (nodeId: string | null) => void;
  selectPage: (pageIndex: number) => void;

  inlineEditingNodeId: string | null;
  inlineEditingPropKey: string | null;
  startInlineEdit: (nodeId: string, propKey: string) => void;
  stopInlineEdit: () => void;

  undo: () => void;
  redo: () => void;
}

function cloneTemplate(t: Template): Template {
  return JSON.parse(JSON.stringify(t)) as Template;
}

function pushHistory(state: EditorState, template: Template): void {
  const snap = cloneTemplate(template);
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(snap);
  if (newHistory.length > 50) newHistory.splice(0, newHistory.length - 50);
  state.history = newHistory;
  state.historyIndex = newHistory.length - 1;
}

export const useEditorStore = create<EditorState>()(
  immer((set) => ({
    template: null,
    selectedNodeId: null,
    selectedPageIndex: 0,
    inlineEditingNodeId: null,
    inlineEditingPropKey: null,
    isDirty: false,
    history: [],
    historyIndex: -1,

    loadTemplate: (template) =>
      set((s) => {
        const normalized = cloneTemplate(template);
        normalized.theme = {
          ...DEFAULT_THEME,
          ...normalized.theme,
          colors:     { ...DEFAULT_THEME.colors,     ...normalized.theme.colors },
          typography: { ...DEFAULT_THEME.typography, ...normalized.theme.typography },
          spacing:    { ...DEFAULT_THEME.spacing,    ...normalized.theme.spacing },
          borders:    { ...DEFAULT_THEME.borders,    ...normalized.theme.borders },
        };
        s.template = normalized;
        s.selectedNodeId = null;
        s.selectedPageIndex = 0;
        s.isDirty = false;
        s.history = [cloneTemplate(normalized)];
        s.historyIndex = 0;
      }),

    updateTemplateMeta: (name, description) =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        s.template.name = name;
        if (description !== undefined) s.template.description = description;
        s.isDirty = true;
      }),

    updateTheme: (theme) =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        s.template.theme = {
          ...s.template.theme,
          ...theme,
          colors:     { ...s.template.theme.colors,     ...(theme.colors     ?? {}) },
          typography: { ...s.template.theme.typography, ...(theme.typography ?? {}) },
          spacing:    { ...s.template.theme.spacing,    ...(theme.spacing    ?? {}) },
          borders:    { ...s.template.theme.borders,    ...(theme.borders    ?? {}) },
        };
        s.isDirty = true;
      }),

    updatePageFormat: (format) =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        s.template.pageFormat = { ...s.template.pageFormat, ...format };
        s.isDirty = true;
      }),

    addPage: () =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        const newPage: TemplatePage = {
          id: generateNodeId(),
          label: `Page ${s.template.pages.length + 1}`,
          children: [],
        };
        s.template.pages.push(newPage);
        s.selectedPageIndex = s.template.pages.length - 1;
        s.isDirty = true;
      }),

    removePage: (pageIndex) =>
      set((s) => {
        if (!s.template || s.template.pages.length <= 1) return;
        pushHistory(s, s.template);
        s.template.pages.splice(pageIndex, 1);
        s.selectedPageIndex = Math.min(s.selectedPageIndex, s.template.pages.length - 1);
        s.isDirty = true;
      }),

    reorderPages: (fromIndex, toIndex) =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        const [page] = s.template.pages.splice(fromIndex, 1);
        if (page) s.template.pages.splice(toIndex, 0, page);
        s.isDirty = true;
      }),

    addNode: (pageIndex, parentId, index, node) =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        const page = s.template.pages[pageIndex];
        if (!page) return;
        page.children = insertNode(page.children as ComponentNode[], parentId, index, node) as typeof page.children;
        s.selectedNodeId = node.id;
        s.isDirty = true;
      }),

    removeNode: (pageIndex, nodeId) =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        const page = s.template.pages[pageIndex];
        if (!page) return;
        page.children = treeRemoveNode(page.children as ComponentNode[], nodeId) as typeof page.children;
        if (s.selectedNodeId === nodeId) s.selectedNodeId = null;
        s.isDirty = true;
      }),

    moveNode: (fromPageIndex, toPageIndex, nodeId, newParentId, newIndex) =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        const fromPage = s.template.pages[fromPageIndex];
        if (!fromPage) return;
        const node = findNode(fromPage.children as ComponentNode[], nodeId);
        if (!node) return;
        fromPage.children = treeRemoveNode(fromPage.children as ComponentNode[], nodeId) as typeof fromPage.children;
        const toPage = s.template.pages[toPageIndex] ?? fromPage;
        toPage.children = insertNode(toPage.children as ComponentNode[], newParentId, newIndex, node) as typeof toPage.children;
        s.isDirty = true;
      }),

    updateNodeProps: (nodeId, props) =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        for (const page of s.template.pages) {
          const node = findNode(page.children as ComponentNode[], nodeId);
          if (node) {
            node.props = { ...node.props, ...props } as typeof node.props;
            break;
          }
        }
        s.isDirty = true;
      }),

    duplicateNode: (pageIndex, nodeId) =>
      set((s) => {
        if (!s.template) return;
        pushHistory(s, s.template);
        const page = s.template.pages[pageIndex];
        if (!page) return;
        page.children = treeDuplicateNode(page.children as ComponentNode[], nodeId) as typeof page.children;
        s.isDirty = true;
      }),

    selectNode: (nodeId) =>
      set((s) => {
        s.selectedNodeId = nodeId;
        s.inlineEditingNodeId = null;
        s.inlineEditingPropKey = null;
      }),

    startInlineEdit: (nodeId, propKey) =>
      set((s) => {
        s.selectedNodeId = nodeId;
        s.inlineEditingNodeId = nodeId;
        s.inlineEditingPropKey = propKey;
      }),

    stopInlineEdit: () =>
      set((s) => {
        s.inlineEditingNodeId = null;
        s.inlineEditingPropKey = null;
      }),

    selectPage: (pageIndex) =>
      set((s) => {
        s.selectedPageIndex = pageIndex;
        s.selectedNodeId = null;
      }),

    undo: () =>
      set((s) => {
        if (s.historyIndex <= 0) return;
        s.historyIndex--;
        const snap = s.history[s.historyIndex];
        if (snap) {
          s.template = cloneTemplate(snap);
          s.isDirty = true;
        }
      }),

    redo: () =>
      set((s) => {
        if (s.historyIndex >= s.history.length - 1) return;
        s.historyIndex++;
        const snap = s.history[s.historyIndex];
        if (snap) {
          s.template = cloneTemplate(snap);
          s.isDirty = true;
        }
      }),
  }))
);

export const DEFAULT_NEW_TEMPLATE: Omit<Template, "id" | "createdAt" | "updatedAt"> = {
  name: "Nouveau template",
  description: "",
  theme: DEFAULT_THEME,
  pageFormat: DEFAULT_PAGE_FORMAT,
  pages: [
    {
      id: generateNodeId(),
      label: "Page 1",
      children: [],
    },
  ],
  published:      false,
  editableFields: [],
  tags:           [],
};
