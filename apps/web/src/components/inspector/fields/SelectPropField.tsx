interface Option {
  label: string;
  value: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export function SelectPropField({ value, onChange, options }: Props) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
