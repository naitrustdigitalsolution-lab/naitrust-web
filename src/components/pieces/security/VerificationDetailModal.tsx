/**
 * VerificationDetailModal
 * A read-only summary of a completed verification — what was checked, when, and
 * for which entity. Shown when a verified user taps "View" (never the form).
 */

import { BadgeCheck, Building2, CalendarCheck, Check, Fingerprint, X } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';

interface VerificationCheck {
  label: string;
  done: boolean;
}

interface VerificationDetailModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  isBusiness: boolean;
  /** Business or person name. */
  name: string;
  /** Business type / account descriptor. */
  subtitle?: string;
  rcNumber?: string;
  category?: string;
  /** ISO date the verification completed (best-effort in mock). */
  verifiedAt?: string;
  checks: VerificationCheck[];
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function VerificationDetailModal({
  open,
  onOpenChange,
  isBusiness,
  name,
  subtitle,
  rcNumber,
  category,
  verifiedAt,
  checks,
}: VerificationDetailModalProps) {
  const passed = checks.filter((c) => c.done).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgeCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            Verification details
          </DialogTitle>
          <DialogDescription>A summary of what was verified — for your records.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Entity */}
          <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isBusiness ? <Building2 size={20} /> : <Fingerprint size={20} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{subtitle ?? (isBusiness ? 'Business' : 'Individual')}</p>
            </div>
            <Badge variant="success" className="ml-auto shrink-0">
              Verified
            </Badge>
          </div>

          {/* Facts */}
          <dl className="divide-y rounded-xl border text-sm">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarCheck size={14} /> Verified on
              </dt>
              <dd className="font-medium text-foreground">{formatDate(verifiedAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium text-foreground">{isBusiness ? 'Business (KYB)' : 'Individual (KYC)'}</dd>
            </div>
            {isBusiness && rcNumber && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                <dt className="text-muted-foreground">CAC / RC number</dt>
                <dd className="font-medium text-foreground">{rcNumber}</dd>
              </div>
            )}
            {isBusiness && category && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="min-w-0 text-right font-medium text-foreground">{category}</dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <dt className="text-muted-foreground">Checks passed</dt>
              <dd className="font-medium text-foreground">
                {passed} of {checks.length}
              </dd>
            </div>
          </dl>

          {/* Individual checks */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">What was verified</p>
            <div className="grid gap-2">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  {c.done ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Check size={12} />
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <X size={12} />
                    </span>
                  )}
                  <span className={c.done ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
