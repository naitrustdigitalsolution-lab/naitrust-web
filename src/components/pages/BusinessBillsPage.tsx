import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  CalendarClock,
  Check,
  CircleAlert,
  Clock3,
  Plus,
  ReceiptText,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMyBusiness } from '../../hooks/useMyBusiness';
import {
  useBusinessBills,
  useCreateBusinessBill,
  useMarkBusinessBillPaid,
} from '../../hooks/useBusinessBills';
import {
  BUSINESS_BILL_CATEGORY_OPTIONS,
  BUSINESS_BILL_STATUS_FILTERS,
  businessBillCategoryLabel,
  businessBillRecurrenceLabel,
} from '../../libs/business-bills/bill-options';
import { businessBillStatus } from '../../libs/business-bills/bill-store';
import type { BusinessBillStatus, CreateBusinessBillInput } from '../../libs/business-bills/types';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import { AddBusinessBillDialog } from '../pieces/payments/AddBusinessBillDialog';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';

type StatusFilter = 'all' | BusinessBillStatus;

const STATUS_STYLE: Record<BusinessBillStatus, string> = {
  upcoming: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  due: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  overdue: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300',
  paid: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};

const STATUS_LABEL: Record<BusinessBillStatus, string> = {
  upcoming: 'Upcoming',
  due: 'Due soon',
  overdue: 'Overdue',
  paid: 'Paid',
};

export function BusinessBillsPage() {
  const { data: business, isLoading: isBusinessLoading } = useMyBusiness();
  const { data: bills = [], isLoading: isBillsLoading } = useBusinessBills(business?.id);
  const createBill = useCreateBusinessBill(business?.id);
  const markPaid = useMarkBusinessBillPaid(business?.id);
  const [showAddBill, setShowAddBill] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [category, setCategory] = useState('all');

  const rows = useMemo(
    () => bills.map((bill) => ({ bill, status: businessBillStatus(bill) })),
    [bills],
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter(({ bill, status: billStatus }) => {
      const matchesSearch = !term || [bill.title, bill.payeeName, bill.reference]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
      return matchesSearch && (status === 'all' || status === billStatus) && (category === 'all' || category === bill.category);
    });
  }, [category, query, rows, status]);

  const openTotal = rows
    .filter(({ status: billStatus }) => billStatus !== 'paid')
    .reduce((sum, { bill }) => sum + bill.amountMinor, 0);
  const dueCount = rows.filter(({ status: billStatus }) => billStatus === 'due').length;
  const overdueCount = rows.filter(({ status: billStatus }) => billStatus === 'overdue').length;

  const saveBill = async (input: Omit<CreateBusinessBillInput, 'businessId'>) => {
    await createBill.mutateAsync(input);
    toast.success('Bill added to your schedule.');
  };

  const markAsPaid = async (billId: string, title: string) => {
    await markPaid.mutateAsync(billId);
    toast.success(`${title} marked as paid.`);
  };

  const loading = isBusinessLoading || isBillsLoading;

  return (
    <DashboardLayout title="Bills">
      <AddBusinessBillDialog
        open={showAddBill}
        onOpenChange={setShowAddBill}
        isSaving={createBill.isPending}
        onCreate={saveBill}
      />
      <div className="mx-auto w-full max-w-9xl">
        <PageHero
          eyebrow="Business bills"
          title="Know what your business needs to pay next."
          description="Track supplier and operating bills, recurring due dates, and paid records in one simple place."
          icon={ReceiptText}
          actions={
            <Button className="rounded-full" onClick={() => setShowAddBill(true)}>
              <Plus size={16} className="mr-1" /> Add bill
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="gap-2 rounded-2xl p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarClock size={17} /></span>
            <p className="text-xs text-muted-foreground">Open bills</p>
            <p className="text-xl font-bold tabular-nums">{formatMinorAmount(openTotal, 'NGN')}</p>
          </Card>
          <Card className="gap-2 rounded-2xl p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600"><Clock3 size={17} /></span>
            <p className="text-xs text-muted-foreground">Due in 3 days</p>
            <p className="text-xl font-bold tabular-nums">{dueCount}</p>
          </Card>
          <Card className="gap-2 rounded-2xl p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-600"><CircleAlert size={17} /></span>
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className="text-xl font-bold tabular-nums">{overdueCount}</p>
          </Card>
        </div>

        <Card className="mt-5 gap-4 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {BUSINESS_BILL_STATUS_FILTERS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={status === option.value ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setStatus(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search bill, payee, or reference" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {BUSINESS_BILL_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="mt-5">
          {loading ? (
            <div className="space-y-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 w-full rounded-2xl" />)}</div>
          ) : filtered.length === 0 ? (
            <Card className="items-center rounded-2xl p-10 text-center shadow-sm">
              <ReceiptText size={28} className="text-muted-foreground" />
              <p className="font-semibold">No bills match these filters</p>
              <p className="text-sm text-muted-foreground">Clear the filters or add a new bill.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map(({ bill, status: billStatus }) => (
                <Card key={bill.id} className="gap-4 rounded-2xl p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ReceiptText size={19} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{bill.title}</p>
                      <Badge variant="outline" className={STATUS_STYLE[billStatus]}>{STATUS_LABEL[billStatus]}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{bill.payeeName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {businessBillCategoryLabel(bill.category)} · {businessBillRecurrenceLabel(bill.recurrence)}
                      {bill.reference ? ` · ${bill.reference}` : ''}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-bold tabular-nums text-foreground">{formatMinorAmount(bill.amountMinor, bill.currency)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Due {format(parseISO(bill.dueDate), 'MMM d, yyyy')}</p>
                  </div>
                  {billStatus !== 'paid' && (
                    <Button type="button" variant="outline" className="rounded-full" disabled={markPaid.isPending} onClick={() => void markAsPaid(bill.id, bill.title)}>
                      <Check size={15} className="mr-1" /> Mark paid
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
