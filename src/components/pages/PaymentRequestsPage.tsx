/**
 * PaymentRequestsPage
 * `/app/payments/requests`: payment requests you've sent, with status and
 * a way to cancel a pending one. Creating a request happens on the Receive
 * Money screen.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, HandCoins, MoreVertical, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
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
        <div className="mb-5 flex items-center justify-between gap-3 sm:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full" aria-label="Back to Payments" onClick={() => navigate('/app/payments')}><ArrowLeft size={14} /></Button>
            <h1 className="truncate text-lg font-bold tracking-tight">Payment Requests</h1>
          </div>
          <Button size="icon" className="h-8 w-8 shrink-0 rounded-full" aria-label="New payment request" onClick={() => navigate('/app/payments/receive?share=request')}><Plus size={14} /></Button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/payments')}
          className="mb-4 hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          <ArrowLeft size={16} />
          Back to Payments
        </button>

        <div className="mb-6 hidden flex-wrap items-end justify-between gap-3 sm:flex">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Requests</h1>
            <p className="mt-1 text-sm text-muted-foreground">Requests you've sent, and their status.</p>
          </div>
          <Button className="rounded-full" onClick={() => navigate('/app/payments/receive?share=request')}>
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
          <Card className="gap-0 overflow-hidden rounded-none border-x-0 p-0 shadow-none sm:rounded-xl sm:border-x sm:shadow-sm">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center gap-4 border-b px-3 py-4 last:border-b-0 sm:gap-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.requestedFromName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.reason || r.reference} · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-foreground sm:text-sm">{formatMinorAmount(r.amountMinor, r.currency)}</p>
                  <Badge variant={STATUS_VARIANT[r.status]} className="mt-1 px-2 py-0.5 text-[10px] capitalize leading-4 sm:text-xs">
                    {r.status}
                  </Badge>
                </div>
                {r.status === 'pending' && (
                  <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full sm:hidden" aria-label="Request actions"><MoreVertical size={15} /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info('Reminder sent')}><Bell size={14} /> Send reminder</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" disabled={respond.isPending} onClick={() => respond.mutate({ id: r.id, action: 'decline' })}><X size={14} /> Cancel request</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="hidden flex-col gap-1 sm:flex">
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
                  </>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
