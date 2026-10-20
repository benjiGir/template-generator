import { List, MousePointerClick } from "lucide-react";
import { useDocumentStore } from "@/store/document-store";

const MODES = [
  { key: "form",   icon: List,              label: "Formulaire",  hint: "remplir champ par champ" },
  { key: "inline", icon: MousePointerClick, label: "Sur la page", hint: "relire et corriger en contexte" },
] as const;

/** Deux façons de travailler sur les mêmes données ; le choix est mémorisé */
export function FillModeToggle() {
  const fillMode = useDocumentStore((s) => s.fillMode);
  const setFillMode = useDocumentStore((s) => s.setFillMode);

  return (
    <div className="flex items-center gap-6" role="radiogroup" aria-label="Façon de remplir">
      {MODES.map(({ key, icon: Icon, label, hint }) => (
        <button
          key={key}
          role="radio"
          aria-checked={fillMode === key}
          onClick={() => setFillMode(key)}
          className={`flex items-center gap-1.5 border-b-2 py-1.5 text-[13px] transition-colors ${
            fillMode === key ? "border-ink font-semibold text-ink" : "border-transparent text-gray-700 hover:text-ink"
          }`}
        >
          <Icon size={13} />
          {label}
          <span className="hidden font-normal text-gray-500 xl:inline">— {hint}</span>
        </button>
      ))}
    </div>
  );
}
