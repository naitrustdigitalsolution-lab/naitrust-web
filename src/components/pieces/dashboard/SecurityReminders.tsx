/**
 * SecurityReminders
 * Dashboard security prompts driven by the security store. Hard requirements
 * (email, KYC, transaction PIN) block deal creation and show as a prominent
 * banner; soft measures (phone, 2FA, liveness) don't block usage but nudge the
 * user to harden their account. Renders nothing when fully secured.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/button';
import { useSecurity } from '../../../hooks/useSecurity';

const HARD_LABEL: Record<string, string> = {
  email: 'Verify email',
  kyc: 'Complete identity verification (KYC)',
  pin: 'Set a transaction PIN',
};

export function SecurityReminders() {
  const navigate = useNavigate();
  const security = useSecurity();

  const hard = security.missingForDeal;
  const soft: string[] = [];
  if (!security.phoneVerified) soft.push('Verify your phone number');
  if (!security.twoFactorEnabled) soft.push('Enable authenticator 2FA');
  if (!security.livenessFresh) soft.push('Run a liveness check');

  if (hard.length === 0 && soft.length === 0) return null;

  if (hard.length > 0) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Finish verification to create property transactions
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {hard.map((h) => HARD_LABEL[h]).join(' · ')}
              </p>
            </div>
          </div>
          <Button className="shrink-0 rounded-full" onClick={() => navigate('/app/security')}>
            Complete now
            <ArrowRight size={15} className="ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Boost your account security</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{soft.join(' · ')}</p>
          </div>
        </div>
        <Button variant="outline" className="shrink-0 rounded-full" onClick={() => navigate('/app/security')}>
          Security Center
        </Button>
      </div>
    </div>
  );
}
