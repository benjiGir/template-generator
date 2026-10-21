import { createContext, useContext, useId, useMemo, type ComponentProps, type ReactNode } from "react";

interface FieldControl {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

const FieldContext = createContext<FieldControl | null>(null);

interface FieldProps {
  label: ReactNode;
  children: ReactNode;
  /** Précision sous le champ */
  hint?: ReactNode;
  /** Erreur de saisie : remplace la précision et marque le champ invalide */
  error?: ReactNode;
  /** Élément placé à droite du libellé (compteur, lien…) */
  aside?: ReactNode;
  className?: string;
}

/**
 * Un libellé, son champ, une précision ou une erreur. Le contrôle placé dedans (`Input`, `Textarea`,
 * `Select`) est relié au libellé et au message sans identifiant à écrire : un clic sur le libellé
 * place le curseur, le lecteur d'écran annonce la précision.
 */
export function Field({ label, children, hint, error, aside, className = "" }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  const invalid = error !== undefined && error !== null && error !== false;
  const describedBy = message ? messageId : undefined;
  const control = useMemo<FieldControl>(() => ({ id, describedBy, invalid }), [id, describedBy, invalid]);

  return (
    <div className={className}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-ink-muted">
          {label}
        </label>
        {aside}
      </div>
      <FieldContext.Provider value={control}>{children}</FieldContext.Provider>
      {message && (
        <p id={messageId} className={`mt-1 text-[11px] ${invalid ? "text-danger" : "text-ink-subtle"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

/** Attributs qui relient un contrôle au `Field` qui l'entoure ; ceux passés explicitement l'emportent */
function useFieldAttributes(props: Pick<ComponentProps<"input">, "id" | "aria-describedby" | "aria-invalid">) {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field?.id,
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field?.invalid || undefined),
  };
}

/** sm : panneaux de l'Atelier (inspecteur) ; md : formulaires des écrans */
export type ControlSize = "sm" | "md";

const CONTROL_SIZES: Record<ControlSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
};

function controlClasses(size: ControlSize, className: string) {
  return `w-full rounded-sm border border-rule bg-white text-ink placeholder:text-ink-faint focus:border-focus focus:outline-none disabled:bg-paper disabled:text-ink-subtle aria-invalid:border-danger ${CONTROL_SIZES[size]} ${className}`;
}

type ControlProps<E extends "input" | "textarea" | "select"> = Omit<ComponentProps<E>, "size"> & {
  size?: ControlSize;
};

export function Input({ size = "sm", className = "", ...props }: ControlProps<"input">) {
  return <input {...props} {...useFieldAttributes(props)} className={controlClasses(size, className)} />;
}

export function Textarea({ size = "sm", className = "", ...props }: ControlProps<"textarea">) {
  return <textarea {...props} {...useFieldAttributes(props)} className={controlClasses(size, className)} />;
}

export function Select({ size = "sm", className = "", ...props }: ControlProps<"select">) {
  return <select {...props} {...useFieldAttributes(props)} className={controlClasses(size, className)} />;
}
