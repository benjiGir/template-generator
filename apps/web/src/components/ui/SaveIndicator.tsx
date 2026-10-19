import { AlertCircle, Loader2 } from "lucide-react";
import type { Autosave } from "@/hooks/useAutosave";

/** Rien quand tout va bien, discret pendant l'envoi, explicite en cas d'échec (US-15) */
export function SaveIndicator({ autosave }: { autosave: Autosave }) {
  if (autosave.status === "error") {
    return (
      <span className="flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700" role="alert">
        <AlertCircle size={13} />
        Enregistrement impossible — vos modifications sont conservées dans cet onglet
        <button onClick={() => void autosave.flush()} className="ml-1 underline hover:no-underline">
          Réessayer
        </button>
      </span>
    );
  }
  if (autosave.status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <Loader2 size={12} className="animate-spin" />
        Enregistrement…
      </span>
    );
  }
  return null;
}
