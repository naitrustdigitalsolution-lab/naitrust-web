/**
 * BeforeYouStartCard
 * The "Before you get started" requirements panel shown on the registration
 * screen: the list adapts to whether a business or a customer is signing up.
 */

import { Check, ShieldCheck } from 'lucide-react';

const signupRequirements = [
  {
    title: 'You are 18 years and older',
    text: 'You must be at least 18 years old to open an account.',
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
    <div className="mx-auto w-full max-w-xl rounded-xl border border-primary/15 bg-white/70 p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck size={16} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-primary">
            Before you get started
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-foreground">
            Confirm you meet these requirements
          </h3>
        </div>
      </div>
      <div className="grid gap-2.5">
        {requirements.map((requirement) => (
          <div key={requirement.title} className="flex gap-2.5">
            <Check className="mt-0.5 shrink-0 text-primary" size={14} />
            <div>
              <h4 className="text-xs font-semibold text-foreground">{requirement.title}</h4>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{requirement.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
