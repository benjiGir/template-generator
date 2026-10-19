import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Info, X } from "lucide-react";
import type { WorkflowDef } from "@/workflow/definitions";
import { useWorkflowSession } from "@/workflow/session";
import { SaveIndicator } from "@/components/ui/SaveIndicator";

export interface StepGuard {
  ok: boolean;
  /** Pourquoi on ne peut pas avancer : affiché à côté du bouton */
  reason?: string;
}

export interface FinalAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

interface Props {
  workflow: WorkflowDef;
  /** Clé de l'étape courante */
  current: string;
  /** Identifiant de l'entité en cours (template, document, « new » pour un preset) */
  entityId?: string;
  /** Nom de ce qui est en cours de création */
  title?: ReactNode;
  /** Première étape où l'on peut revenir : l'étape 1 crée l'entité, on n'y revient pas */
  firstNavigableStep?: number;
  /** Condition pour passer à l'étape suivante */
  guard?: StepGuard;
  /** Remplace la navigation par défaut vers l'étape suivante */
  onNext?: () => void | Promise<void>;
  nextLabel?: string;
  /** Action de la dernière étape, différenciée des « Suivant » */
  finalAction?: FinalAction;
  secondaryActions?: ReactNode;
  /** Étape longue et immersive : le stepper se réduit à une barre fine */
  compact?: boolean;
  children: ReactNode;
}

export function WorkflowLayout({
  workflow,
  current,
  entityId,
  title,
  firstNavigableStep,
  guard = { ok: true },
  onNext,
  nextLabel = "Suivant",
  finalAction,
  secondaryActions,
  compact = false,
  children,
}: Props) {
  const navigate = useNavigate();
  const session = useWorkflowSession();
  const [pending, setPending] = useState(false);

  const steps = workflow.steps;
  const currentIndex = steps.findIndex((s) => s.key === current);
  const minIndex = firstNavigableStep ?? (entityId ? 1 : 0);
  const isLast = currentIndex === steps.length - 1;
  const previous = currentIndex > minIndex ? steps[currentIndex - 1] : undefined;
  const next = steps[currentIndex + 1];

  const run = async (action: () => void | Promise<void>) => {
    if (pending) return;
    setPending(true);
    try {
      await action();
    } finally {
      setPending(false);
    }
  };

  const goTo = (index: number) =>
    run(async () => {
      const step = steps[index];
      if (!step) return;
      await session?.flush();
      navigate(step.path(entityId ?? ""));
    });

  const handleNext = () => {
    if (!guard.ok) return;
    if (onNext) return run(onNext);
    if (next) return goTo(currentIndex + 1);
  };

  const canClick = (index: number) =>
    index >= minIndex && (index < currentIndex || (index === currentIndex + 1 && guard.ok && !onNext));

  const stepper = (
    <ol className={`flex items-center ${compact ? "gap-1" : "gap-0"}`} aria-label="Étapes">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const clickable = canClick(index) && !pending;
        return (
          <li key={step.key} className="flex items-center">
            <button
              type="button"
              onClick={() => clickable && goTo(index)}
              disabled={!clickable}
              aria-current={active ? "step" : undefined}
              title={compact && !active ? step.label : undefined}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                active
                  ? "text-blue-700"
                  : done
                  ? clickable ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900" : "text-gray-500"
                  : clickable ? "text-gray-500 hover:bg-gray-100" : "text-gray-400"
              } ${clickable ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? "bg-blue-600 text-white"
                    : done
                    ? "bg-emerald-100 text-emerald-700"
                    : "border border-gray-300 text-gray-400"
                }`}
              >
                {done ? <Check size={11} strokeWidth={3} /> : index + 1}
              </span>
              {(!compact || active) && <span className="whitespace-nowrap">{step.label}</span>}
            </button>
            {index < steps.length - 1 && <span className={`mx-1 h-px ${compact ? "w-3" : "w-6"} ${done ? "bg-emerald-300" : "bg-gray-200"}`} />}
          </li>
        );
      })}
    </ol>
  );

  const blockedReason = !guard.ok && guard.reason && (
    <span className="flex items-center gap-1.5 text-xs text-amber-700">
      <Info size={13} className="shrink-0" />
      {guard.reason}
    </span>
  );

  const previousButton = previous && (
    <button
      onClick={() => goTo(currentIndex - 1)}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      <ArrowLeft size={14} />
      {previous.label}
    </button>
  );

  const primaryButton = isLast && finalAction ? (
    <button
      onClick={() => run(finalAction.onClick)}
      disabled={pending || finalAction.disabled}
      className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {finalAction.icon ?? <Check size={15} />}
      {finalAction.label}
    </button>
  ) : (
    !isLast && (
      <button
        onClick={handleNext}
        disabled={pending || !guard.ok}
        className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel === "Suivant" && next ? next.label : nextLabel}
        <ArrowRight size={14} />
      </button>
    )
  );

  const quit = (
    <Link
      to={workflow.listPath}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      title={`Quitter et revenir à la liste — ${workflow.listLabel}`}
    >
      <X size={14} />
      Quitter
    </Link>
  );

  const heading = (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{workflow.space}</p>
      <p className="truncate text-sm font-semibold text-gray-900">{title ?? "Nouveau"}</p>
    </div>
  );

  if (compact) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3">
          {quit}
          <div className="w-48 shrink-0">{heading}</div>
          <div className="flex flex-1 justify-center">{stepper}</div>
          <div className="flex items-center gap-2">
            {session?.autosave && <SaveIndicator autosave={session.autosave} />}
            {blockedReason}
            {secondaryActions}
            {previousButton}
            {primaryButton}
          </div>
        </header>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4">
        {quit}
        <div className="w-56 shrink-0">{heading}</div>
        <div className="flex flex-1 justify-center">{stepper}</div>
        <div className="flex w-56 shrink-0 justify-end">
          {session?.autosave && <SaveIndicator autosave={session.autosave} />}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">{children}</div>

      <footer className="flex h-14 shrink-0 items-center justify-between gap-4 border-t border-gray-200 bg-white px-6">
        <div>{previousButton}</div>
        <div className="flex items-center gap-3">
          {blockedReason}
          {secondaryActions}
          {primaryButton}
        </div>
      </footer>
    </div>
  );
}
