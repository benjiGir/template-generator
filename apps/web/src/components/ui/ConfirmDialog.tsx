import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

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
  // L'annulation est l'action par défaut : elle reçoit le focus, Échap annule
  const cancelRef = useRef<HTMLButtonElement>(null);
  const danger = options.tone === "danger";

  return (
    <Dialog
      role="alertdialog"
      labelledBy="confirm-title"
      initialFocus={cancelRef}
      onClose={() => onClose(false)}
      className="max-w-md"
    >
      <div className="flex gap-3 p-5">
        {danger && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-tint text-danger">
            <AlertTriangle size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 id="confirm-title" className="text-sm font-semibold text-ink">
            {options.title}
          </h2>
          {options.message && <div className="mt-1.5 text-sm text-ink-muted">{options.message}</div>}
          {options.consequences && options.consequences.length > 0 && (
            <ul className="mt-3 space-y-1 bg-paper p-3 text-xs text-ink-muted">
              {options.consequences.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-ink-faint">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-rule bg-paper/60 px-5 py-3">
        <Button ref={cancelRef} size="sm" onClick={() => onClose(false)}>
          {options.cancelLabel ?? "Annuler"}
        </Button>
        <Button variant="primary" tone={danger ? "danger" : "neutral"} size="sm" onClick={() => onClose(true)}>
          {options.confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
