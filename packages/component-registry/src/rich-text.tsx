import type { CSSProperties, ReactNode } from "react";
import { parseMarkdown, parseBlocks } from "@template-generator/shared/utils/markdown";
import type { Block } from "@template-generator/shared/utils/markdown";

export function RichText({ text }: { text: string }) {
  const segments = parseMarkdown(text);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.href) {
          return (
            <a
              key={i}
              href={seg.href}
              style={{ color: "inherit", textDecoration: "underline" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {seg.bold ? <strong>{seg.text}</strong> : seg.italic ? <em>{seg.text}</em> : seg.text}
            </a>
          );
        }
        if (seg.bold && seg.italic)
          return (
            <strong key={i}>
              <em>{seg.text}</em>
            </strong>
          );
        if (seg.bold) return <strong key={i}>{seg.text}</strong>;
        if (seg.italic) return <em key={i}>{seg.text}</em>;
        return <span key={i}>{seg.text}</span>;
      })}
    </>
  );
}

/** Rendu bloc complet : paragraphes + listes */
export function RichBlock({ text, style }: { text: string; style?: CSSProperties }) {
  const blocks = parseBlocks(text);
  if (blocks.length === 0) return null;

  const elements: ReactNode[] = [];
  let i = 0;

  // Les puces consécutives d'un même type forment une liste
  const takeItems = (type: Block["type"]): string[] => {
    const items: string[] = [];
    for (let next = blocks[i]; next?.type === type; next = blocks[i]) {
      items.push(next.content);
      i++;
    }
    return items;
  };

  for (let block = blocks[i]; block; block = blocks[i]) {
    if (block.type === "ul-item" || block.type === "ol-item") {
      const List = block.type === "ul-item" ? "ul" : "ol";
      const listStyle: CSSProperties =
        block.type === "ul-item"
          ? { margin: "0 0 4px", paddingLeft: 16, listStyleType: "disc" }
          : { margin: "0 0 4px", paddingLeft: 18, listStyleType: "decimal" };
      const items = takeItems(block.type);
      elements.push(
        <List key={`${List}-${i}`} style={listStyle}>
          {items.map((content, j) => (
            <li key={j} style={style}>
              <RichText text={content} />
            </li>
          ))}
        </List>,
      );
    } else {
      elements.push(
        <p key={`p-${i}`} style={{ ...style, margin: "0 0 4px" }}>
          <RichText text={block.content} />
        </p>,
      );
      i++;
    }
  }

  return <>{elements}</>;
}
