import type { CSSProperties } from "react";
import { parseMarkdown, parseBlocks } from "@template-generator/shared/utils/markdown";
import type { Block } from "@template-generator/shared/utils/markdown";

export function RichText({ text }: { text: string }) {
  const segments = parseMarkdown(text);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.href) {
          return (
            <a key={i} href={seg.href} style={{ color: "inherit", textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">
              {seg.bold ? <strong>{seg.text}</strong> : seg.italic ? <em>{seg.text}</em> : seg.text}
            </a>
          );
        }
        if (seg.bold && seg.italic) return <strong key={i}><em>{seg.text}</em></strong>;
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

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i] as Block;

    if (block.type === "ul-item") {
      const items: string[] = [];
      while (i < blocks.length && blocks[i]?.type === "ul-item") {
        items.push(blocks[i]!.content);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "0 0 4px", paddingLeft: 16, listStyleType: "disc" }}>
          {items.map((content, j) => (
            <li key={j} style={style}><RichText text={content} /></li>
          ))}
        </ul>
      );
    } else if (block.type === "ol-item") {
      const items: string[] = [];
      while (i < blocks.length && blocks[i]?.type === "ol-item") {
        items.push(blocks[i]!.content);
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: "0 0 4px", paddingLeft: 16 }}>
          {items.map((content, j) => (
            <li key={j} style={style}><RichText text={content} /></li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <p key={`p-${i}`} style={{ ...style, margin: "0 0 4px" }}>
          <RichText text={block.content} />
        </p>
      );
      i++;
    }
  }

  return <>{elements}</>;
}
