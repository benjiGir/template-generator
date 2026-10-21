interface Props {
  /** Nom lu par les lecteurs d'écran (le libellé visible est affiché par PropField) */
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanPropField({ label, value, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
        value ? "bg-tpl" : "bg-rule"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
