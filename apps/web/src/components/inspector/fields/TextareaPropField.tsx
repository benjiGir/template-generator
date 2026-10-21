import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/Field";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextareaPropField({ value, onChange, placeholder }: Props) {
  const [local, setLocal] = useState(value ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setLocal(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), 150);
  };

  return <Textarea value={local} onChange={handleChange} placeholder={placeholder} rows={3} className="resize-y" />;
}
