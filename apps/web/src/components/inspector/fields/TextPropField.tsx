import { Input } from "@/components/ui/Field";
interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextPropField({ value, onChange, placeholder }: Props) {
  return <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}
