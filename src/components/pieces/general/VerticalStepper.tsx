/**
 * VerticalStepper
 * Registration-style step rail: connecting line, check circles, "STEP N"
 * eyebrow, title, and description per step. Extracted from the
 * RegistrationPage pattern so authenticated wizards (create deal, future
 * verification) share the same visual language — including the same
 * mobile/tablet behaviour: a compact horizontal dot-and-connector progress
 * bar below `lg`, and the full vertical rail at `lg` and up.
 */

import { Check } from 'lucide-react';

export interface StepMeta {
  title: string;
  description: string;
}

interface VerticalStepperProps {
  steps: StepMeta[];
  /** 1-based current step. */
  currentStep: number;
}

export function VerticalStepper({ steps, currentStep }: VerticalStepperProps) {
  const active = steps[currentStep - 1];

  return (
    <>
      {/* Mobile/tablet: compact horizontal progress. */}
      <div className="lg:hidden">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isComplete = stepNumber < currentStep;
            return (
              <li key={step.title} className="flex flex-1 items-center last:flex-none">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                    isActive || isComplete
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? <Check size={13} /> : stepNumber}
                </div>
                {index < steps.length - 1 && (
                  <span className={`mx-1.5 h-0.5 flex-1 rounded-full ${isComplete ? 'bg-primary/50' : 'bg-border'}`} />
                )}
              </li>
            );
          })}
        </ol>
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Step {currentStep} of {steps.length}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{active?.title}</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{active?.description}</p>
        </div>
      </div>

      {/* Desktop: detailed vertical stepper. */}
      <div className="hidden space-y-0 lg:block">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <div key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px ${
                    isComplete ? 'bg-primary/50' : 'bg-border'
                  }`}
                />
              )}
              <div
                className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-4 ${
                  isActive || isComplete
                    ? 'border-primary bg-primary text-white'
                    : 'border-background bg-muted text-muted-foreground shadow-sm'
                }`}
              >
                {isComplete ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  Step {stepNumber}
                </p>
                <p className={`mt-0.5 text-sm font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
