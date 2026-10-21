import { useEffect, useRef } from "react";
import { create } from "zustand";
import { AlertCircle, X } from "lucide-react";
import { IconButton } from "./Button";

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
      className="flex w-96 items-start gap-2.5 border border-rule border-l-[3px] border-l-danger bg-white px-3 py-2.5 text-sm text-ink shadow-lg"
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0 text-danger" />
      <p className="flex-1">{toast.message}</p>
      <IconButton label="Fermer le message" icon={<X size={14} />} size="sm" onClick={() => dismiss(toast.id)} />
    </div>
  );
}

/**
 * Messages d'échec, empilés en bas à droite de l'écran. La pile est un popover : comme les fenêtres
 * (<dialog>), elle vit dans la couche supérieure du navigateur, et elle y est replacée en dernier
 * à chaque nouveau message pour rester visible au-dessus d'une fenêtre ouverte.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const ref = useRef<HTMLDivElement>(null);
  const count = toasts.length;

  useEffect(() => {
    const stack = ref.current;
    if (!stack) return;
    if (stack.matches(":popover-open")) stack.hidePopover();
    if (count > 0) stack.showPopover();
  }, [count]);

  return (
    <div
      ref={ref}
      popover="manual"
      aria-live="assertive"
      className="m-0 top-auto left-auto bottom-4 right-4 flex-col gap-2 overflow-visible border-0 bg-transparent p-0 open:flex"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
