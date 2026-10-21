import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([
  { key: "title", label: "Titre", type: "text", defaultValue: "Et pour la suite ?" },
  { key: "intro", label: "Introduction", type: "textarea", defaultValue: "" },
  { key: "items", label: "Éléments", type: "list", defaultValue: [] },
  { key: "summary", label: "Résumé", type: "text", defaultValue: "" },
]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function NextSection({ theme, title, intro, items, summary }: Props) {
  return (
    <div
      style={{
        backgroundColor: `${theme.colors.primary}08`,
        border: `${theme.borders.width}px solid ${theme.colors.primary}20`,
        borderRadius: theme.borders.radius,
        padding: "16px 20px",
        marginTop: 12,
      }}
    >
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: theme.colors.primary,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>

      {intro && (
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 12,
            lineHeight: 1.6,
            color: theme.colors.text,
          }}
        >
          {intro}
        </p>
      )}

      {items.length > 0 && (
        <ul style={{ margin: "0 0 10px", paddingLeft: 0, listStyle: "none" }}>
          {items.map((item, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 6,
                fontSize: 12,
                lineHeight: 1.55,
                color: theme.colors.text,
              }}
            >
              <span
                style={{
                  color: theme.colors.primary,
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                →
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {summary && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            color: theme.colors.textLight,
            fontStyle: "italic",
          }}
        >
          {summary}
        </p>
      )}
    </div>
  );
}

defineComponent({
  type: "next-section",
  label: 'Section "Et pour la suite ?"',
  icon: "ListTodo",
  category: "data",
  description: "Section de prochaines étapes avec liste",
  schema,
  acceptsChildren: false,
  render: NextSection,
});
