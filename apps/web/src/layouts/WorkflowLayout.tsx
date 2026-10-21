import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Info, X } from "lucide-react";
import type { WorkflowDef } from "@/workflow/definitions";
import { useWorkflowSession } from "@/workflow/session";
import { SaveIndicator } from "@/components/ui/SaveIndicator";
import { Button } from "@/components/ui/Button";
import { KIND_STYLES, ObjectTag } from "@/components/ui/ObjectIdentity";
import { useHelp } from "@/help/context";
import { stepHelp } from "@/help/stepHelp";

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

const ALWAYS_OK: StepGuard = { ok: true };

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
  guard = ALWAYS_OK,
  onNext,
  nextLabel = "Suivant",
  finalAction,
  secondaryActions,
  compact = false,
  children,
}: Props) {
  const navigate = useNavigate();
  const session = useWorkflowSession();
  const help = useHelp();
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
    } catch (error) {
      // Déjà signalé à l'utilisateur (message d'erreur global ou indicateur de sauvegarde) :
      // on reste sur l'étape, prêt à réessayer
      console.error(error);
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

  const kindStyle = KIND_STYLES[workflow.kind];

  // Étapes numérotées en chasse fixe ; l'étape courante est soulignée dans la couleur de l'objet produit
  const stepper = (
    <ol className={`flex items-center ${compact ? "gap-3" : "gap-6"}`} aria-label="Étapes">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const clickable = canClick(index) && !pending;
        return (
          <li key={step.key}>
            <button
              type="button"
              onClick={() => clickable && goTo(index)}
              disabled={!clickable}
              aria-current={active ? "step" : undefined}
              title={compact && !active ? step.label : undefined}
              className={`flex items-center gap-2 border-b-[3px] py-1 text-[13px] transition-colors ${
                active
                  ? `${kindStyle.border} font-semibold text-ink`
                  : `border-transparent ${done ? "text-ink-soft" : "text-ink-subtle"} ${clickable ? "hover:text-ink hover:underline" : ""}`
              } ${clickable ? "cursor-pointer" : "cursor-default"}`}
            >
              <span className="font-mono text-xs font-medium">{String(index + 1).padStart(2, "0")}</span>
              {(!compact || active) && <span className="whitespace-nowrap">{step.label}</span>}
              {done && <Check size={12} strokeWidth={3} aria-label="fait" />}
            </button>
          </li>
        );
      })}
    </ol>
  );

  const blockedReason = !guard.ok && guard.reason && (
    <span className="flex items-center gap-1.5 text-xs text-warn-strong">
      <Info size={13} className="shrink-0" />
      {guard.reason}
    </span>
  );

  const previousButton = previous && (
    <Button icon={<ArrowLeft size={14} />} disabled={pending} onClick={() => goTo(currentIndex - 1)}>
      {previous.label}
    </Button>
  );

  // Avancer est à l'encre ; l'action qui termine prend la couleur de l'objet produit
  const primaryButton =
    isLast && finalAction ? (
      <Button
        variant="primary"
        tone={workflow.kind}
        icon={finalAction.icon ?? <Check size={15} />}
        disabled={pending || finalAction.disabled}
        onClick={() => run(finalAction.onClick)}
      >
        {finalAction.label}
      </Button>
    ) : (
      !isLast && (
        <Button variant="primary" disabled={pending || !guard.ok} onClick={handleNext}>
          {nextLabel === "Suivant" && next ? next.label : nextLabel}
          <ArrowRight size={14} />
        </Button>
      )
    );

  const quit = (
    <Link
      to={workflow.listPath}
      className="flex items-center gap-1 px-1 py-1 font-mono text-xs text-ink-soft hover:text-ink hover:underline"
      title={`Quitter et revenir à la liste — ${workflow.listLabel}`}
    >
      <X size={13} />
      Quitter
    </Link>
  );

  // Aide de l'étape en cours, dans un panneau : le travail reste à l'écran
  const helpTarget = stepHelp(workflow.kind, current);
  const helpButton = helpTarget && (
    <Button
      variant="link"
      onClick={() => help.open(helpTarget.slug, helpTarget.sectionId)}
      title="Aide sur cette étape"
      className="px-1 py-1 font-mono text-xs"
    >
      <CircleHelp size={13} />
      Aide
    </Button>
  );

  const heading = (
    <div className="flex min-w-0 items-center gap-2">
      <ObjectTag kind={workflow.kind} />
      <div className="min-w-0 truncate text-sm font-semibold text-ink">{title ?? "Nouveau"}</div>
    </div>
  );

  if (compact) {
    return (
      <div className="flex h-full flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b-2 border-ink bg-paper px-3">
          {quit}
          <div className="w-72 shrink-0">{heading}</div>
          <div className="flex flex-1 justify-center">{stepper}</div>
          <div className="flex items-center gap-2">
            {helpButton}
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
      <header className="flex h-14 shrink-0 items-center gap-4 border-b-2 border-ink bg-paper px-4">
        {quit}
        <div className="w-72 shrink-0">{heading}</div>
        <div className="flex flex-1 justify-center">{stepper}</div>
        <div className="flex w-56 shrink-0 items-center justify-end gap-3">
          {session?.autosave && <SaveIndicator autosave={session.autosave} />}
          {helpButton}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">{children}</div>

      <footer className="flex h-14 shrink-0 items-center justify-between gap-4 border-t border-ink bg-paper px-6">
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
