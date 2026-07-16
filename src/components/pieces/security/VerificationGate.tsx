/**
 * VerificationGate
 * Blocks a sensitive flow (e.g. creating a deal) until required verification is
 * complete, listing exactly what's missing with a route to the Security Center.
 * A fintech hard-stop: no protected transaction begins on an unverified account.
 */

import { useNavigate } from 'react-router-dom';
import { BadgeCheck, CircleDashed, Fingerprint, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

type Requirement = 'email' | 'kyc' | 'pin';

const REQ_META: Record<Requirement, { icon: typeof Mail; title: string; body: string }> = {
  email: { icon: Mail, title: 'Verify your email', body: 'Confirm your email address to secure your account.' },
  kyc: { icon: Fingerprint, title: 'Complete identity verification (KYC)', body: 'Verify who you are before moving money.' },
  pin: { icon: KeyRound, title: 'Set a transaction PIN', body: 'A 4-digit PIN protects every money-moving action.' },
};

export function VerificationGate({
  missing,
  title = 'Finish verification to create a deal',
  description = 'For your protection, complete these steps before starting a protected transaction.',
}: {
  missing: Requirement[];
  title?: string;
  description?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card className="gap-5 p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <ul className="divide-y divide-border rounded-xl border">
          {(['email', 'kyc', 'pin'] as Requirement[]).map((req) => {
            const meta = REQ_META[req];
            const Icon = meta.icon;
            const done = !missing.includes(req);
            return (
              <li key={req} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' +
                    (done ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground')
                  }
                >
                  {done ? <BadgeCheck size={18} /> : <Icon size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{meta.title}</p>
                  <p className="text-xs text-muted-foreground">{meta.body}</p>
                </div>
                {done ? (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Done</span>
                ) : (
                  <CircleDashed size={16} className="text-muted-foreground" />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="rounded-full" onClick={() => navigate('/app')}>
            Back to dashboard
          </Button>
          <Button className="rounded-full" onClick={() => navigate('/app/security')}>
            Go to Security Center
          </Button>
        </div>
      </Card>
    </div>
  );
}
