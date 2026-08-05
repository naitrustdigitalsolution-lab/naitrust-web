import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarClock, Loader2, Plus } from 'lucide-react';
import type { CreateBusinessBillInput } from '../../../libs/business-bills/types';
import {
  BUSINESS_BILL_CATEGORY_OPTIONS,
  BUSINESS_BILL_RECURRENCE_OPTIONS,
} from '../../../libs/business-bills/bill-options';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';

type BillInput = Omit<CreateBusinessBillInput, 'businessId'>;

interface AddBusinessBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onCreate: (input: BillInput) => Promise<void>;
}

const initialForm = () => ({
  title: '',
  payeeName: '',
  category: 'supplier' as BillInput['category'],
  amount: '',
  currency: 'NGN',
  dueDate: '',
  recurrence: 'one_off' as BillInput['recurrence'],
  reference: '',
  note: '',
});

export function AddBusinessBillDialog({
  open,
  onOpenChange,
  isSaving,
  onCreate,
}: AddBusinessBillDialogProps) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const set = (key: keyof ReturnType<typeof initialForm>, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const submit = async () => {
    if (!form.title.trim() || !form.payeeName.trim() || !form.dueDate || Number(form.amount) <= 0) {
      setError('Enter the bill name, payee, amount, and due date.');
      return;
    }
    await onCreate({
      title: form.title.trim(),
      payeeName: form.payeeName.trim(),
      category: form.category,
      amountMinor: Math.round(Number(form.amount) * 100),
      currency: form.currency,
      dueDate: form.dueDate,
      recurrence: form.recurrence,
      reference: form.reference.trim() || undefined,
      note: form.note.trim() || undefined,
    });
    setForm(initialForm());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock size={19} className="text-primary" /> Add a business bill
          </DialogTitle>
          <DialogDescription>
            Keep a supplier or operating expense visible before its due date.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="bill-title">What is this bill for?</Label>
            <Input id="bill-title" className="mt-1.5" value={form.title} onChange={(event) => set('title', event.target.value)} placeholder="e.g. August shop rent" />
          </div>
          <div>
            <Label htmlFor="bill-payee">Who should be paid?</Label>
            <Input id="bill-payee" className="mt-1.5" value={form.payeeName} onChange={(event) => set('payeeName', event.target.value)} placeholder="Supplier or service provider" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(value) => set('category', value)}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUSINESS_BILL_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bill-amount">Amount (NGN)</Label>
            <Input id="bill-amount" type="number" min="0" inputMode="decimal" className="mt-1.5" value={form.amount} onChange={(event) => set('amount', event.target.value)} placeholder="150000" />
          </div>
          <div>
            <Label htmlFor="bill-due">Due date</Label>
            <Input id="bill-due" type="date" min={format(new Date(), 'yyyy-MM-dd')} className="mt-1.5" value={form.dueDate} onChange={(event) => set('dueDate', event.target.value)} />
          </div>
          <div>
            <Label>Repeats</Label>
            <Select value={form.recurrence} onValueChange={(value) => set('recurrence', value)}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUSINESS_BILL_RECURRENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bill-reference">Invoice or reference (optional)</Label>
            <Input id="bill-reference" className="mt-1.5" value={form.reference} onChange={(event) => set('reference', event.target.value)} placeholder="INV-2048" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="bill-note">Note (optional)</Label>
            <Textarea id="bill-note" rows={2} className="mt-1.5" value={form.note} onChange={(event) => set('note', event.target.value)} placeholder="Add any detail your team should remember." />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={() => void submit()} disabled={isSaving}>
            {isSaving ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Plus size={16} className="mr-1.5" />}
            Save bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

