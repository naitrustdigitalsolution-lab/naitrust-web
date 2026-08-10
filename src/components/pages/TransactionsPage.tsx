/**
 * TransactionsPage
 * `/app/transactions`: unified history across Instant Payments, Protected
 * Deals and wallet funding/withdrawal/fees, with filters and a detail view.
 * Aggregates existing sources only (see useTransactionHistory): introduces
 * no new transaction data of its own.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
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
  'wallet_funding',
  'withdrawal',
  'protected_funding',
  'milestone_release',
  'final_release',
  'refund',
  'reversal',
  'fee',
];

const CUSTOMER_TYPE_OPTIONS: TransactionType[] = [
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

  const filtered = useMemo(() => {
    const visibleRecords = isCustomer ? records.filter((record) => record.method === 'protected') : records;
    return visibleRecords.filter((r) => {
      if (method !== 'all' && r.method !== method) return false;
      if (type !== 'all' && r.type !== type) return false;
      if (search && !r.counterpartyName.toLowerCase().includes(search.toLowerCase()) && !r.reference.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [records, method, type, search, isCustomer]);

  useEffect(() => {
    setPage(1);
  }, [search, method, type, isCustomer]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const isCredit = (r: TransactionRecord) =>
    ['wallet_funding', 'final_release', 'milestone_release', 'refund', 'incoming_transfer'].includes(r.type);

  return (
    <DashboardLayout title="Transactions">
      <div className="mx-auto w-full max-w-9xl">
        <PageHero
          eyebrow="Money"
          title="Money activity"
          description={isCustomer
            ? 'Payment activity connected only to your Protected Deals.'
            : 'Every Instant Payment, Protected Deal, and business account movement in one place.'}
          icon={Receipt}
        />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by person, business, or reference"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(isCustomer ? CUSTOMER_TYPE_OPTIONS : TYPE_OPTIONS).map((t) => (
                <SelectItem key={t} value={t}>
                  {TRANSACTION_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isCustomer && (
          <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="instant">Instant</TabsTrigger>
              <TabsTrigger value="protected">Protected</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

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
              {isCustomer ? 'No Protected Deal payment activity yet' : 'No transactions match this filter'}
            </p>
          </Card>
        ) : (
          <>
          <Card className="gap-0 overflow-hidden p-0 shadow-sm">
            {paged.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r)}
                className="flex w-full items-center gap-3 border-b px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-accent/40 sm:py-5"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isCredit(r) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                  {isCredit(r) ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{r.counterpartyName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {TRANSACTION_TYPE_LABEL[r.type]} · {format(new Date(r.createdAt), 'd MMM yyyy, HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isCredit(r) ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                    {isCredit(r) ? '+' : '-'}
                    {formatMinorAmount(r.amountMinor, r.currency)}
                  </p>
                  <Badge variant={r.method === 'protected' ? 'default' : 'outline'} className="mt-1 text-[10px]">
                    {r.statusLabel}
                  </Badge>
                </div>
              </button>
            ))}
          </Card>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, total)} of {total} · Page {current} of {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full" disabled={current <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                <ChevronLeft size={15} /> Previous
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" disabled={current >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                Next <ChevronRight size={15} />
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
                <span className="text-muted-foreground">Payment method</span>
                <span className="font-medium capitalize text-foreground">{selected.method}</span>
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
                  View Protected Deal
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
