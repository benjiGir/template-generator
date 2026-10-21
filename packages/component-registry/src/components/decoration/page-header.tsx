import type { Theme } from "@template-generator/shared/types/template";
import type { PropsOf } from "@template-generator/shared/types/component";
import { defineComponent, defineSchema } from "../../registry";

const schema = defineSchema([
  { key: "brandName", label: "Nom de marque", type: "text", role: "structure", defaultValue: "Marque" },
  { key: "brandSub", label: "Sous-titre", type: "text", role: "structure", defaultValue: "" },
  { key: "showChevron", label: "Afficher chevrons", type: "boolean", defaultValue: true },
]);

type Props = PropsOf<typeof schema> & { theme: Theme };

function PageHeader({ theme, brandName, brandSub, showChevron }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingBottom: 14,
        borderBottom: `2px solid ${theme.colors.border}`,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: theme.colors.primary,
            letterSpacing: "-0.5px",
          }}
        >
          {brandName}
        </span>
        {brandSub && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: theme.colors.textLight,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {brandSub}
          </span>
        )}
      </div>

      {/* Chevrons décoratifs */}
      {showChevron && (
        <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 0 L12 12 L0 24"
            stroke={theme.colors.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
          />
          <path
            d="M14 0 L26 12 L14 24"
            stroke={theme.colors.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <path
            d="M28 0 L40 12 L28 24"
            stroke={theme.colors.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
          <path
            d="M42 0 L54 12 L42 24"
            stroke={theme.colors.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="1"
          />
        </svg>
      )}
    </div>
  );
}

defineComponent({
  type: "page-header",
  label: "En-tête de page",
  icon: "PanelTop",
  category: "decoration",
  description: "En-tête avec nom de marque et décoration",
  schema,
  acceptsChildren: false,
  render: PageHeader,
});
