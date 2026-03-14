import type { CSSProperties } from "react";
import type { Theme } from "@template-generator/shared/types/template";
import type { ImageValue } from "@template-generator/shared/types/component";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";

interface Props {
  theme: Theme;
  image?: ImageValue;
  alt?: string;
  caption?: string;
  width?: "full" | "half" | "third";
  alignment?: "left" | "center" | "right";
}

const WIDTH_MAP: Record<string, string> = {
  full: "100%",
  half: "50%",
  third: "33.333%",
};

function ImageBlock({ theme, image, alt = "", caption = "", width = "full", alignment = "center" }: Props) {
  const src = image?.value ?? null;
  const w = WIDTH_MAP[width] ?? "100%";

  const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };
  const justify = alignMap[alignment] ?? "center";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: justify, marginBottom: 12 }}>
      {src ? (
        <div style={{ width: w }}>
          <img
            src={src}
            alt={alt}
            style={{
              width: "100%",
              borderRadius: theme.borders.radius,
              display: "block",
            }}
          />
          {caption && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 11,
                color: theme.colors.textMuted,
                textAlign: alignment as CSSProperties["textAlign"],
                fontStyle: "italic",
              }}
            >
              {caption}
            </p>
          )}
        </div>
      ) : (
        <div
          style={{
            width: w,
            height: 80,
            backgroundColor: theme.colors.backgroundAlt,
            border: `1px dashed ${theme.colors.border}`,
            borderRadius: theme.borders.radius,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: theme.colors.textMuted,
          }}
        >
          Image
        </div>
      )}
    </div>
  );
}

register({
  type: "image-block",
  label: "Image",
  icon: "Image",
  category: "content",
  description: "Image avec légende, alignement et taille configurable",
  schema: [
    { key: "image", label: "Image", type: "image", defaultValue: { type: "url", value: "" }, group: "Contenu" },
    { key: "alt", label: "Texte alternatif", type: "text", defaultValue: "", group: "Contenu" },
    { key: "caption", label: "Légende", type: "text", defaultValue: "", group: "Contenu" },
    {
      key: "width",
      label: "Largeur",
      type: "select",
      defaultValue: "full",
      group: "Style",
      options: [
        { label: "Pleine largeur", value: "full" },
        { label: "Moitié", value: "half" },
        { label: "Tiers", value: "third" },
      ],
    },
    {
      key: "alignment",
      label: "Alignement",
      type: "select",
      defaultValue: "center",
      group: "Style",
      options: [
        { label: "Gauche", value: "left" },
        { label: "Centre", value: "center" },
        { label: "Droite", value: "right" },
      ],
    },
  ],
  acceptsChildren: false,
  defaultProps: { image: { type: "url", value: "" }, alt: "", caption: "", width: "full", alignment: "center" },
  render: ImageBlock as RegisteredComponent["render"],
});
