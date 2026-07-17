/**
 * BeforeYouStartCard
 * The "Before you get started" requirements panel shown on the registration
 * screen — the list adapts to whether a business or a customer is signing up.
 */

import { Check, ShieldCheck } from 'lucide-react';

const signupRequirements = [
  {
    title: 'You are 16 years and older',
    text: 'You must be at least 16 years old to open an account.',
  },
  {
    title: 'You have a valid BVN or NIN',
    text: 'Use a valid NIN or BVN to help us verify your identity quickly.',
  },
  {
    title: 'You can complete face verification',
    text: 'Make sure you are in a well-lit area and follow the onscreen instructions for the best results.',
  },
];

export function BeforeYouStartCard({ registrationType }: { registrationType: 'business' | 'customer' }) {
  const requirements =
    registrationType === 'business'
      ? [
          { title: 'Authorised business representative', text: 'You must be an owner, director, or person authorised to register the business.' },
          { title: 'Business registration details', text: 'Have the CAC registration details and business contact information available.' },
          { title: 'Representative identity check', text: 'The representative may need a valid NIN or BVN and a short liveness check.' },
        ]
      : signupRequirements;

  return (
    <div className="rounded-2xl border border-primary/15 bg-white/70 p-5 shadow-sm dark:bg-background/70">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Before you get started
          </p>
          <h3 className="mt-1 text-base font-semibold text-foreground">
            Confirm you meet these requirements
          </h3>
        </div>
      </div>
      <div className="grid gap-3">
        {requirements.map((requirement) => (
          <div key={requirement.title} className="flex gap-3">
            <Check className="mt-0.5 shrink-0 text-primary" size={18} />
            <div>
              <h4 className="text-sm font-semibold text-foreground">{requirement.title}</h4>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{requirement.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
