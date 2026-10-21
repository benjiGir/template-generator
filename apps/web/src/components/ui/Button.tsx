import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { ObjectKind } from "./ObjectIdentity";

/**
 * - primary : l'action principale de l'écran ou de la fenêtre
 * - secondary : action d'appoint, encadrée (Annuler, Précédent)
 * - ghost : action discrète, sans cadre (barres d'outils, actions de ligne)
 * - dashed : ajout d'un élément dans une liste (« + Ajouter une page »)
 * - link : action dans le texte, soulignée au survol
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "dashed" | "link";

/** Ce que touche l'action : neutre, destructive, ou un type d'objet (sa couleur) */
export type ButtonTone = "neutral" | "danger" | ObjectKind;

export type ButtonSize = "sm" | "md" | "lg";

// Classes complètes : Tailwind ne repère que des noms de classe entiers
const STYLES: Record<ButtonVariant, Record<ButtonTone, string>> = {
  primary: {
    neutral: "bg-ink text-paper hover:bg-ink-soft",
    danger: "bg-danger text-white hover:bg-danger-strong",
    doc: "bg-doc text-white hover:bg-doc-strong",
    tpl: "bg-tpl text-white hover:bg-tpl-strong",
    preset: "bg-preset text-white hover:bg-preset-strong",
  },
  secondary: {
    neutral: "border border-rule-strong bg-white text-ink-soft hover:border-ink hover:text-ink",
    danger: "border border-danger-rule bg-white text-danger hover:bg-danger-tint",
    doc: "border border-doc bg-white text-doc-strong hover:bg-doc-tint",
    tpl: "border border-tpl-rule bg-white text-tpl hover:bg-tpl-tint",
    preset: "border border-preset-rule bg-white text-preset hover:bg-preset-tint",
  },
  ghost: {
    neutral: "text-ink-muted hover:bg-wash hover:text-ink",
    // Une suppression reste discrète jusqu'au survol
    danger: "text-ink-faint hover:bg-danger-tint hover:text-danger",
    doc: "text-doc-strong hover:bg-doc-tint",
    tpl: "text-tpl hover:bg-tpl-tint",
    preset: "text-preset hover:bg-preset-tint",
  },
  dashed: {
    neutral: "border border-dashed border-rule-strong text-ink-subtle hover:bg-paper hover:text-ink",
    danger: "border border-dashed border-danger-rule text-danger hover:bg-danger-tint",
    doc: "border border-dashed border-doc text-doc-strong hover:bg-doc-tint",
    tpl: "border border-dashed border-tpl-rule text-tpl hover:bg-tpl-tint",
    preset: "border border-dashed border-preset-rule text-preset hover:bg-preset-tint",
  },
  link: {
    neutral: "text-ink-subtle hover:text-ink",
    danger: "text-danger",
    doc: "text-doc-strong",
    tpl: "text-tpl",
    preset: "text-preset",
  },
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-7 gap-1 px-2.5 text-xs",
  md: "min-h-9 gap-1.5 px-3.5 text-sm",
  lg: "min-h-[42px] gap-2 px-5 text-base",
};

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export interface ButtonStyle {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  /** Sans effet sur `link`, qui prend la taille du texte autour */
  size?: ButtonSize;
  /** Occupe toute la largeur disponible */
  block?: boolean;
  className?: string;
}

/** Classes d'un bouton, pour un lien (`<Link>`) qui doit en avoir l'apparence */
export function buttonClasses({
  variant = "secondary",
  tone = "neutral",
  size = "md",
  block = false,
  className = "",
}: ButtonStyle = {}): string {
  const shape =
    variant === "link"
      ? "inline-flex items-center gap-1 underline-offset-2 hover:underline"
      : `inline-flex shrink-0 items-center justify-center rounded-sm transition-colors ${SIZES[size]} ${
          variant === "primary" ? "font-semibold" : "font-medium"
        }`;
  return [
    shape,
    STYLES[variant][tone],
    FOCUS,
    "disabled:cursor-not-allowed disabled:opacity-50",
    block ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export interface ButtonProps extends ButtonStyle, Omit<ComponentProps<"button">, "className"> {
  /** Icône placée avant le libellé */
  icon?: ReactNode;
  /** Action en cours : l'icône devient une roue, le bouton est désactivé */
  pending?: boolean;
}

/**
 * Bouton de l'application. `type="button"` par défaut : un bouton ne soumet un formulaire
 * que si on le demande (`type="submit"`).
 */
export function Button({
  variant,
  tone,
  size,
  block,
  className,
  icon,
  pending = false,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={buttonClasses({ variant, tone, size, block, className })}
      {...props}
    >
      {pending ? <Loader2 size={size === "sm" ? 13 : 15} className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

const ICON_SIZES: Record<"sm" | "md", string> = { sm: "p-1", md: "p-1.5" };

// Icônes discrètes au repos ; la couleur du ton apparaît au survol
const ICON_STYLES: Record<ButtonTone, string> = {
  neutral: "text-ink-subtle hover:bg-wash hover:text-ink",
  danger: "text-ink-faint hover:bg-danger-tint hover:text-danger",
  doc: "text-ink-subtle hover:bg-doc-tint hover:text-doc-strong",
  tpl: "text-ink-subtle hover:bg-tpl-tint hover:text-tpl",
  preset: "text-ink-subtle hover:bg-preset-tint hover:text-preset",
};

export interface IconButtonProps extends Omit<ComponentProps<"button">, "className" | "children"> {
  /** Ce que fait le bouton : nom accessible et infobulle */
  label: string;
  icon: ReactNode;
  tone?: ButtonTone;
  size?: "sm" | "md";
  className?: string;
}

/** Bouton réduit à une icône (fermer, supprimer, déplacer…) ; son libellé reste lisible par tous */
export function IconButton({
  label,
  icon,
  tone = "neutral",
  size = "md",
  className = "",
  type = "button",
  title,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      className={`inline-flex shrink-0 items-center justify-center rounded-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${ICON_SIZES[size]} ${ICON_STYLES[tone]} ${FOCUS} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
