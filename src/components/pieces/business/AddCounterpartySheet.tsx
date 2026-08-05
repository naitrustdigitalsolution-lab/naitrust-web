import { useEffect, useState } from 'react';
import { Building2, Loader2, UserRoundPlus } from 'lucide-react';
import type { CreateCounterpartyInput } from '../../../libs/counterparties/types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import { Textarea } from '../../ui/textarea';

interface AddCounterpartySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onCreate: (input: CreateCounterpartyInput) => Promise<void>;
}

const emptyForm = (): CreateCounterpartyInput => ({
  name: '',
  businessName: '',
  relation: 'customer',
  email: '',
  phone: '',
  address: '',
  notes: '',
});

export function AddCounterpartySheet({
  open,
  onOpenChange,
  isSaving,
  onCreate,
}: AddCounterpartySheetProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
      setError('');
    }
  }, [open]);

  const update = <Key extends keyof CreateCounterpartyInput>(
    key: Key,
    value: CreateCounterpartyInput[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const submit = async () => {
    if (!form.name.trim()) {
      setError('Enter the customer or supplier name.');
      return;
    }
    if (!form.email?.trim() && !form.phone?.trim()) {
      setError('Add an email address or phone number.');
      return;
    }
    try {
      await onCreate({
        ...form,
        name: form.name.trim(),
        businessName: form.businessName?.trim() || undefined,
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      });
      onOpenChange(false);
    } catch {
      setError('This contact could not be saved. Please try again.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-6">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserRoundPlus size={20} />
          </div>
          <SheetTitle className="text-xl">Add a customer or supplier</SheetTitle>
          <SheetDescription>
            Keep the contact and trading history your business needs in one place.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-6 py-2">
          <div>
            <Label>Relationship</Label>
            <Select value={form.relation} onValueChange={(value) => update('relation', value as 'customer' | 'supplier')}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="counterparty-name">Contact name</Label>
            <Input id="counterparty-name" className="mt-1.5" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Full name" autoFocus />
          </div>

          <div>
            <Label htmlFor="counterparty-business">Business name <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <div className="relative mt-1.5">
              <Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="counterparty-business" className="pl-9" value={form.businessName} onChange={(event) => update('businessName', event.target.value)} placeholder="Company or trading name" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="counterparty-email">Email</Label>
              <Input id="counterparty-email" type="email" className="mt-1.5" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@business.com" />
            </div>
            <div>
              <Label htmlFor="counterparty-phone">Phone</Label>
              <Input id="counterparty-phone" type="tel" className="mt-1.5" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+234…" />
            </div>
          </div>

          <div>
            <Label htmlFor="counterparty-address">Address <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="counterparty-address" className="mt-1.5" value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Business or delivery address" />
          </div>

          <div>
            <Label htmlFor="counterparty-notes">Business notes <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Textarea id="counterparty-notes" rows={3} className="mt-1.5 resize-none" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Payment preferences, delivery instructions, or anything your team should remember." />
          </div>

          {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        </div>

        <SheetFooter className="border-t px-6 py-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={() => void submit()} disabled={isSaving}>
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <UserRoundPlus size={16} />}
            Save contact
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
