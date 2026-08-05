import { BadgeCheck, Check, Plus, Search, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  COUNTERPARTY_RELATION_OPTIONS,
  counterpartyRelationLabel,
} from '../../../libs/counterparties/counterparty-options';
import type { CreateCounterpartyInput } from '../../../libs/counterparties/types';
import type { CounterpartyProfile } from '../../../libs/store/types';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import { CounterpartyAvatar } from '../dashboard/CounterpartyAvatar';

interface SavedCounterpartyPickerDialogProps {
  counterparties: CounterpartyProfile[];
  isLoading: boolean;
  selectedProfileIds: string[];
  onSelect: (counterparty: CounterpartyProfile) => void;
}

type RelationshipFilter = 'all' | CreateCounterpartyInput['relation'];
const selectableRelationships = new Set(COUNTERPARTY_RELATION_OPTIONS.map((option) => option.value));

export function SavedCounterpartyPickerDialog({
  counterparties,
  isLoading,
  selectedProfileIds,
  onSelect,
}: SavedCounterpartyPickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [relationship, setRelationship] = useState<RelationshipFilter>('all');
  const selectedIds = useMemo(() => new Set(selectedProfileIds), [selectedProfileIds]);

  const availableContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return counterparties
      .filter((counterparty) => !counterparty.isBlocked && selectableRelationships.has(counterparty.relation as CreateCounterpartyInput['relation']))
      .filter((counterparty) => relationship === 'all' || counterparty.relation === relationship)
      .filter((counterparty) => {
        if (!query) return true;
        return [
          counterparty.name,
          counterparty.businessName,
          counterparty.email,
          counterparty.phone,
          counterpartyRelationLabel(counterparty.relation),
        ].some((value) => value?.toLowerCase().includes(query));
      });
  }, [counterparties, relationship, search]);

  const selectContact = (counterparty: CounterpartyProfile) => {
    if (selectedIds.has(counterparty.id)) return;
    onSelect(counterparty);
    setOpen(false);
    setSearch('');
    setRelationship('all');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-full">
          <UsersRound size={14} /> Choose saved contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-5 pb-4 pt-5 sm:px-6">
          <DialogTitle>Choose a saved contact</DialogTitle>
          <DialogDescription>
            Search your customers, suppliers, contractors and agents, then add one to this deal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 px-5 pt-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:px-6">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search name, business, email or phone"
              autoFocus
            />
          </div>
          <Select value={relationship} onValueChange={(value) => setRelationship(value as RelationshipFilter)}>
            <SelectTrigger><SelectValue placeholder="All relationships" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All relationships</SelectItem>
              {COUNTERPARTY_RELATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-[24rem] overflow-y-auto px-5 pb-5 pt-3 sm:px-6">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((item) => <Skeleton key={item} className="h-18 rounded-xl" />)}
            </div>
          ) : availableContacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <UsersRound className="mx-auto text-muted-foreground" size={23} />
              <p className="mt-3 text-sm font-semibold">No matching saved contacts</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Try another search or enter the counterparty manually in the deal form.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              {availableContacts.map((counterparty) => {
                const selected = selectedIds.has(counterparty.id);
                const contact = counterparty.email ?? counterparty.phone ?? 'No invitation contact saved';
                return (
                  <button
                    key={counterparty.id}
                    type="button"
                    disabled={selected}
                    onClick={() => selectContact(counterparty)}
                    className="flex w-full items-center gap-3 border-b px-3 py-3 text-left transition last:border-b-0 hover:bg-muted/40 disabled:cursor-default disabled:bg-muted/30 sm:px-4"
                  >
                    <CounterpartyAvatar name={counterparty.name} className="h-10 w-10 shrink-0 text-xs" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold">{counterparty.businessName ?? counterparty.name}</span>
                        {(counterparty.identityVerified || counterparty.businessVerified) && <BadgeCheck size={13} className="shrink-0 text-emerald-600" />}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{contact}</span>
                    </span>
                    <Badge variant="outline" className="hidden shrink-0 rounded-full text-[11px] sm:inline-flex">
                      {counterpartyRelationLabel(counterparty.relation)}
                    </Badge>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-emerald-500/10 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
                      {selected ? <Check size={15} /> : <Plus size={15} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
