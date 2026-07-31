/**
 * PaymentRequestsPage
 * `/app/payments/requests` — payment requests you've sent, with status and
 * a way to cancel a pending one. Creating a request happens on the Receive
 * Money screen.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, HandCoins } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { usePaymentRequests, useRespondToPaymentRequest } from '../../hooks/usePaymentRequests';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import type { PaymentRequestStatus } from '../../libs/store/types';

const STATUS_VARIANT: Record<PaymentRequestStatus, 'default' | 'secondary' | 'outline' | 'success' | 'destructive'> = {
  pending: 'outline',
  fulfilled: 'success',
  declined: 'destructive',
  expired: 'secondary',
  cancelled: 'secondary',
};

export function PaymentRequestsPage() {
  const navigate = useNavigate();
  const { data: requests, isLoading } = usePaymentRequests();
  const respond = useRespondToPaymentRequest();

  return (
    <DashboardLayout title="Payment Requests">
      <div className="mx-auto w-full max-w-9xl">
        <button
          type="button"
          onClick={() => navigate('/app/payments')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Payments
        </button>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Requests</h1>
            <p className="mt-1 text-sm text-muted-foreground">Requests you've sent, and their status.</p>
          </div>
          <Button className="rounded-full" onClick={() => navigate('/app/payments/receive')}>
            <HandCoins size={15} className="mr-1.5" />
            New request
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : !requests || requests.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HandCoins size={22} />
            </div>
            <p className="font-semibold text-foreground">No payment requests yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Request a specific amount from someone instead of waiting for them to send it.
            </p>
          </Card>
        ) : (
          <Card className="gap-0 overflow-hidden p-0 shadow-sm">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.requestedFromName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.reason || r.reference} · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatMinorAmount(r.amountMinor, r.currency)}</p>
                  <Badge variant={STATUS_VARIANT[r.status]} className="mt-1 capitalize">
                    {r.status}
                  </Badge>
                </div>
                {r.status === 'pending' && (
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info('Reminder sent')}>
                      <Bell size={12} className="mr-1" />
                      Remind
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => respond.mutate({ id: r.id, action: 'decline' })}
                      disabled={respond.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
