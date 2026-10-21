import { useState, useRef, useEffect, useCallback } from "react";
import type { EditorState } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from "lexical";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  MARKDOWN_TRANSFORMERS,
  PassthroughErrorBoundary,
  editorTheme,
  markdownEditorConfig,
  readMarkdown,
} from "./lexical-config";

/* ── Toolbar ── */
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const sel = $getSelection();
          if ($isRangeSelection(sel)) {
            setIsBold(sel.hasFormat("bold"));
            setIsItalic(sel.hasFormat("italic"));
          }
        });
      }),
    [editor],
  );

  const btn = (active: boolean) =>
    `px-1.5 py-0.5 text-xs rounded transition-colors ${
      active ? "bg-ink-subtle text-white" : "text-ink-faint hover:text-white hover:bg-ink-muted"
    }`;

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-ink-muted flex-wrap">
      <button
        type="button"
        className={btn(isBold)}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        title="Gras"
      >
        B
      </button>
      <button
        type="button"
        className={`${btn(isItalic)} italic`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        title="Italique"
      >
        I
      </button>
      <span className="w-px h-3 bg-ink-muted mx-0.5" />
      <button
        type="button"
        className={btn(false)}
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        title="Liste à puces"
      >
        •—
      </button>
      <button
        type="button"
        className={btn(false)}
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        title="Liste numérotée"
      >
        1—
      </button>
      <span className="w-px h-3 bg-ink-muted mx-0.5" />
      <button type="button" className={btn(showLink)} onClick={() => setShowLink((s) => !s)} title="Lien">
        🔗
      </button>

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
            className="flex-1 px-1.5 py-0.5 text-xs bg-ink-soft border border-ink-subtle rounded text-white font-mono focus:outline-none focus:border-tpl-rule"
          />
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
              setShowLink(false);
              setLinkUrl("https://");
            }}
            className="px-2 py-0.5 text-xs bg-tpl text-white rounded hover:bg-tpl-strong"
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
  onChange: (v: string) => void;
  placeholder?: string;
}

export function RichtextPropField({ label, value, onChange, placeholder }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = useCallback(
    (editorState: EditorState) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChange(readMarkdown(editorState)), 300);
    },
    [onChange],
  );

  const initialConfig = markdownEditorConfig("richtext-inspector", editorTheme, value);

  return (
    <div>
      <label className="block text-xs font-medium text-ink-muted mb-1.5">{label}</label>
      <div className="border border-rule rounded overflow-hidden text-xs">
        <LexicalComposer initialConfig={initialConfig}>
          <div className="bg-ink-soft text-wash">
            <ToolbarPlugin />
            <div className="relative">
              <RichTextPlugin
                contentEditable={<ContentEditable className="outline-none min-h-[60px] p-2 leading-relaxed" />}
                placeholder={
                  <div className="absolute top-2 left-2 text-ink-subtle pointer-events-none select-none">
                    {placeholder ?? "Contenu…"}
                  </div>
                }
                ErrorBoundary={PassthroughErrorBoundary}
              />
            </div>
          </div>
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
