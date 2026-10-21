import type { ReactElement } from "react";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { BOLD_ITALIC_STAR, BOLD_STAR, ITALIC_STAR, UNORDERED_LIST, ORDERED_LIST, LINK } from "@lexical/markdown";

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
