interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextPropField({ value, onChange, placeholder }: Props) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-white"
    />
  );
}
