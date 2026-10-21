import { useEffect } from "react";
import { create } from "zustand";
import { AlertCircle, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  // Le même message n'est pas empilé deux fois (plusieurs échecs d'affilée)
  push: (message) =>
    set((s) =>
      s.toasts.some((t) => t.message === message) ? s : { toasts: [...s.toasts, { id: nextId++, message }] },
    ),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Signale un échec à l'utilisateur ; utilisable hors de React (cache des mutations) */
export function notifyError(message: string) {
  useToastStore.getState().push(message);
}

const DURATION = 6000;

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div
      role="alert"
      className="flex w-96 items-start gap-2.5 border border-rule border-l-[3px] border-l-red-600 bg-white px-3 py-2.5 text-sm text-ink shadow-lg"
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => dismiss(toast.id)}
        className="rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-ink"
        aria-label="Fermer le message"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** Messages d'échec, empilés en bas à droite de l'écran */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[1200] flex flex-col gap-2" aria-live="assertive">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
