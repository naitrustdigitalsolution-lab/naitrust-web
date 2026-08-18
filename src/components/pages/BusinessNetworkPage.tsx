import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, BadgeCheck, ChevronRight, Search, Send, SlidersHorizontal, Star, Trash2, UserRoundPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { AddCounterpartySheet } from '../pieces/business/AddCounterpartySheet';
import { PageHero } from '../pieces/dashboard/PageHero';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import {
  useCounterparties,
  useCreateCounterparty,
  useRemoveCounterparty,
  useToggleFavouriteCounterparty,
} from '../../hooks/useCounterparties';
import {
  COUNTERPARTY_FILTER_OPTIONS,
  counterpartyRelationLabel,
} from '../../libs/counterparties/counterparty-options';
import type { CounterpartyFilter, CreateCounterpartyInput } from '../../libs/counterparties/types';

export function BusinessNetworkPage() {
  const navigate = useNavigate();
  const { data: counterparties, isLoading } = useCounterparties();
  const toggleFavourite = useToggleFavouriteCounterparty();
  const createCounterparty = useCreateCounterparty();
  const removeCounterparty = useRemoveCounterparty();
  const [filter, setFilter] = useState<CounterpartyFilter>('all');
  const [search, setSearch] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const addCounterparty = async (input: CreateCounterpartyInput) => {
    const response = await createCounterparty.mutateAsync(input);
    toast.success(`${response.data.name} was added to your ${input.relation} records.`);
  };

  const removeContact = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from your customer and supplier list?`)) return;
    await removeCounterparty.mutateAsync(id);
    toast.success(`${name} was removed.`);
  };

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
      )
      .sort((left, right) => Number(right.isFavourite) - Number(left.isFavourite) || left.name.localeCompare(right.name));
  }, [counterparties, filter, search]);

  return (
    <DashboardLayout title="Customers & Suppliers">
      <div className="mx-auto w-full max-w-9xl">
        <div className="mb-5 sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <h1 className="min-w-0 truncate text-lg font-bold tracking-tight">Customers &amp; Suppliers</h1>
            <div className="flex shrink-0 gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Pay someone" onClick={() => navigate('/app/payments/send')}><Send size={14} /></Button>
              <Button size="icon" className="h-8 w-8 rounded-full" aria-label="Add new contact" onClick={() => setShowAddContact(true)}><UserRoundPlus size={14} /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Search contacts" onClick={() => setShowMobileSearch((value) => !value)}><Search size={14} /></Button>
              <Button variant={filter !== 'all' ? 'default' : 'outline'} size="icon" className="h-8 w-8 rounded-full" aria-label="Filter contacts" onClick={() => setShowMobileFilter((value) => !value)}><SlidersHorizontal size={14} /></Button>
            </div>
          </div>
        </div>

        <div className="hidden sm:block"><PageHero eyebrow="Business relationships" title="Customers & Suppliers" description="People and businesses you trade with." icon={Users} actions={
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full bg-background/80" onClick={() => navigate('/app/payments/send')}>
                <Send size={15} /> <span className="hidden sm:inline">Pay someone</span><span className="sm:hidden">Pay</span>
              </Button>
              <Button className="rounded-full" onClick={() => setShowAddContact(true)}>
                <UserRoundPlus size={15} /> Add new
              </Button>
            </div>
        } /></div>

        <Card className={`${showMobileSearch || showMobileFilter ? 'flex' : 'hidden'} gap-3 rounded-none border-0 bg-transparent p-0 shadow-none sm:flex sm:rounded-2xl sm:border sm:bg-card sm:p-5 sm:shadow-sm`}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className={`${showMobileSearch ? 'block' : 'hidden'} relative flex-1 sm:block`}>
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search customers or suppliers" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 rounded-xl bg-card pl-10 sm:h-10" />
            </div>
            <div className={`${showMobileFilter ? 'block' : 'hidden'} sm:block`}><Select value={filter} onValueChange={(value) => setFilter(value as CounterpartyFilter)}>
              <SelectTrigger className="h-11 w-full rounded-xl bg-card sm:h-10 sm:w-52"><SelectValue placeholder="Filter contacts" /></SelectTrigger>
              <SelectContent>
                {COUNTERPARTY_FILTER_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select></div>
          </div>
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
          <Card className="mt-4 gap-0 overflow-hidden rounded-none border-x-0 p-0 shadow-none sm:rounded-2xl sm:border-x sm:border-border/70 sm:shadow-sm">
            <div className="hidden grid-cols-[minmax(0,1fr)_130px_190px] gap-2 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground md:grid">
              <span>Contact</span>
              <span>Relationship</span>
              <span>Actions</span>
            </div>
            {filtered.map((contact) => (
              <div key={contact.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/60 px-3 py-4 last:border-b-0 hover:bg-muted/20 md:grid-cols-[minmax(0,1fr)_130px_190px] md:gap-2 md:px-5 md:py-3">
                <button type="button" onClick={() => navigate(`/app/network/${contact.id}`)} className="flex min-w-0 items-center gap-3 text-left">
                  <CounterpartyAvatar name={contact.name} className="h-9 w-9 shrink-0 text-xs md:h-10 md:w-10" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold">{contact.name}</p>
                      {contact.isFavourite && <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />}
                      {(contact.identityVerified || contact.businessVerified) && <BadgeCheck size={13} className="shrink-0 text-emerald-600" />}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{contact.businessName ?? 'Individual account'}</p>
                  </div>
                </button>
                <div className="justify-self-end md:justify-self-auto">
                  <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px] font-normal md:px-2.5 md:text-xs">{counterpartyRelationLabel(contact.relation)}</Badge>
                </div>
                <div className="col-span-2 hidden items-center justify-end gap-1 md:col-span-1 md:flex md:justify-start">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" aria-label={contact.isFavourite ? 'Remove favourite' : 'Mark favourite'} onClick={() => toggleFavourite.mutate(contact.id)}>
                    <Star size={16} className={contact.isFavourite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 rounded-full px-2.5 text-xs font-semibold text-primary md:h-9" onClick={() => navigate('/app/payments/send')}>Pay</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:h-9 md:w-9" aria-label={`Remove ${contact.name}`} disabled={removeCounterparty.isPending} onClick={() => void removeContact(contact.id, contact.name)}><Trash2 size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground md:h-9 md:w-9" aria-label={`Open ${contact.name}`} onClick={() => navigate(`/app/network/${contact.id}`)}><ChevronRight size={16} /></Button>
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

      <AddCounterpartySheet
        open={showAddContact}
        onOpenChange={setShowAddContact}
        isSaving={createCounterparty.isPending}
        onCreate={addCounterparty}
      />
    </DashboardLayout>
  );
}
