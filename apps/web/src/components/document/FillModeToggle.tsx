import { List, MousePointerClick } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

const MODES = [
  { key: "form",   icon: List,              label: "Formulaire",   hint: "remplir champ par champ" },
  { key: "inline", icon: MousePointerClick, label: "Sur la page",  hint: "relire et corriger en contexte" },
] as const;

/** Deux façons de travailler sur les mêmes données ; le choix est mémorisé */
export function FillModeToggle() {
  const fillMode = useDocumentStore((s) => s.fillMode);
  const setFillMode = useDocumentStore((s) => s.setFillMode);

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1" role="radiogroup" aria-label="Façon de remplir">
      {MODES.map(({ key, icon: Icon, label, hint }) => (
        <button
          key={key}
          role="radio"
          aria-checked={fillMode === key}
          onClick={() => setFillMode(key)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
            fillMode === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Icon size={13} />
          <span className="font-medium">{label}</span>
          <span className="hidden text-gray-400 xl:inline">— {hint}</span>
        </button>
      ))}
    </div>
  );
}
