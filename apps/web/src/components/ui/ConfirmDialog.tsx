import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  /** Conséquences annoncées (en cascade, irréversibles…) */
  consequences?: ReactNode[];
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm doit être utilisé sous <ConfirmProvider>");
  return confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);

  const confirm = useCallback<Confirm>((options) => new Promise((resolve) => setRequest({ ...options, resolve })), []);

  const close = (ok: boolean) => {
    request?.resolve(ok);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && <ConfirmModal options={request} onClose={close} />}
    </ConfirmContext.Provider>
  );
}

function ConfirmModal({ options, onClose }: { options: ConfirmOptions; onClose: (ok: boolean) => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const danger = options.tone === "danger";

  // L'annulation est l'action par défaut : elle reçoit le focus, Échap annule
  useEffect(() => {
    cancelRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={() => onClose(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3 p-5">
          {danger && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={18} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 id="confirm-title" className="text-sm font-semibold text-gray-900">
              {options.title}
            </h2>
            {options.message && <div className="mt-1.5 text-sm text-gray-600">{options.message}</div>}
            {options.consequences && options.consequences.length > 0 && (
              <ul className="mt-3 space-y-1 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                {options.consequences.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 rounded-b-xl border-t border-gray-100 bg-gray-50/60 px-5 py-3">
          <button
            ref={cancelRef}
            onClick={() => onClose(false)}
            className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ink"
          >
            {options.cancelLabel ?? "Annuler"}
          </button>
          <button
            onClick={() => onClose(true)}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              danger ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : "bg-ink hover:bg-gray-800 focus:ring-ink"
            }`}
          >
            {options.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
