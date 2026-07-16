/**
 * VerificationBanner
 * Prompts the user toward the next verification step on the dashboard.
 * Pure presentation — state derivation lives in libs/utils/verification-status.ts.
 * Info/blue tone only; never a green banner (brand rule: green is a small
 * success accent, not a surface color).
 */

import { MailCheck, ShieldCheck } from 'lucide-react';
import { getVerificationBannerState } from '../../../libs/utils/verification-status';
import type { User } from '../../../libs/store/types';

interface VerificationBannerProps {
  user: User | null;
}

export function VerificationBanner({ user }: VerificationBannerProps) {
  const state = getVerificationBannerState(user);

  if (state.kind === 'none') return null;

  const Icon = state.kind === 'verify-email' ? MailCheck : ShieldCheck;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{state.title}</p>
        <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{state.message}</p>
      </div>
    </div>
  );
}
