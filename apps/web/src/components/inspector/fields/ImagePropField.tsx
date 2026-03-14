import { useRef, type ChangeEvent } from "react";
import type { ImageValue } from "@template-generator/shared/types/component";

interface Props {
  label: string;
  value: ImageValue;
  onChange: (v: unknown) => void;
}

const EMPTY: ImageValue = { type: "url", value: "" };

export function ImagePropField({ label, value, onChange }: Props) {
  const val: ImageValue = { ...EMPTY, ...((value as ImageValue | undefined) ?? {}) };
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ type: "base64", value: String(reader.result) });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const src = val.value || null;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>

      {/* Preview */}
      {src && (
        <div className="mb-2 relative group">
          <img
            src={src}
            alt=""
            className="w-full rounded border border-gray-200 object-contain max-h-32"
          />
          <button
            type="button"
            onClick={() => onChange({ type: "url", value: "" })}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity"
          >
            Supprimer
          </button>
        </div>
      )}

      {/* URL input */}
      <div className="flex gap-1.5 mb-1.5">
        <input
          type="text"
          value={val.type === "url" ? val.value : ""}
          onChange={(e) => onChange({ type: "url", value: e.target.value })}
          placeholder="https://…"
          className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* File upload */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full py-1 text-xs text-gray-500 border border-dashed border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        Choisir un fichier…
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
