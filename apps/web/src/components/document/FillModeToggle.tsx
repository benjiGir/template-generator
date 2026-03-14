import { List, PenLine } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

export function FillModeToggle() {
  const fillMode = useDocumentStore((s) => s.fillMode);
  const setFillMode = useDocumentStore((s) => s.setFillMode);

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
      <button
        onClick={() => setFillMode("form")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          fillMode === "form"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <List size={13} />
        Formulaire
      </button>
      <button
        onClick={() => setFillMode("inline")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          fillMode === "inline"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <PenLine size={13} />
        Inline
      </button>
    </div>
  );
}
