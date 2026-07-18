/**
 * ProfilePage
 * The user's own profile (`/app/profile`): identity card, verification
 * checklist, and reputation summary — a two-column layout so the space works
 * on desktop. Public reputation profiles are a later slice (plan Group G).
 */

import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CircleDashed,
  Mail,
  Phone,
  Settings,
  ShieldCheck,
  Star,
  User as UserIcon,
} from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { BusinessProfileCard } from '../pieces/business/BusinessProfileCard';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '../../libs/auth-context';
import { useReputation } from '../../hooks/useReputation';
import { useTransactions } from '../../hooks/useTransactions';
import { useSecurity } from '../../hooks/useSecurity';
import { accountTypeLabel, accountTypeOf } from '../../libs/utils/account';
import { summarizeDeals } from '../../libs/utils/safe-deal-presentation';

function initialsOf(name: string | undefined): string {
  if (!name) return 'NT';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const ROLE_LABEL: Record<string, string> = {
  customer: 'Customer',
  business: 'Business',
  'business-member': 'Team member',
  admin: 'Admin',
};

function VerificationRow({
  label,
  verified,
  hint,
}: {
  label: string;
  verified: boolean;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        {verified ? (
          <BadgeCheck size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <CircleDashed size={18} className="shrink-0 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {!verified && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <Badge variant={verified ? 'success' : 'outline'}>{verified ? 'Verified' : 'Pending'}</Badge>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const security = useSecurity();
  const { data: reputation, isLoading: repLoading } = useReputation();
  const { data: deals, isLoading: dealsLoading } = useTransactions();

  const counts = deals ? summarizeDeals(deals) : undefined;
  const statsLoading = repLoading || dealsLoading;
  const isBusiness = accountTypeOf(user) === 'business';

  return (
    <DashboardLayout title="Profile">
      <div className="mx-auto w-full max-w-9xl">
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_1.4fr]">
          {/* Identity card */}
          <Card className="gap-4 p-6 shadow-sm lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                {initialsOf(user?.name)}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-foreground">{user?.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline">{accountTypeLabel(accountTypeOf(user))}</Badge>
                  {ROLE_LABEL[user?.role ?? ''] === 'Team member' && (
                    <Badge variant="secondary">Team member</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={15} className="shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={15} className="shrink-0" />
                <span>{user?.phone || 'No phone number added'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserIcon size={15} className="shrink-0" />
                <span>Naitrust member</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => navigate('/app/settings')}
            >
              <Settings size={15} className="mr-1.5" />
              Edit in settings
            </Button>
          </Card>

          <div className="flex flex-col gap-6">
            {/* Business profile (business accounts only) */}
            {isBusiness && <BusinessProfileCard />}

            {/* Verification checklist */}
            <Card className="gap-0 p-0 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b bg-muted/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Verification & security</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-full text-xs"
                  onClick={() => navigate('/app/security')}
                >
                  Manage
                </Button>
              </div>
              {security.livenessPhoto && (
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  <img
                    src={security.livenessPhoto}
                    alt="Liveness capture"
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Liveness photo on file</p>
                    <p className="text-xs text-muted-foreground">
                      Shared with counterparties to confirm your presence.
                    </p>
                  </div>
                </div>
              )}
              <VerificationRow
                label="Email address"
                verified={security.emailVerified}
                hint="Confirm your email to create property transactions."
              />
              <VerificationRow
                label={isBusiness ? 'Business verification (KYC)' : 'Identity (KYC)'}
                verified={security.kycStatus === 'verified'}
                hint={isBusiness ? 'Verify your CAC and a director.' : 'Verify your identity to transact.'}
              />
              <VerificationRow
                label="Liveness check"
                verified={security.livenessFresh}
                hint="Run a live photo check (valid 30 days)."
              />
              <VerificationRow
                label="Transaction PIN"
                verified={security.pinSet}
                hint="Set a 4-digit PIN for money-moving actions."
              />
              <VerificationRow
                label="Two-factor (authenticator)"
                verified={security.twoFactorEnabled}
                hint="Add an authenticator app for sign-in."
              />
            </Card>

            {/* Reputation summary */}
            <Card className="gap-0 p-0 shadow-sm">
              <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-3">
                <Star size={16} className="text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Reputation</h2>
              </div>
              {statsLoading ? (
                <div className="grid grid-cols-3 divide-x divide-border">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2 px-4 py-5">
                      <Skeleton className="h-7 w-12" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 divide-x divide-border">
                  <div className="px-4 py-5">
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {counts?.completed ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Completed property transactions</p>
                  </div>
                  <div className="px-4 py-5">
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {reputation && reputation.ratingCount > 0
                        ? reputation.ratingAverage?.toFixed(1)
                        : '—'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Average rating</p>
                  </div>
                  <div className="px-4 py-5">
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {reputation?.ratingCount ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Verified reviews</p>
                  </div>
                </div>
              )}
              <p className="border-t px-4 py-3 text-xs leading-5 text-muted-foreground">
                Reputation is built from completed property transactions and verified activity on the platform —
                it cannot be bought or edited.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
