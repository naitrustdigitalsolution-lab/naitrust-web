/**
 * TrustProfilePage
 * `/app/trust-profile` — observable platform-activity summary. Explicitly
 * not a credit score: every figure here is a plain count or average of real
 * activity, informational only, not a guarantee, and doesn't replace
 * reviewing actual transaction terms (see rebrand spec's Trust Profile
 * section).
 */

import {
  BadgeCheck,
  Building2,
  Clock,
  Info,
  RefreshCw,
  ShieldCheck,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useTrustProfile } from '../../hooks/useTrustProfile';

const VERIFICATION_LABEL: Record<string, string> = {
  unverified: 'Not verified',
  basic: 'Basic verification',
  full: 'Fully verified',
  none: 'Not started',
  pending: 'Pending review',
  verified: 'Verified',
};

export function TrustProfileSummary() {
  const { data: profile, isLoading } = useTrustProfile();

  return (
    <>
        {isLoading || !profile ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <>
            <Card className="p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={profile.identityVerificationLevel === 'full' ? 'success' : 'outline'} className="gap-1">
                  <ShieldCheck size={12} />
                  Identity: {VERIFICATION_LABEL[profile.identityVerificationLevel]}
                </Badge>
                <Badge variant={profile.businessVerificationLevel === 'verified' ? 'success' : 'outline'} className="gap-1">
                  <Building2 size={12} />
                  Business: {VERIFICATION_LABEL[profile.businessVerificationLevel]}
                </Badge>
                <Badge variant="secondary">
                  Member since {formatDistanceToNow(new Date(profile.memberSince), { addSuffix: true })}
                </Badge>
              </div>
            </Card>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Card className="gap-1 p-4 shadow-sm">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BadgeCheck size={12} /> Completed deals
                </p>
                <p className="text-xl font-bold text-foreground">{profile.completedDealsCount}</p>
              </Card>
              <Card className="gap-1 p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Active deals</p>
                <p className="text-xl font-bold text-foreground">{profile.activeDealsCount}</p>
              </Card>
              <Card className="gap-1 p-4 shadow-sm">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <XCircle size={12} /> Cancelled deals
                </p>
                <p className="text-xl font-bold text-foreground">{profile.cancelledDealsCount}</p>
              </Card>
              <Card className="gap-1 p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Resolved disputes</p>
                <p className="text-xl font-bold text-foreground">{profile.resolvedDisputesCount}</p>
              </Card>
              <Card className="gap-1 p-4 shadow-sm">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={12} /> Repeat counterparties
                </p>
                <p className="text-xl font-bold text-foreground">{profile.repeatCounterpartiesCount}</p>
              </Card>
              {profile.ratingAverage != null && (
                <Card className="gap-1 p-4 shadow-sm">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star size={12} /> Average rating
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {profile.ratingAverage.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">({profile.ratingCount})</span>
                  </p>
                </Card>
              )}
              {profile.averageCompletionDays != null && (
                <Card className="gap-1 p-4 shadow-sm">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} /> Avg. completion time
                  </p>
                  <p className="text-xl font-bold text-foreground">{profile.averageCompletionDays} days</p>
                </Card>
              )}
              {profile.averageResponseTimeHours != null && (
                <Card className="gap-1 p-4 shadow-sm">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <RefreshCw size={12} /> Avg. response time
                  </p>
                  <p className="text-xl font-bold text-foreground">{profile.averageResponseTimeHours}h</p>
                </Card>
              )}
            </div>

            <Card className="mt-4 flex gap-2.5 bg-muted/40 p-4 shadow-none">
              <Info size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                This is not a credit score. It's a summary of your own observable activity on
                NaiTrust — verification status, completed and cancelled deals, disputes, and
                response time. It's informational only, not a guarantee of future performance, and
                doesn't replace reviewing the actual terms of any deal you enter.
              </p>
            </Card>
          </>
        )}
    </>
  );
}

export function TrustProfilePage() {
  return (
    <DashboardLayout title="Trust Profile">
      <div className="mx-auto w-full max-w-3xl">
        <TrustProfileSummary />
      </div>
    </DashboardLayout>
  );
}
