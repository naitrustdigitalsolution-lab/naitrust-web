import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Download, Loader2, Send, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import { CounterpartyProfileOverview } from '../pieces/business/CounterpartyProfileOverview';
import { CounterpartyTransactionsPanel } from '../pieces/business/CounterpartyTransactionsPanel';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import {
  useCounterparty,
  useCounterpartyTransactions,
  useToggleFavouriteCounterparty,
} from '../../hooks/useCounterparties';
import { downloadCounterpartyReport } from '../../libs/counterparties/counterparty-report';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';

function formatMemberSince(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' });
}

export function CounterpartyDetailPage() {
  const navigate = useNavigate();
  const { counterpartyId } = useParams<{ counterpartyId: string }>();
  const { data: counterparty, isLoading, isError } = useCounterparty(counterpartyId);
  const { data: transactions = [], isLoading: transactionsLoading } = useCounterpartyTransactions(counterpartyId);
  const toggleFavourite = useToggleFavouriteCounterparty();
  const [generatingReport, setGeneratingReport] = useState(false);
  const totalValueMinor = useMemo(
    () => transactions.reduce((total, transaction) => total + transaction.amountMinor, 0),
    [transactions],
  );

  const startProtectedDeal = () => {
    if (!counterparty) return;
    const query = new URLSearchParams({ name: counterparty.name, business: counterparty.id });
    const contact = counterparty.email ?? counterparty.phone;
    if (contact) query.set('email', contact);
    navigate(`/app/deals/new?${query.toString()}`);
  };

  const generateReport = async () => {
    if (!counterparty) return;
    setGeneratingReport(true);
    try {
      await downloadCounterpartyReport(counterparty, transactions);
      toast.success('Customer and supplier report downloaded.');
    } catch {
      toast.error('The report could not be generated. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <DashboardLayout title="Customer or supplier">
      <div className="mx-auto w-full max-w-9xl">
        <button type="button" onClick={() => navigate('/app/network')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} /> Back to Customers & Suppliers
        </button>

        {isLoading ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]">
            <Skeleton className="h-[460px] rounded-3xl" /><Skeleton className="h-[460px] rounded-3xl" />
          </div>
        ) : isError || !counterparty ? (
          <Card className="items-center rounded-3xl p-10 text-center shadow-sm">
            <h1 className="text-xl font-semibold">Contact not found</h1>
            <p className="text-sm text-muted-foreground">This customer or supplier record may no longer be available.</p>
            <Button variant="outline" onClick={() => navigate('/app/network')}>Return to contacts</Button>
          </Card>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Relationship workspace</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Contact overview</h2></div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => navigate('/app/payments/send')}><Send size={15} /> Pay</Button>
                <Button variant="outline" className="rounded-full" onClick={startProtectedDeal}><ShieldCheck size={15} /> Start Protected Deal</Button>
                <Button className="rounded-full" onClick={() => void generateReport()} disabled={generatingReport || transactionsLoading}>
                  {generatingReport ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Generate report
                </Button>
              </div>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-2xl p-4 shadow-sm"><p className="text-xs text-muted-foreground">Completed transactions</p><p className="mt-2 text-xl font-bold tabular-nums">{transactions.length}</p></Card>
              <Card className="rounded-2xl p-4 shadow-sm"><p className="text-xs text-muted-foreground">Recorded value</p><p className="mt-2 text-xl font-bold tabular-nums">{formatMinorAmount(totalValueMinor, transactions[0]?.currency ?? 'NGN')}</p></Card>
              <Card className="rounded-2xl p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Star size={13} /> Customer rating</p><p className="mt-2 text-xl font-bold">{counterparty.ratingAverage?.toFixed(1) ?? 'Not rated'}</p></Card>
              <Card className="rounded-2xl p-4 shadow-sm"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays size={13} /> Trading since</p><p className="mt-2 text-xl font-bold">{formatMemberSince(counterparty.memberSince)}</p></Card>
            </div>

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.5fr)]">
              <CounterpartyProfileOverview
                counterparty={counterparty}
                onToggleFavourite={() => toggleFavourite.mutate(counterparty.id)}
                favouriteUpdating={toggleFavourite.isPending}
              />
              {transactionsLoading ? <Skeleton className="h-80 rounded-3xl" /> : <CounterpartyTransactionsPanel transactions={transactions} />}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

