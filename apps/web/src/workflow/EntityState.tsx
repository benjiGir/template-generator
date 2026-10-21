import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex h-full items-center justify-center gap-2 bg-paper text-sm text-ink-faint">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

export function NotFoundState({ message, backTo, backLabel }: { message: string; backTo: string; backLabel: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-paper">
      <p className="text-sm text-ink-muted">{message}</p>
      <Link to={backTo} className="text-sm font-medium text-ink underline underline-offset-2">
        ← {backLabel}
      </Link>
    </div>
  );
}
