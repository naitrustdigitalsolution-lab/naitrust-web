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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../../ui/sheet';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import { CounterpartyAvatar } from '../dashboard/CounterpartyAvatar';

interface SavedCounterpartyPickerDialogProps {
  counterparties: CounterpartyProfile[];
  isLoading: boolean;
  selectedProfileIds: string[];
  selectedIdentifiers: string[];
  onSelect: (counterparty: CounterpartyProfile) => void;
  onDeselect: (counterparty: CounterpartyProfile) => void;
  customerMode?: boolean;
  directoryMode?: boolean;
}

type RelationshipFilter = 'all' | CreateCounterpartyInput['relation'];
const selectableRelationships = new Set(COUNTERPARTY_RELATION_OPTIONS.map((option) => option.value));

export function SavedCounterpartyPickerDialog({
  counterparties,
  isLoading,
  selectedProfileIds,
  selectedIdentifiers,
  onSelect,
  onDeselect,
  customerMode = false,
  directoryMode = false,
}: SavedCounterpartyPickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [relationship, setRelationship] = useState<RelationshipFilter>('all');
  const selectedIds = useMemo(() => new Set(selectedProfileIds), [selectedProfileIds]);
  const normalizedSelectedIdentifiers = useMemo(() => new Set(selectedIdentifiers.map((value) => value.trim().toLowerCase()).filter(Boolean)), [selectedIdentifiers]);
  const isSelected = (counterparty: CounterpartyProfile) => selectedIds.has(counterparty.id) || [counterparty.email, counterparty.phone, counterparty.notes].some((value) => value && normalizedSelectedIdentifiers.has(value.trim().toLowerCase()));

  const availableContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (directoryMode && !query) return [];
    return counterparties
      .filter((counterparty) => !counterparty.isBlocked && selectableRelationships.has(counterparty.relation as CreateCounterpartyInput['relation']))
      .filter((counterparty) => relationship === 'all' || (customerMode && relationship === 'customer' ? counterparty.id.startsWith('ben_') : customerMode && relationship === 'supplier' ? Boolean(counterparty.businessName) : counterparty.relation === relationship))
      .filter((counterparty) => {
        if (!query) return true;
        return [
          counterparty.name,
          counterparty.businessName,
          counterparty.email,
          counterparty.phone,
          counterparty.notes,
          counterpartyRelationLabel(counterparty.relation),
        ].some((value) => value?.toLowerCase().includes(query));
      });
  }, [counterparties, customerMode, directoryMode, relationship, search]);

  const selectedContacts = useMemo(
    () => counterparties.filter(isSelected),
    // Selection is derived from the latest profile IDs and contact identifiers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [counterparties, normalizedSelectedIdentifiers, selectedIds],
  );
  const displayedContacts = directoryMode && !search.trim() ? selectedContacts : availableContacts;

  const selectContact = (counterparty: CounterpartyProfile) => {
    if (isSelected(counterparty)) {
      onDeselect(counterparty);
      return;
    }
    onSelect(counterparty);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-full">
          {directoryMode ? <Search size={14} /> : <UsersRound size={14} />} {directoryMode ? 'Find on Naitrust' : 'Choose saved contact'}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[94vw] gap-0 overflow-hidden p-0 sm:max-w-xl lg:max-w-2xl">
        <SheetHeader className="border-b px-5 pb-4 pt-5 sm:px-6">
          <SheetTitle>{directoryMode ? 'Find on Naitrust' : 'Choose a saved contact'}</SheetTitle>
          <SheetDescription>{directoryMode ? 'Quickly search verified Naitrust accounts and add the right person or business directly to this deal.' : 'Search saved beneficiaries and businesses, then add one to this deal.'}</SheetDescription>
        </SheetHeader>

        <div className={`grid gap-3 px-5 pt-4 sm:px-6 ${directoryMode ? 'grid-cols-1' : 'sm:grid-cols-[minmax(0,1fr)_190px]'}`}>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder={directoryMode ? 'Business name, Naitrust ID, email, or phone' : 'Name, Naitrust ID, account number, email, or phone'}
              autoFocus
            />
          </div>
          {!directoryMode && <Select value={relationship} onValueChange={(value) => setRelationship(value as RelationshipFilter)}>
            <SelectTrigger><SelectValue placeholder="All relationships" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All relationships</SelectItem>
              {(customerMode ? [{ value: 'customer', label: 'Beneficiaries' }, { value: 'supplier', label: 'Saved businesses' }] : COUNTERPARTY_RELATION_OPTIONS).map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-3 sm:px-6">
          {directoryMode && !search.trim() && selectedContacts.length > 0 && (
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{selectedContacts.length} selected</p>
          )}
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((item) => <Skeleton key={item} className="h-18 rounded-xl" />)}
            </div>
          ) : displayedContacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              {directoryMode ? <Search className="mx-auto text-muted-foreground" size={23} /> : <UsersRound className="mx-auto text-muted-foreground" size={23} />}
              <p className="mt-3 text-sm font-semibold">{directoryMode && !search.trim() ? 'Search for a Naitrust business' : 'No matching contacts found'}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{directoryMode && !search.trim() ? 'Enter a business name, Naitrust ID, email, or phone number.' : 'Try another search or enter the counterparty manually in the deal form.'}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border">
              {displayedContacts.map((counterparty) => {
                const selected = isSelected(counterparty);
                const contact = counterparty.email ?? counterparty.phone ?? counterparty.notes ?? 'No invitation contact saved';
                return (
                  <button
                    key={counterparty.id}
                    type="button"
                    onClick={() => selectContact(counterparty)}
                    className={`flex w-full items-center gap-3 border-b px-3 py-3 text-left transition last:border-b-0 hover:bg-muted/40 sm:px-4 ${selected ? 'bg-emerald-500/[0.06]' : ''}`}
                  >
                    <CounterpartyAvatar name={counterparty.name} className="h-10 w-10 shrink-0 text-xs" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold">{counterparty.businessName ?? counterparty.name}</span>
                        {(counterparty.identityVerified || counterparty.businessVerified) && <BadgeCheck size={13} className="shrink-0 text-emerald-600" />}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{contact}</span>
                      {directoryMode && <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary"><span>{counterparty.businessName ? 'Business account' : 'Personal account'}</span>{counterparty.notes && <><span className="text-muted-foreground">•</span><span>{counterparty.notes}</span></>}</span>}
                      {!directoryMode && <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-primary">{counterparty.id.startsWith('ben_') ? 'Beneficiary' : counterparty.businessName ? 'Saved business' : counterpartyRelationLabel(counterparty.relation)}</span>}
                    </span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${selected ? 'bg-emerald-500/10 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
                      {selected ? <Check size={15} /> : <Plus size={15} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-auto border-t bg-background px-5 py-4 sm:px-6">
          {selectedContacts.length > 0 && (!directoryMode || Boolean(search.trim())) && (
            <div className="mb-3 overflow-hidden rounded-2xl border border-sky-200/80 bg-[#eaf7ff] text-[#071b31] shadow-sm dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-foreground">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex shrink-0 -space-x-2">
                    {selectedContacts.slice(0, 4).map((contact) => (
                      <span key={contact.id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#eaf7ff] bg-white text-[10px] font-bold text-[#071b31] shadow-sm dark:border-[#10243a]">
                        {(contact.businessName ?? contact.name).split(' ').slice(0, 2).map((word) => word[0]).join('')}
                      </span>
                    ))}
                    {selectedContacts.length > 4 && <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#eaf7ff] bg-sky-100 text-[10px] font-bold text-[#071b31] dark:border-[#10243a] dark:bg-sky-400/20 dark:text-foreground">+{selectedContacts.length - 4}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-xs font-semibold"><Check size={13} className="text-emerald-400" /> {selectedContacts.length} selected</p>
                    <p className="mt-0.5 truncate text-[11px] text-[#527086] dark:text-muted-foreground">{selectedContacts.map((contact) => contact.businessName ?? contact.name).join(', ')}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Ready</span>
              </div>
            </div>
          )}
          <Button type="button" className="w-full rounded-full" onClick={() => setOpen(false)}>
            Done selecting{selectedProfileIds.length > 0 ? ` (${selectedProfileIds.length})` : ''}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
