import { useRef, type ChangeEvent } from "react";
import type { ImageValue } from "@template-generator/shared/types/component";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

interface Props {
  label: string;
  value: ImageValue;
  onChange: (v: ImageValue) => void;
}

export function ImagePropField({ label, value, onChange }: Props) {
  const val = value;
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      onChange({ type: "base64", value: String(reader.result) });
    });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const src = val.value || null;

  return (
    <div>
      <label className="block text-xs font-medium text-ink-muted mb-1.5">{label}</label>

      {/* Preview */}
      {src && (
        <div className="mb-2 relative group">
          <img src={src} alt="" className="w-full rounded border border-rule object-contain max-h-32" />
          <button
            type="button"
            onClick={() => onChange({ type: "url", value: "" })}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-danger text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity"
          >
            Supprimer
          </button>
        </div>
      )}

      {/* URL input */}
      <div className="flex gap-1.5 mb-1.5">
        <Input
          value={val.type === "url" ? val.value : ""}
          onChange={(e) => onChange({ type: "url", value: e.target.value })}
          placeholder="https://…"
          aria-label={`${label} : adresse de l'image`}
          className="flex-1"
        />
      </div>

      {/* File upload */}
      <Button variant="dashed" size="sm" block onClick={() => fileRef.current?.click()}>
        Choisir un fichier…
      </Button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
