import { ComponentRenderer } from "@template-generator/component-registry/renderer";
import type { Template } from "@template-generator/shared/types/template";

interface TemplateThumbnailProps {
  template: Template;
  /** Width of the thumbnail in px. Height is computed from A4 ratio. Default: 200 */
  width?: number;
}

/** Converts CSS dimension strings (mm, cm, in, px) to pixels */
function dimToPx(value: string): number {
  if (value.endsWith("mm")) return parseFloat(value) * 3.7795275591;
  if (value.endsWith("cm")) return parseFloat(value) * 37.795275591;
  if (value.endsWith("in")) return parseFloat(value) * 96;
  if (value.endsWith("px")) return parseFloat(value);
  return parseFloat(value) || 794;
}

export function TemplateThumbnail({ template, width = 200 }: TemplateThumbnailProps) {
  const pageWidthPx  = dimToPx(template.pageFormat.width);
  const pageHeightPx = dimToPx(template.pageFormat.height);
  const scale = width / pageWidthPx;
  const height = pageHeightPx * scale;

  const firstPage = template.pages[0];

  return (
    <div
      style={{
        width,
        height,
        overflow:      "hidden",
        flexShrink:    0,
        position:      "relative",
        pointerEvents: "none",
        userSelect:    "none",
      }}
    >
      <div
        style={{
          width:           template.pageFormat.width,
          minHeight:       template.pageFormat.height,
          padding:         template.pageFormat.padding,
          fontFamily:      template.theme.typography.fontFamily,
          fontSize:        template.theme.typography.baseFontSize,
          color:           template.theme.colors.text,
          backgroundColor: template.theme.colors.background,
          transform:       `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {firstPage?.children.map((node) => (
          <ComponentRenderer key={node.id} node={node} theme={template.theme} />
        ))}
      </div>
    </div>
  );
}
