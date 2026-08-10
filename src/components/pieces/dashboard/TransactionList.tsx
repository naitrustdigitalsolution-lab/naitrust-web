/**
 * TransactionList
 * Renders the user's safe deals as a single divided "holdings"-style card with
 * loading, error, empty, and populated states. Purely presentational: data
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
  mobileOverflow?: boolean;
}

function LoadingRows() {
  return (
    <Card className="gap-0 p-0 shadow-sm" aria-label="Loading Protected Deals">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
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
      <p className="font-semibold text-foreground">No active Protected Deals yet</p>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        Create a Protected Deal to document terms, payment records, and supporting
        evidence in one deal room.
      </p>
      <Button onClick={onCreate} className="mt-2 rounded-full">
        New Protected Deal
      </Button>
    </Card>
  );
}

function DealRow({ deal, onSelect, mobileOverflow = false }: { deal: SafeDealSummary; onSelect?: (deal: SafeDealSummary) => void; mobileOverflow?: boolean }) {
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
        (mobileOverflow
          ? 'flex items-center gap-3 border-b px-5 py-4 last:border-b-0 '
          : 'flex flex-col items-stretch gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:px-5 ') +
        (interactive ? 'cursor-pointer transition-colors hover:bg-accent/40' : '')
      }
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <CounterpartyAvatar name={deal.counterpartyName} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{deal.title}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{deal.counterpartyName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {deal.reference} · {formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className={mobileOverflow
        ? 'grid shrink-0 grid-cols-[minmax(110px,auto)_150px_18px] items-center gap-3'
        : 'grid w-full grid-cols-[1fr_auto_18px] items-center gap-2 pl-12 sm:w-auto sm:shrink-0 sm:grid-cols-[minmax(110px,auto)_150px_18px] sm:gap-3 sm:pl-0'}>
        <span className="text-sm font-semibold text-foreground tabular-nums sm:text-right">{formatMinorAmount(deal.amountMinor, deal.currency)}</span>
        <div className="justify-self-end"><TransactionStatusBadge status={deal.status} /></div>
        {interactive && <ChevronRight size={16} className="justify-self-end text-muted-foreground" />}
      </div>
    </div>
  );
}

export function TransactionList({ deals, isLoading, isError, onCreate, onSelect, mobileOverflow = false }: TransactionListProps) {
  if (isLoading) return <LoadingRows />;

  if (isError) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground shadow-sm">
        We could not load your Protected Deals. Please refresh to try again.
      </Card>
    );
  }

  if (!deals || deals.length === 0) return <EmptyState onCreate={onCreate} />;

  const list = (
    <Card className={`gap-0 overflow-hidden p-0 shadow-sm ${mobileOverflow ? 'min-w-[44rem]' : ''}`} aria-label="Your Protected Deals">
      {deals.map((deal) => (
        <DealRow key={deal.id} deal={deal} onSelect={onSelect} mobileOverflow={mobileOverflow} />
      ))}
    </Card>
  );

  if (mobileOverflow) {
    return (
      <div className="-mx-1 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]" role="region" aria-label="Scrollable Protected Deals table" tabIndex={0}>
        {list}
      </div>
    );
  }

  return list;
}
