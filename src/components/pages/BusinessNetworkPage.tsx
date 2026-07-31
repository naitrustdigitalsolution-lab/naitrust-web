import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, BadgeCheck, Search, Send, ShieldCheck, Star, Users } from 'lucide-react';
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
    const query = search.trim().toLowerCase();
    return counterparties
      .filter((contact) => {
        if (filter === 'favourite') return contact.isFavourite;
        if (filter === 'blocked') return contact.isBlocked;
        if (filter === 'all') return !contact.isBlocked;
        return contact.relation === filter && !contact.isBlocked;
      })
      .filter((contact) =>
        !query
        || contact.name.toLowerCase().includes(query)
        || contact.businessName?.toLowerCase().includes(query),
      );
  }, [counterparties, filter, search]);

  return (
    <DashboardLayout title="Customers & Suppliers">
      <div className="mx-auto w-full max-w-9xl">
        <div className="mb-7 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-background to-background px-5 py-6 shadow-sm sm:px-7 lg:px-9 lg:py-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15">
                <Users size={21} />
              </span>
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary">Business relationships</p>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Customers & Suppliers</h1>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
                  Find and manage the people and businesses you trade with.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full bg-background/80" onClick={() => navigate('/app/payments/send')}>
                <Send size={15} /> Pay someone
              </Button>
              <Button className="rounded-full" onClick={() => navigate('/app/deals/new')}>
                <ShieldCheck size={15} /> Protect an order
              </Button>
            </div>
          </div>
        </div>

        <Card className="rounded-2xl p-4 shadow-sm sm:p-5">
          <div className="relative mb-4">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customers or suppliers" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" />
          </div>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
              {FILTERS.map((item) => (
                <TabsTrigger key={item.key} value={item.key} className="rounded-full border data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Card>

        {isLoading ? (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((item) => <Skeleton key={item} className="h-20 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="mt-4 flex flex-col items-center gap-3 rounded-2xl p-10 text-center shadow-sm">
            <Users size={24} className="text-muted-foreground" />
            <p className="font-semibold">No contacts found</p>
            <p className="text-sm text-muted-foreground">Customers and suppliers you transact with will appear here.</p>
          </Card>
        ) : (
          <Card className="mt-4 gap-0 overflow-hidden rounded-2xl p-0 shadow-sm">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_140px_120px_120px] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:grid">
              <span>Contact</span>
              <span>Relationship</span>
              <span>History</span>
              <span className="text-right">Actions</span>
            </div>
            {filtered.map((contact) => (
              <div key={contact.id} className="grid items-center gap-3 border-b px-4 py-3.5 last:border-b-0 hover:bg-muted/30 md:grid-cols-[minmax(0,1.4fr)_140px_120px_120px] md:gap-4 md:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <CounterpartyAvatar name={contact.name} className="h-10 w-10 shrink-0 text-xs" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold">{contact.name}</p>
                      {contact.isFavourite && <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />}
                      {(contact.identityVerified || contact.businessVerified) && <BadgeCheck size={13} className="shrink-0 text-emerald-600" />}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{contact.businessName ?? 'Individual account'}</p>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="rounded-full font-normal">{RELATION_LABEL[contact.relation]}</Badge>
                </div>
                <div className="flex items-center justify-between md:block">
                  <span className="text-xs text-muted-foreground md:hidden">History</span>
                  <p className="text-sm font-medium">{contact.completedDealsCount} completed</p>
                  {contact.ratingAverage != null && <p className="mt-0.5 text-xs text-muted-foreground">★ {contact.ratingAverage.toFixed(1)}</p>}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" aria-label={contact.isFavourite ? 'Remove favourite' : 'Mark favourite'} onClick={() => toggleFavourite.mutate(contact.id)}>
                    <Star size={16} className={contact.isFavourite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'} />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/app/payments/send')}>
                    <Send size={13} /> Pay
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {filter === 'blocked' && filtered.some((contact) => contact.isBlocked) && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Ban size={12} />
            Blocked counterparties cannot invite you to a Protected Deal or send you a payment request.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
