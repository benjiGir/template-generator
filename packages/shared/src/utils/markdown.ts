export interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

export interface Block {
  type: "paragraph" | "ul-item" | "ol-item";
  content: string;
}

// Priorité : ***bold+italic*** > **bold** > *italic* > [link](url)
const INLINE_REGEX = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g;

/** Parse le Markdown inline en segments */
export function parseMarkdown(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  INLINE_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      segments.push({ text: match[1], bold: true, italic: true });
    } else if (match[2] !== undefined) {
      segments.push({ text: match[2], bold: true });
    } else if (match[3] !== undefined) {
      segments.push({ text: match[3], italic: true });
    } else if (match[4] !== undefined && match[5] !== undefined) {
      segments.push({ text: match[4], href: match[5] });
    }

    lastIndex = INLINE_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments;
}

/** Parse le Markdown en blocs (paragraphes, listes) */
export function parseBlocks(text: string): Block[] {
  if (!text.trim()) return [];

  const blocks: Block[] = [];

  for (const line of text.split("\n")) {
    const ulMatch = /^-\s+(.+)$/.exec(line);
    const olMatch = /^\d+\.\s+(.+)$/.exec(line);

    if (ulMatch?.[1]) {
      blocks.push({ type: "ul-item", content: ulMatch[1] });
    } else if (olMatch?.[1]) {
      blocks.push({ type: "ol-item", content: olMatch[1] });
    } else if (line.trim()) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "paragraph") {
        last.content += " " + line;
      } else {
        blocks.push({ type: "paragraph", content: line });
      }
    }
  }

  return blocks;
}
