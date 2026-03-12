import { parseMarkdown } from "@template-generator/shared/utils/markdown";

interface Props {
  text: string;
}

export function RichText({ text }: Props) {
  const segments = parseMarkdown(text);

  return (
    <>
      {segments.map((seg, i) =>
        seg.bold ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>
      )}
    </>
  );
}
