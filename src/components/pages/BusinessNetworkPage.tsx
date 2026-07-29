/**
 * BusinessNetworkPage
 * `/app/network` — saved counterparties: suppliers, buyers, contractors,
 * customers and agents. Factual, observable fields only — no "guaranteed
 * safe"/"risk free" style claims belong here (see guardrails/ui.md and the
 * rebrand spec's Business Network section).
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, Building2, Handshake, Search, Send, ShieldCheck, Star, Store, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useCounterparties, useToggleFavouriteCounterparty } from '../../hooks/useCounterparties';
import type { CounterpartyRelation } from '../../libs/store/types';

const RELATION_LABEL: Record<CounterpartyRelation, string> = {
  supplier: 'Supplier',
  buyer: 'Buyer',
  contractor: 'Contractor',
  customer: 'Customer',
  agent: 'Agent',
  other: 'Other',
};

const FILTERS: { key: 'all' | CounterpartyRelation | 'favourite' | 'blocked'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favourite', label: 'Favourites' },
  { key: 'supplier', label: 'Suppliers' },
  { key: 'contractor', label: 'Contractors' },
  { key: 'customer', label: 'Customers' },
  { key: 'agent', label: 'Agents' },
  { key: 'blocked', label: 'Blocked' },
];

export function BusinessNetworkPage() {
  const navigate = useNavigate();
  const { data: counterparties, isLoading } = useCounterparties();
  const toggleFavourite = useToggleFavouriteCounterparty();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!counterparties) return [];
    return counterparties
      .filter((c) => {
        if (filter === 'favourite') return c.isFavourite;
        if (filter === 'blocked') return c.isBlocked;
        if (filter === 'all') return !c.isBlocked;
        return c.relation === filter && !c.isBlocked;
      })
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [counterparties, filter, search]);
  const activeCounterparties = counterparties?.filter((item) => !item.isBlocked) ?? [];
  const supplierCount = activeCounterparties.filter((item) => item.relation === 'supplier').length;
  const customerCount = activeCounterparties.filter((item) => item.relation === 'customer' || item.relation === 'buyer').length;

  return (
    <DashboardLayout title="Customers & Suppliers">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers & Suppliers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your trusted trading contacts, payment history and next action in one simple place.
          </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/app/payments/send')}><Send size={15} /> Pay someone</Button>
            <Button onClick={() => navigate('/app/deals/new')}><ShieldCheck size={15} /> Protect an order</Button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <Card className="flex-row items-center gap-3 p-4 shadow-sm"><Users className="text-primary" size={20} /><div><p className="text-xl font-bold">{activeCounterparties.length}</p><p className="text-xs text-muted-foreground">Trading contacts</p></div></Card>
          <Card className="flex-row items-center gap-3 p-4 shadow-sm"><Store className="text-primary" size={20} /><div><p className="text-xl font-bold">{supplierCount}</p><p className="text-xs text-muted-foreground">Suppliers</p></div></Card>
          <Card className="flex-row items-center gap-3 p-4 shadow-sm"><Handshake className="text-primary" size={20} /><div><p className="text-xl font-bold">{customerCount}</p><p className="text-xs text-muted-foreground">Customers</p></div></Card>
        </div>

        <div className="relative mb-4">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or business" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-4">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            {FILTERS.map((f) => (
              <TabsTrigger
                key={f.key}
                value={f.key}
                className="rounded-full border data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={22} />
            </div>
            <p className="font-semibold text-foreground">Nobody here yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Counterparties you transact with on Protected Deals or Instant Payments will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <Card key={c.id} className="p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <CounterpartyAvatar name={c.name} className="h-11 w-11 text-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-medium text-foreground">{c.name}</p>
                      {c.isFavourite && <Star size={13} className="fill-amber-400 text-amber-400" />}
                      <Badge variant="outline" className="text-xs">
                        {RELATION_LABEL[c.relation]}
                      </Badge>
                    </div>
                    {c.businessName && <p className="text-xs text-muted-foreground">{c.businessName}</p>}

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.identityVerified && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <ShieldCheck size={11} /> Identity verified
                        </Badge>
                      )}
                      {c.businessVerified && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Building2 size={11} /> Business verified
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        Completed {c.completedDealsCount} protected deal{c.completedDealsCount === 1 ? '' : 's'}
                      </Badge>
                      {c.hasPriorTransactionWithYou && (
                        <Badge variant="secondary" className="text-xs">
                          Previously transacted with you
                        </Badge>
                      )}
                      {c.resolvedDisputesCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {c.resolvedDisputesCount} resolved dispute{c.resolvedDisputesCount === 1 ? '' : 's'}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        Member since {formatDistanceToNow(new Date(c.memberSince), { addSuffix: true })}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {c.ratingAverage != null && (
                      <p className="text-sm font-semibold text-foreground">★ {c.ratingAverage.toFixed(1)}</p>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={c.isFavourite ? 'Remove favourite' : 'Mark favourite'}
                      onClick={() => toggleFavourite.mutate(c.id)}
                    >
                      <Star size={16} className={c.isFavourite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/app/payments/send')}>
                      <Send size={13} /> Pay
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filter === 'blocked' && filtered.some((c) => c.isBlocked) && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Ban size={12} />
            Blocked counterparties cannot invite you to a Protected Deal or send you a payment request.
          </p>
        )}

      </div>
    </DashboardLayout>
  );
}
