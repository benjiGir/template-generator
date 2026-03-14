import type { Theme } from "@template-generator/shared/types/template";
import { register } from "../../registry";
import type { RegisteredComponent } from "../../registry";
import { RichBlock } from "../../rich-text";

interface Props {
  theme: Theme;
  quote?: string;
  author?: string;
  role?: string;
}

function QuoteBlock({ theme, quote = "", author = "", role = "" }: Props) {
  return (
    <div
      style={{
        borderLeft: `4px solid ${theme.colors.primary}`,
        backgroundColor: theme.colors.backgroundAlt,
        padding: "14px 18px",
        borderRadius: `0 ${theme.borders.radius}px ${theme.borders.radius}px 0`,
        marginBottom: 12,
      }}
    >
      {/* Quote mark */}
      <span
        style={{
          display: "block",
          fontSize: 40,
          lineHeight: 0.8,
          color: theme.colors.primary,
          fontFamily: "Georgia, serif",
          marginBottom: 8,
        }}
      >
        "
      </span>

      <RichBlock
        text={quote}
        style={{
          margin: "0 0 10px",
          fontSize: 14,
          lineHeight: 1.7,
          color: theme.colors.text,
          fontStyle: "italic",
        }}
      />

      {(author || role) && (
        <div style={{ borderTop: `1px solid ${theme.colors.borderLight}`, paddingTop: 8, marginTop: 4 }}>
          {author && (
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: theme.colors.text }}>
              {author}
            </p>
          )}
          {role && (
            <p style={{ margin: 0, fontSize: 11, color: theme.colors.textMuted }}>
              {role}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

register({
  type: "quote-block",
  label: "Citation",
  icon: "MessageCircle",
  category: "content",
  description: "Bloc de citation avec auteur et rôle",
  schema: [
    { key: "quote", label: "Citation", type: "richtext", defaultValue: "Votre citation ici…" },
    { key: "author", label: "Auteur", type: "text", defaultValue: "" },
    { key: "role", label: "Rôle / Fonction", type: "text", defaultValue: "" },
  ],
  acceptsChildren: false,
  defaultProps: { quote: "Votre citation ici…", author: "", role: "" },
  render: QuoteBlock as RegisteredComponent["render"],
});
