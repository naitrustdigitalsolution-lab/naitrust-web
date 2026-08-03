import { BadgeCheck, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { PublicTrustProfilePage } from './PublicTrustProfilePage';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useMyBusiness } from '../../hooks/useMyBusiness';

export function TrustProfilePage() {
  const { data: business, isLoading } = useMyBusiness();
  const publicSlug = business?.slug ?? business?.id;

  return (
    <DashboardLayout title="Trust Profile">
      <div className="mx-auto w-full max-w-9xl">
        <PageHero
          eyebrow="Your public business reputation"
          title="Trust Profile"
          description="Review the verified business information, transaction activity, and customer feedback people see when they check your business on Naitrust."
          icon={BadgeCheck}
          tone="soft-blue"
          actions={publicSlug ? <Button className="rounded-md" onClick={() => window.open(`/trust/${publicSlug}`, '_blank', 'noopener,noreferrer')}><ExternalLink size={15} /> View public profile</Button> : undefined}
        />

        {isLoading ? (
          <div className="space-y-4"><Skeleton className="h-48 w-full rounded-3xl" /><Skeleton className="h-36 w-full rounded-3xl" /></div>
        ) : business ? (
          <PublicTrustProfilePage businessIdentifier={business.id} embedded showBackToBusinesses={false} />
        ) : (
          <Card className="rounded-2xl p-8 text-center"><h2 className="font-semibold">Business profile unavailable</h2><p className="mt-2 text-sm text-muted-foreground">Complete your business profile before publishing a Trust Profile.</p></Card>
        )}
      </div>
    </DashboardLayout>
  );
}
