/**
 * VerticalStepper
 * Registration-style vertical step rail: connecting line, check circles,
 * "STEP N" eyebrow, title, and description per step. Extracted from the
 * RegistrationPage pattern so authenticated wizards (create deal, future
 * verification) share the same visual language.
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
  return (
    <div className="space-y-0">
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
  );
}
