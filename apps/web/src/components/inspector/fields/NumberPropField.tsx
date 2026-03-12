interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function NumberPropField({ value, onChange }: Props) {
  return (
    <input
      type="number"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 bg-white"
    />
  );
}
