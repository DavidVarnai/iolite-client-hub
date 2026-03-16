/**
 * OnboardingContinuityPanel — shown at the top of Strategy / Growth Model tabs
 * when the user navigated there from the onboarding wizard.
 * Communicates current step, progress, next step, and return/pause actions.
 */
import { Check, ArrowLeft, ArrowRight, Pause } from 'lucide-react';
import type { OnboardingContinuation } from '@/types/onboarding';

const STEP_META: Record<string, { label: string; number: number }> = {
  setup: { label: 'Client Setup', number: 1 },
  discovery: { label: 'Discovery', number: 2 },
  strategy: { label: 'Strategy', number: 3 },
  growth_model: { label: 'Growth Model', number: 4 },
  proposal: { label: 'Proposal Ready', number: 5 },
};

const STEP_ORDER = ['setup', 'discovery', 'strategy', 'growth_model', 'proposal'];

interface Props {
  continuation: OnboardingContinuation;
  onReturnToWizard: () => void;
  onPauseOnboarding: () => void;
  onContinueToNext?: () => void;
  /** Whether enough work is done on the current step to consider it "ready" */
  stepReady?: boolean;
}

export default function OnboardingContinuityPanel({
  continuation,
  onReturnToWizard,
  onPauseOnboarding,
  onContinueToNext,
  stepReady,
}: Props) {
  const currentIdx = STEP_ORDER.indexOf(continuation.currentStep);
  const currentMeta = STEP_META[continuation.currentStep];
  const nextMeta = continuation.nextStep ? STEP_META[continuation.nextStep] : null;

  return (
    <div className="mx-6 mt-4 rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
      {/* Progress stepper */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-1">
          {STEP_ORDER.map((step, idx) => {
            const meta = STEP_META[step];
            const isComplete = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;

            return (
              <div key={step} className="flex items-center gap-1 flex-1 last:flex-none">
                {/* Step dot */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${
                      isComplete
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'border-2 border-primary bg-primary/10 text-primary'
                        : 'border-2 border-border text-muted-foreground'
                    }`}
                  >
                    {isComplete ? <Check className="h-3 w-3" /> : meta.number}
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap ${
                      isCurrent ? 'text-primary' : isComplete ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {meta.label}
                  </span>
                </div>
                {/* Connector line */}
                {idx < STEP_ORDER.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-1 ${
                      isComplete ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context bar */}
      <div className="px-5 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-1.5 h-8 rounded-full bg-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Completing onboarding: <span className="text-primary">{currentMeta?.label}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {stepReady && nextMeta
                ? `Ready to continue — next step: ${nextMeta.label}`
                : nextMeta
                ? `Next step: ${nextMeta.label}`
                : 'Final onboarding step'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPauseOnboarding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pause className="h-3 w-3" />
            Pause Onboarding
          </button>
          <button
            onClick={onReturnToWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-background border text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Return to Wizard
          </button>
          {stepReady && onContinueToNext && nextMeta && (
            <button
              onClick={onContinueToNext}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Continue to {nextMeta.label}
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
