import { Select } from "@/components/ui/Field";
interface Option {
  label: string;
  value: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
}

export function SelectPropField({ value, onChange, options }: Props) {
  return (
    <Select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
