import { useRef, useEffect, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown";
import { FORMAT_TEXT_COMMAND } from "lexical";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { EDITOR_NODES, MARKDOWN_TRANSFORMERS } from "./lexical-config";
import { useEditorStore } from "@/store/editor-store";

const inlineEditorTheme = {
  text: { bold: "font-bold", italic: "italic" },
  link: "underline cursor-pointer",
  list: { ul: "list-disc ml-4", ol: "list-decimal ml-4", listitem: "ml-2" },
  paragraph: "mb-1",
};

function InitPlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    editor.update(() => $convertFromMarkdownString(value, MARKDOWN_TRANSFORMERS));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function MiniToolbar() {
  const [editor] = useLexicalComposerContext();
  const btn = "px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100 rounded";
  return (
    <div className="flex items-center gap-0.5 px-1 py-0.5 bg-white border border-gray-200 rounded shadow-md">
      <button type="button" className={`${btn} font-bold`} onMouseDown={(e) => { e.preventDefault(); editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"); }}>B</button>
      <button type="button" className={`${btn} italic`} onMouseDown={(e) => { e.preventDefault(); editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"); }}>I</button>
      <span className="w-px h-3 bg-gray-200 mx-0.5" />
      <button type="button" className={btn} onMouseDown={(e) => { e.preventDefault(); editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined); }}>•</button>
      <button type="button" className={btn} onMouseDown={(e) => { e.preventDefault(); editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined); }}>1.</button>
    </div>
  );
}

interface Props {
  nodeId: string;
  propKey: string;
  value: string;
}

export function InlineEditor({ nodeId, propKey, value }: Props) {
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps);
  const stopInlineEdit = useEditorStore((s) => s.stopInlineEdit);
  const containerRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Escape → annule
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        updateNodeProps(nodeId, { [propKey]: savedRef.current });
        stopInlineEdit();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [nodeId, propKey, updateNodeProps, stopInlineEdit]);

  // Clic extérieur → sauvegarde
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        stopInlineEdit();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [stopInlineEdit]);

  const handleChange = useCallback((editorState: import("lexical").EditorState) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      editorState.read(() => {
        const md = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);
        updateNodeProps(nodeId, { [propKey]: md });
      });
    }, 200);
  }, [nodeId, propKey, updateNodeProps]);

  const initialConfig = {
    namespace: "inline-editor",
    theme: inlineEditorTheme,
    nodes: EDITOR_NODES,
    onError: (err: Error) => console.error(err),
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, zIndex: 200, backgroundColor: "rgba(255,255,255,0.97)", padding: 4 }}
      onClick={(e) => e.stopPropagation()}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <div style={{ position: "absolute", top: -36, left: 0 }}>
          <MiniToolbar />
        </div>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{ outline: "none", minHeight: "100%", fontSize: 13, lineHeight: 1.65, color: "#111827" }}
              autoFocus
            />
          }
          placeholder={null}
          ErrorBoundary={({ children }) => <>{children}</>}
        />
        <InitPlugin value={value} />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
      </LexicalComposer>
    </div>
  );
}
