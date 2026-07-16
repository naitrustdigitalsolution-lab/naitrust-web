/**
 * DealsPage
 * The dedicated safe-deals list (`/app/deals`): a robust toolbar over the deal
 * list — text search (counterparty / reference), status filter chips, a
 * created-date range, and client-side pagination. Rows open the transaction
 * room. Reuses TransactionList for consistent row presentation.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { TransactionList } from '../pieces/dashboard/TransactionList';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useTransactions } from '../../hooks/useTransactions';
import { dealsNeedingAction } from '../../libs/utils/safe-deal-presentation';
import type { SafeDealStatus, SafeDealSummary } from '../../libs/store/types';

type Filter = 'all' | 'active' | 'action' | 'completed' | 'disputed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'action', label: 'Needs action' },
  { key: 'disputed', label: 'Disputed' },
  { key: 'completed', label: 'Completed' },
];

const CLOSED: SafeDealStatus[] = ['draft', 'completed', 'paid_out', 'refunded', 'cancelled'];
const PAGE_SIZE = 6;

function byStatus(deals: SafeDealSummary[], filter: Filter): SafeDealSummary[] {
  switch (filter) {
    case 'active':
      return deals.filter((d) => !CLOSED.includes(d.status));
    case 'action':
      return dealsNeedingAction(deals);
    case 'disputed':
      return deals.filter((d) => d.status === 'disputed');
    case 'completed':
      return deals.filter((d) => d.status === 'completed' || d.status === 'paid_out');
    default:
      return deals;
  }
}

export function DealsPage() {
  const navigate = useNavigate();
  const { data: deals, isLoading, isError } = useTransactions();

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!deals) return undefined;
    let list = byStatus(deals, filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.counterpartyName.toLowerCase().includes(q) || d.reference.toLowerCase().includes(q),
      );
    }
    if (from) {
      const fromTs = new Date(from).getTime();
      list = list.filter((d) => new Date(d.createdAt).getTime() >= fromTs);
    }
    if (to) {
      // Include the whole "to" day.
      const toTs = new Date(to).getTime() + 86_400_000 - 1;
      list = list.filter((d) => new Date(d.createdAt).getTime() <= toTs);
    }
    return list;
  }, [deals, filter, search, from, to]);

  // Reset to first page whenever the result set changes.
  useEffect(() => {
    setPage(1);
  }, [filter, search, from, to]);

  const total = filtered?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paged = filtered?.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const countFor = (key: Filter) => (deals ? byStatus(deals, key).length : 0);
  const hasFilters = !!search || !!from || !!to || filter !== 'all';
  const clearAll = () => {
    setFilter('all');
    setSearch('');
    setFrom('');
    setTo('');
  };

  return (
    <DashboardLayout title="Safe deals">
      <div className="mx-auto w-full max-w-9xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Safe deals</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every protected transaction you're part of, in one place.
            </p>
          </div>
          <Button className="rounded-full" onClick={() => navigate('/app/deals/new')}>
            <Plus size={16} className="mr-1" />
            Create safe deal
          </Button>
        </div>

        {/* Toolbar */}
        <div className="mb-4 space-y-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Label htmlFor="deal-search" className="sr-only">
                Search deals
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="deal-search"
                  placeholder="Search by counterparty or reference…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <Label htmlFor="from" className="text-xs">
                  From
                </Label>
                <Input id="from" type="date" value={from} max={to || undefined} className="mt-1" onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="to" className="text-xs">
                  To
                </Label>
                <Input id="to" type="date" value={to} min={from || undefined} className="mt-1" onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={
                    'rounded-full border px-3 py-1 text-sm font-medium transition-colors ' +
                    (active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent/40')
                  }
                >
                  {f.label}
                  {!isLoading && <span className="ml-1.5 opacity-80">{countFor(f.key)}</span>}
                </button>
              );
            })}
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Result meta */}
        {!isLoading && !isError && (
          <p className="mb-2 text-xs text-muted-foreground">
            {total === 0 ? 'No deals match your filters' : `Showing ${paged?.length ?? 0} of ${total} deals`}
          </p>
        )}

        {!isLoading && !isError && (deals?.length ?? 0) > 0 && total === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
            <Search size={22} className="text-muted-foreground" />
            <p className="font-semibold text-foreground">No deals match your filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try a different search, status, or date range.
            </p>
            <Button variant="outline" className="rounded-full" onClick={clearAll}>
              Clear filters
            </Button>
          </div>
        ) : (
          <TransactionList
            deals={paged}
            isLoading={isLoading}
            isError={isError}
            onCreate={() => navigate('/app/deals/new')}
            onSelect={(deal) => navigate(`/app/deals/${deal.id}`)}
          />
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {current} of {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={current <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} className="mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={current >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
                <ChevronRight size={15} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
