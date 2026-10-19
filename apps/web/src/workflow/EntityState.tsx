import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex h-full items-center justify-center gap-2 bg-gray-50 text-sm text-gray-400">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

export function NotFoundState({ message, backTo, backLabel }: { message: string; backTo: string; backLabel: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-gray-50">
      <p className="text-sm text-gray-600">{message}</p>
      <Link to={backTo} className="text-sm font-medium text-blue-600 hover:underline">
        ← {backLabel}
      </Link>
    </div>
  );
}
