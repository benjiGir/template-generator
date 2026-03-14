import { Check } from "lucide-react";

interface Step {
  key: string;
  label: string;
  isComplete: boolean;
  isActive: boolean;
}

interface WorkflowLayoutProps {
  title: string;
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onStepClick: (stepIndex: number) => void;
  canGoNext: boolean;
  nextLabel?: string;
  footerActions?: React.ReactNode;
  children: React.ReactNode;
}

export function WorkflowLayout({
  title,
  steps,
  currentStep,
  onNext,
  onPrevious,
  onStepClick,
  canGoNext,
  nextLabel,
  footerActions,
  children,
}: WorkflowLayoutProps) {
  const isLastStep = currentStep === steps.length - 1;
  const resolvedNextLabel = nextLabel ?? (isLastStep ? "Terminer" : "Suivant");

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-[52px] shrink-0 flex items-center px-4 border-b border-gray-200 bg-white gap-4">
        <span className="text-sm font-semibold text-gray-900 w-40 shrink-0">{title}</span>

        {/* Stepper */}
        <div className="flex-1 flex items-center justify-center gap-0">
          {steps.map((step, index) => {
            const isClickable = step.isComplete || step.isActive;
            return (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    step.isActive
                      ? "text-blue-600"
                      : step.isComplete
                      ? "text-green-600 hover:text-green-700 cursor-pointer"
                      : "text-gray-400 cursor-default"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      step.isActive
                        ? "bg-blue-600 text-white"
                        : step.isComplete
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step.isComplete && !step.isActive ? <Check size={10} /> : index + 1}
                  </span>
                  {step.label}
                </button>

                {index < steps.length - 1 && (
                  <div className="w-6 h-px bg-gray-200 mx-1" />
                )}
              </div>
            );
          })}
        </div>

        <div className="w-40 shrink-0" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Footer */}
      <div className="h-14 shrink-0 flex items-center justify-between px-6 border-t border-gray-200 bg-white">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>

        <div className="flex items-center gap-2">
          {footerActions}
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {resolvedNextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
