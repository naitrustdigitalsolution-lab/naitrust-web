/**
 * TransactionList
 * Renders the user's safe deals as a single divided "holdings"-style card with
 * loading, error, empty, and populated states. Purely presentational — data
 * ownership stays with the caller (DashboardPage owns the useTransactions query).
 */

import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, ShieldPlus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { CounterpartyAvatar } from './CounterpartyAvatar';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import type { SafeDealSummary } from '../../../libs/store/types';

interface TransactionListProps {
  deals: SafeDealSummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onCreate: () => void;
  onSelect?: (deal: SafeDealSummary) => void;
}

function LoadingRows() {
  return (
    <Card className="gap-0 p-0 shadow-sm" aria-label="Loading property transactions">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between gap-4 border-b px-5 py-4 last:border-b-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      ))}
    </Card>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ShieldPlus size={24} />
      </div>
      <p className="font-semibold text-foreground">No active property transactions yet</p>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        Create a property transaction to document terms, payment records, and supporting
        evidence in one transaction room.
      </p>
      <Button onClick={onCreate} className="mt-2 rounded-full">
        New property transaction
      </Button>
    </Card>
  );
}

function DealRow({ deal, onSelect }: { deal: SafeDealSummary; onSelect?: (deal: SafeDealSummary) => void }) {
  const interactive = !!onSelect;
  return (
    <div
      {...(interactive
        ? {
            role: 'button' as const,
            tabIndex: 0,
            onClick: () => onSelect!(deal),
            onKeyDown: (e: React.KeyboardEvent) => e.key === 'Enter' && onSelect!(deal),
          }
        : {})}
      className={
        'flex items-center justify-between gap-4 border-b px-5 py-4 last:border-b-0 ' +
        (interactive ? 'cursor-pointer transition-colors hover:bg-accent/40' : '')
      }
    >
      <div className="flex min-w-0 items-center gap-3">
        <CounterpartyAvatar name={deal.counterpartyName} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{deal.counterpartyName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {deal.reference} · {formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span className="hidden text-sm font-semibold text-foreground tabular-nums sm:inline">
          {formatMinorAmount(deal.amountMinor, deal.currency)}
        </span>
        <TransactionStatusBadge status={deal.status} />
        {interactive && <ChevronRight size={16} className="text-muted-foreground" />}
      </div>
    </div>
  );
}

export function TransactionList({ deals, isLoading, isError, onCreate, onSelect }: TransactionListProps) {
  if (isLoading) return <LoadingRows />;

  if (isError) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground shadow-sm">
        We could not load your property transactions. Please refresh to try again.
      </Card>
    );
  }

  if (!deals || deals.length === 0) return <EmptyState onCreate={onCreate} />;

  return (
    <Card className="gap-0 overflow-hidden p-0 shadow-sm" aria-label="Your property transactions">
      {deals.map((deal) => (
        <DealRow key={deal.id} deal={deal} onSelect={onSelect} />
      ))}
    </Card>
  );
}
