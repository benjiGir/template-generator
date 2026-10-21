import type { ReactElement } from "react";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState, EditorThemeClasses } from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  ITALIC_STAR,
  UNORDERED_LIST,
  ORDERED_LIST,
  LINK,
} from "@lexical/markdown";

export const MARKDOWN_TRANSFORMERS = [BOLD_ITALIC_STAR, BOLD_STAR, ITALIC_STAR, UNORDERED_LIST, ORDERED_LIST, LINK];

export const EDITOR_NODES = [ListNode, ListItemNode, LinkNode, AutoLinkNode];

/** Les erreurs de l'éditeur sont journalisées par `onError` : le contenu est rendu tel quel */
export function PassthroughErrorBoundary({
  children,
}: {
  children: ReactElement;
  onError: (error: Error) => void;
}): ReactElement {
  return children;
}

/**
 * Configuration d'un éditeur de texte enrichi qui ouvre un texte markdown.
 * Le contenu initial est chargé par Lexical à la création de l'éditeur, une seule fois, au montage
 * (plus de plugin d'initialisation à recopier dans chaque éditeur).
 */
export function markdownEditorConfig(
  namespace: string,
  theme: EditorThemeClasses,
  markdown: string,
): InitialConfigType {
  return {
    namespace,
    theme,
    nodes: EDITOR_NODES,
    onError: (error) => console.error(error),
    editorState: () => $convertFromMarkdownString(markdown, MARKDOWN_TRANSFORMERS),
  };
}

/** Contenu de l'éditeur, en markdown (ce que stockent les templates et les documents) */
export function readMarkdown(editorState: EditorState): string {
  return editorState.read(() => $convertToMarkdownString(MARKDOWN_TRANSFORMERS));
}

export const editorTheme = {
  text: {
    bold: "font-bold",
    italic: "italic",
  },
  link: "text-tpl underline cursor-pointer",
  list: {
    ul: "list-disc ml-4",
    ol: "list-decimal ml-4",
    listitem: "ml-2",
  },
  paragraph: "mb-1",
};
