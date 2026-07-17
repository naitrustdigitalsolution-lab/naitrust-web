/**
 * RegistrationStepper
 * Progress indicator for the multi-step registration flow. Renders a compact
 * horizontal progress bar on mobile (numbered dots + connectors, with the
 * current step called out beneath) and a detailed vertical stepper on desktop.
 */

import { Check } from 'lucide-react';

interface RegistrationStepperProps {
  steps: { title: string; description: string }[];
  currentStep: number;
}

export function RegistrationStepper({ steps, currentStep }: RegistrationStepperProps) {
  const active = steps[currentStep - 1];

  return (
    <>
      {/* Mobile: compact horizontal progress. */}
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
                    : 'border-white bg-muted text-muted-foreground shadow-sm'
                }`}
              >
                {isComplete ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </div>
              <div>
                <p className={`text-sm font-semibold uppercase ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Step {stepNumber}
                </p>
                <p className={`mt-0.5 text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
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
