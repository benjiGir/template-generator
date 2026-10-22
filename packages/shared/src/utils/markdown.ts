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

/**
 * Parse le Markdown en blocs (paragraphes, listes). Comme en Markdown, une ligne vide sépare deux
 * paragraphes (c'est ce que produit l'éditeur pour un retour à la ligne) ; des lignes qui se suivent
 * forment un seul paragraphe.
 */
export function parseBlocks(text: string): Block[] {
  if (!text.trim()) return [];

  const blocks: Block[] = [];
  // Le paragraphe en cours, que la ligne suivante prolonge ; null après une ligne vide ou une puce
  let paragraph: Block | null = null;

  for (const line of text.split("\n")) {
    const ulMatch = /^-\s+(.+)$/.exec(line);
    const olMatch = /^\d+\.\s+(.+)$/.exec(line);

    if (ulMatch?.[1]) {
      blocks.push({ type: "ul-item", content: ulMatch[1] });
      paragraph = null;
    } else if (olMatch?.[1]) {
      blocks.push({ type: "ol-item", content: olMatch[1] });
      paragraph = null;
    } else if (!line.trim()) {
      paragraph = null;
    } else if (paragraph) {
      paragraph.content += " " + line;
    } else {
      paragraph = { type: "paragraph", content: line };
      blocks.push(paragraph);
    }
  }

  return blocks;
}
