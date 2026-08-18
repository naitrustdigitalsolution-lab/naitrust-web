import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PublicTrustProfilePage } from './PublicTrustProfilePage';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useMyBusiness } from '../../hooks/useMyBusiness';

export function TrustProfilePage() {
  const { data: business, isLoading } = useMyBusiness();

  return (
    <DashboardLayout title="Trust Profile">
      <div className="mx-auto w-full max-w-9xl">
        {isLoading ? (
          <div className="space-y-4"><Skeleton className="h-48 w-full rounded-3xl" /><Skeleton className="h-36 w-full rounded-3xl" /></div>
        ) : business ? (
          <PublicTrustProfilePage businessIdentifier={business.id} embedded showBackToBusinesses />
        ) : (
          <Card className="rounded-2xl p-8 text-center"><h2 className="font-semibold">Business profile unavailable</h2><p className="mt-2 text-sm text-muted-foreground">Complete your business profile before publishing a Trust Profile.</p></Card>
        )}
      </div>
    </DashboardLayout>
  );
}
