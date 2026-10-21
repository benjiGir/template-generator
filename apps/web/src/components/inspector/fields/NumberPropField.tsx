import { Input } from "@/components/ui/Field";
interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function NumberPropField({ value, onChange }: Props) {
  return <Input type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />;
}
