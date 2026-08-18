/**
 * TransactionsPage
 * `/app/transactions`: unified account history across order payments,
 * protected releases, wallet funding, refunds, earnings and withdrawals.
 * Aggregates existing sources only (see useTransactionHistory): introduces
 * no new transaction data of its own.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Receipt, Search, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useTransactionHistory } from '../../hooks/useTransactionHistory';
import { useAuth } from '../../libs/auth-context';
import { accountTypeOf } from '../../libs/utils/account';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import { TRANSACTION_TYPE_LABEL } from '../../libs/utils/transaction-history';
import type { TransactionMethod, TransactionRecord, TransactionType } from '../../libs/store/types';

const TYPE_OPTIONS: TransactionType[] = [
  'instant_transfer',
  'incoming_transfer',
  'bill_payment',
  'wallet_funding',
  'currency_exchange',
  'withdrawal',
  'protected_funding',
  'milestone_release',
  'final_release',
  'refund',
  'reversal',
  'fee',
];

const PROVIDER_LABEL: Record<string, string> = { anchor: 'Anchor', kora: 'Kora', mock: 'Naitrust' };
const PAGE_SIZE = 10;

export function TransactionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCustomer = accountTypeOf(user) === 'customer';
  const { records, isLoading } = useTransactionHistory();
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState<'all' | TransactionMethod>('all');
  const [type, setType] = useState<'all' | TransactionType>('all');
  const [selected, setSelected] = useState<TransactionRecord | null>(null);
  const [page, setPage] = useState(1);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (method !== 'all' && r.method !== method) return false;
      if (type !== 'all' && r.type !== type) return false;
      if (search && !r.counterpartyName.toLowerCase().includes(search.toLowerCase()) && !r.reference.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [records, method, type, search]);

  useEffect(() => {
    setPage(1);
  }, [search, method, type]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const isCredit = (r: TransactionRecord) =>
    ['wallet_funding', 'final_release', 'milestone_release', 'refund', 'incoming_transfer'].includes(r.type);

  return (
    <DashboardLayout title="Transactions">
      <div className="mx-auto w-full max-w-9xl">
        <div className="mb-5 flex items-center justify-between gap-3 sm:hidden">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">Wallet and orders</p>
            <h1 className="mt-0.5 text-lg font-bold tracking-tight">Account activity</h1>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Search account activity" onClick={() => setShowMobileSearch((value) => !value)}><Search size={14} /></Button>
            <Button variant={method !== 'all' || type !== 'all' ? 'default' : 'outline'} size="icon" className="h-8 w-8 rounded-full" aria-label="Filter account activity" onClick={() => setShowMobileFilters((value) => !value)}><SlidersHorizontal size={14} /></Button>
          </div>
        </div>
        <div className="hidden sm:block"><PageHero
          eyebrow="Wallet and orders"
          title="Account activity"
          description={isCustomer
            ? 'Track order funding, refunds, earnings and withdrawals from your Naira balance.'
            : 'Track order funding, supplier releases, customer earnings, refunds and withdrawals in one place.'}
          icon={Receipt}
        /></div>

        <div className={`${showMobileSearch || showMobileFilters ? 'flex' : 'hidden'} mb-4 flex-col gap-3 sm:flex sm:flex-row sm:items-center`}>
          <Input
            placeholder="Search supplier, order, or reference"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${showMobileSearch ? 'block' : 'hidden'} h-11 rounded-xl sm:block sm:h-10 sm:max-w-xs`}
          />
          <div className={`${showMobileFilters ? 'block' : 'hidden'} sm:block`}><Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activity types</SelectItem>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {TRANSACTION_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select></div>
        </div>

        <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)} className={`${showMobileFilters ? 'block' : 'hidden'} mb-4 sm:block`}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All activity</TabsTrigger>
            <TabsTrigger value="instant">Wallet</TabsTrigger>
            <TabsTrigger value="protected">Protected orders</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt size={22} />
            </div>
            <p className="font-semibold text-foreground">
              No account activity matches this filter
            </p>
          </Card>
        ) : (
          <>
          <Card className="gap-0 overflow-hidden rounded-none border-x-0 p-0 shadow-none sm:rounded-xl sm:border-x sm:shadow-sm">
            {paged.map((r, index) => {
              const dayLabel = format(new Date(r.createdAt), 'd MMM yyyy');
              const previousDayLabel = index > 0 ? format(new Date(paged[index - 1].createdAt), 'd MMM yyyy') : null;
              return (
              <div key={r.id} className="sm:contents">
              {dayLabel !== previousDayLabel && <p className="border-b bg-muted/35 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:hidden">{dayLabel}</p>}
              <button
                type="button"
                onClick={() => setSelected(r)}
                className="flex w-full items-center gap-4 border-b px-3 py-4 text-left transition-colors hover:bg-accent/40 sm:gap-3 sm:px-5 sm:py-4"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 sm:rounded-lg ${isCredit(r) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                  {isCredit(r) ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{r.counterpartyName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground sm:hidden">
                    {TRANSACTION_TYPE_LABEL[r.type]} · {format(new Date(r.createdAt), 'HH:mm')}
                  </p>
                  <p className="hidden truncate text-xs text-muted-foreground sm:block">
                    {TRANSACTION_TYPE_LABEL[r.type]} · {format(new Date(r.createdAt), 'd MMM yyyy, HH:mm')}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-xs font-semibold sm:text-sm ${isCredit(r) ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                    {isCredit(r) ? '+' : '-'}
                    {formatMinorAmount(r.amountMinor, r.currency)}
                  </p>
                  <Badge variant={r.method === 'protected' ? 'default' : 'outline'} className="mt-1 px-2 py-0.5 text-[10px] leading-4">
                    {r.statusLabel}
                  </Badge>
                </div>
              </button>
              </div>
            );})}
          </Card>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[10px] text-muted-foreground sm:text-sm">
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, total)} of {total} · Page {current} of {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full" disabled={current <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                <ChevronLeft size={15} /> <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" disabled={current >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                <span className="hidden sm:inline">Next</span> <ChevronRight size={15} />
              </Button>
            </div>
          </div>
          </>
        )}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected && TRANSACTION_TYPE_LABEL[selected.type]}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-medium text-foreground">{selected.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Other party</span>
                <span className="font-medium text-foreground">{selected.counterpartyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-foreground">{formatMinorAmount(selected.amountMinor, selected.currency)}</span>
              </div>
              {selected.feeMinor > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-medium text-foreground">{formatMinorAmount(selected.feeMinor, selected.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Activity group</span>
                <span className="font-medium text-foreground">{selected.method === 'protected' ? 'Protected order' : 'Wallet'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-foreground">{selected.statusLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{format(new Date(selected.createdAt), 'd MMM yyyy, HH:mm')}</span>
              </div>
              {/* Provider is internal-administration-only context: shown here as a small
                  muted footnote rather than a prominent field, never exposed as a
                  customer-facing claim about who "holds" the money. */}
              <div className="flex justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>Partner reference</span>
                <span>{PROVIDER_LABEL[selected.provider] ?? selected.provider}</span>
              </div>
              {selected.relatedDealId && (
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => navigate(`/app/deals/${selected.relatedDealId}`)}
                >
                  View order details
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
