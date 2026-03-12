import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";
import { resolveColor, resolveLightBg } from "../../color-map";

interface Props {
  theme: Theme;
  title?: string;
  color?: string;
  paragraphs?: string[];
  benefitsLabel?: string;
  benefits?: string[];
  result?: string;
  suite?: string;
}

function DetailBlock({
  theme,
  title = "Titre",
  color = "blue",
  paragraphs = [],
  benefitsLabel = "Bénéfices",
  benefits = [],
  result,
  suite,
}: Props) {
  const accentColor = resolveColor(color, theme);
  const lightBg = resolveLightBg(color, theme);

  return (
    <div
      style={{
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: `0 ${theme.borders.radius}px ${theme.borders.radius}px 0`,
        backgroundColor: theme.colors.backgroundAlt,
        padding: "14px 16px",
        marginBottom: 12,
      }}
    >
      {/* Titre */}
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: accentColor,
          margin: "0 0 10px",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>

      {/* Paragraphes */}
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            margin: "0 0 6px",
            fontSize: 12,
            lineHeight: 1.6,
            color: theme.colors.text,
          }}
        >
          {p}
        </p>
      ))}

      {/* Bénéfices */}
      {benefits.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: theme.colors.textLight,
              margin: "0 0 6px",
            }}
          >
            {benefitsLabel}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {benefits.map((b, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  backgroundColor: lightBg,
                  color: accentColor,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 99,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                ✓ {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div
          style={{
            marginTop: 12,
            backgroundColor: `${accentColor}10`,
            borderRadius: 4,
            padding: "8px 12px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.6,
              color: theme.colors.text,
            }}
          >
            {result}
          </p>
        </div>
      )}

      {/* Suite */}
      {suite && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 11,
            lineHeight: 1.6,
            color: theme.colors.textLight,
            fontStyle: "italic",
          }}
        >
          <span style={{ fontStyle: "normal" }}>→ </span>
          {suite}
        </p>
      )}
    </div>
  );
}

register({
  type: "detail-block",
  label: "Bloc de détails",
  icon: "LayoutList",
  category: "content",
  description: "Bloc structuré avec titre, contenu, bénéfices et résultat",
  schema: [
    { key: "title", label: "Titre", type: "text", defaultValue: "Titre du chantier", group: "Contenu" },
    { key: "paragraphs", label: "Paragraphes", type: "list", defaultValue: [], group: "Contenu" },
    { key: "benefits", label: "Bénéfices", type: "list", defaultValue: [], group: "Contenu" },
    { key: "benefitsLabel", label: "Label bénéfices", type: "text", defaultValue: "Bénéfices", group: "Contenu" },
    { key: "result", label: "Résultat", type: "textarea", defaultValue: "", group: "Contenu" },
    { key: "suite", label: "Suite", type: "textarea", defaultValue: "", group: "Contenu" },
    {
      key: "color",
      label: "Couleur",
      type: "select",
      defaultValue: "blue",
      group: "Style",
      options: [
        { label: "Bleu", value: "blue" },
        { label: "Vert", value: "green" },
        { label: "Ambre", value: "amber" },
        { label: "Rouge", value: "red" },
      ],
    },
  ],
  acceptsChildren: false,
  defaultProps: {
    title: "Titre du chantier",
    color: "blue",
    paragraphs: [],
    benefitsLabel: "Bénéfices",
    benefits: [],
    result: "",
    suite: "",
  },
  render: DetailBlock as RegisteredComponent["render"],
});
