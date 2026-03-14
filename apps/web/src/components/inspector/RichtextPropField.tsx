import { useState, useRef, useEffect, useCallback } from "react";
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
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from "lexical";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { MARKDOWN_TRANSFORMERS, EDITOR_NODES, editorTheme } from "./lexical-config";

/* ── Init plugin : charge le markdown initial ── */
function InitPlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    editor.update(() => {
      $convertFromMarkdownString(value, MARKDOWN_TRANSFORMERS);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/* ── Toolbar ── */
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");

  useEffect(() =>
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        if ($isRangeSelection(sel)) {
          setIsBold(sel.hasFormat("bold"));
          setIsItalic(sel.hasFormat("italic"));
        }
      });
    }), [editor]
  );

  const btn = (active: boolean) =>
    `px-1.5 py-0.5 text-xs rounded transition-colors ${
      active ? "bg-slate-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-600"
    }`;

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-slate-600 flex-wrap">
      <button type="button" className={btn(isBold)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")} title="Gras">B</button>
      <button type="button" className={`${btn(isItalic)} italic`} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} title="Italique">I</button>
      <span className="w-px h-3 bg-slate-600 mx-0.5" />
      <button type="button" className={btn(false)} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} title="Liste à puces">•—</button>
      <button type="button" className={btn(false)} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} title="Liste numérotée">1—</button>
      <span className="w-px h-3 bg-slate-600 mx-0.5" />
      <button type="button" className={btn(showLink)} onClick={() => setShowLink((s) => !s)} title="Lien">🔗</button>

      {showLink && (
        <div className="flex items-center gap-1 w-full mt-1">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                setShowLink(false);
                setLinkUrl("https://");
              }
              if (e.key === "Escape") setShowLink(false);
            }}
            placeholder="https://..."
            className="flex-1 px-1.5 py-0.5 text-xs bg-slate-700 border border-slate-500 rounded text-white font-mono focus:outline-none focus:border-blue-400"
          />
          <button
            type="button"
            onClick={() => { editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl); setShowLink(false); setLinkUrl("https://"); }}
            className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Composant principal ── */
interface Props {
  label: string;
  value: string;
  onChange: (v: unknown) => void;
  placeholder?: string;
}

export function RichtextPropField({ label, value, onChange, placeholder }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = useCallback((editorState: import("lexical").EditorState) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      editorState.read(() => {
        const md = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);
        onChange(md);
      });
    }, 300);
  }, [onChange]);

  const initialConfig = {
    namespace: "richtext-inspector",
    theme: editorTheme,
    nodes: EDITOR_NODES,
    onError: (err: Error) => console.error(err),
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="border border-gray-200 rounded overflow-hidden text-xs">
        <LexicalComposer initialConfig={initialConfig}>
          <div className="bg-slate-800 text-slate-100">
            <ToolbarPlugin />
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="outline-none min-h-[60px] p-2 leading-relaxed" />
                }
                placeholder={
                  <div className="absolute top-2 left-2 text-slate-500 pointer-events-none select-none">
                    {placeholder ?? "Contenu…"}
                  </div>
                }
                ErrorBoundary={({ children }) => <>{children}</>}
              />
            </div>
          </div>
          <InitPlugin value={value} />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
          <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        </LexicalComposer>
      </div>
    </div>
  );
}
