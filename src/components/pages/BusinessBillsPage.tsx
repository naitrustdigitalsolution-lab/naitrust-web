import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, CheckCircle2, Loader2, Plus, Radio, Smartphone, Tv, WalletCards, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useBillPayments, useBillProviders, usePayBill } from '../../hooks/useBills';
import { useFundBillsAccount, useWallet } from '../../hooks/useWallet';
import type { BillPayment, BillProvider, BillServiceCategory } from '../../libs/store/types';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { PinPromptModal } from '../pieces/security/PinPromptModal';

const CATEGORIES: Array<{ value: BillServiceCategory; label: string; description: string; icon: typeof Zap }> = [
  { value: 'electricity', label: 'Electricity', description: 'Prepaid and postpaid meters', icon: Zap },
  { value: 'internet', label: 'Internet', description: 'Mobile data and broadband', icon: Radio },
  { value: 'tv', label: 'TV', description: 'Renew your subscription', icon: Tv },
  { value: 'airtime', label: 'Airtime', description: 'Top up any Nigerian number', icon: Smartphone },
];

function paymentError(error: unknown): string {
  return error instanceof Error ? error.message : 'We could not complete this payment. Please try again.';
}

export function BusinessBillsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const openedFromPayments = Boolean((location.state as { fromPayments?: boolean } | null)?.fromPayments);
  const [view, setView] = useState<'pay' | 'history'>('pay');
  const [category, setCategory] = useState<BillServiceCategory>('electricity');
  const [providerId, setProviderId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState<BillPayment | null>(null);
  const [fundOpen, setFundOpen] = useState(false);
  const [fundPinOpen, setFundPinOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: providers = [], isLoading: providersLoading } = useBillProviders();
  const { data: payments = [], isLoading: paymentsLoading } = useBillPayments();
  const payBill = usePayBill();
  const fundBills = useFundBillsAccount();

  const categoryProviders = useMemo(() => providers.filter((provider) => provider.category === category), [category, providers]);
  const provider = providers.find((item) => item.id === providerId);
  const amountMinor = Math.round(Number(amount || 0) * 100);
  const availableMinor = wallet?.balance.availableMinor ?? 0;
  const billsMinor = wallet?.balance.billsMinor ?? 0;
  const fundAmountMinor = Math.round(Number(fundAmount || 0) * 100);
  const canFund = fundAmountMinor > 0 && fundAmountMinor <= availableMinor;
  const canPay = Boolean(provider && identifier.trim().length >= 7 && amountMinor >= provider.minimumAmountMinor && amountMinor <= provider.maximumAmountMinor && amountMinor <= billsMinor);

  const chooseCategory = (next: BillServiceCategory) => {
    setCategory(next);
    setProviderId('');
    setIdentifier('');
    setAmount('');
    setReceipt(null);
  };

  const submit = async () => {
    if (!provider || !canPay) return;
    try {
      const response = await payBill.mutateAsync({ providerId: provider.id, customerIdentifier: identifier, amountMinor, currency: 'NGN' });
      setReceipt(response.data);
      setIdentifier('');
      setAmount('');
      toast.success(`${provider.name} payment completed.`);
    } catch (error) {
      toast.error(paymentError(error));
    }
  };

  const confirmBillsFunding = () => {
    fundBills.mutate(fundAmountMinor, {
      onSuccess: () => {
        toast.success(`${formatMinorAmount(fundAmountMinor, 'NGN')} moved to your Bills Account.`);
        setFundAmount('');
      },
      onError: (error) => toast.error(paymentError(error)),
    });
  };

  return (
    <DashboardLayout title="Bills & airtime">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2 sm:block">
            {openedFromPayments && <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full sm:hidden" aria-label="Back to Payments" onClick={() => navigate('/app/payments')}><ArrowLeft size={14} /></Button>}
            <div><h1 className="text-xl font-bold tracking-tight sm:text-2xl">Everyday payments</h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Pay bills and airtime from your dedicated Bills Account.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {openedFromPayments && <Button variant="ghost" size="sm" className="hidden rounded-full text-xs sm:inline-flex" onClick={() => navigate('/app/payments')}><ArrowLeft size={14} /> Payments</Button>}
          <div className="flex rounded-full border bg-card p-1 shadow-sm">
            <button type="button" onClick={() => setView('pay')} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${view === 'pay' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Pay bill</button>
            <button type="button" onClick={() => setView('history')} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${view === 'history' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Recent payments</button>
          </div>
          </div>
        </div>

        <div className={`${view === 'pay' ? 'grid' : 'hidden'} gap-4 lg:grid-cols-[minmax(0,1fr)_340px]`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map((item) => (
                <button key={item.value} type="button" onClick={() => chooseCategory(item.value)} className={`rounded-2xl border p-4 text-left transition-colors ${category === item.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card hover:border-primary/40'}`}>
                  <item.icon size={20} className={category === item.value ? 'text-primary' : 'text-muted-foreground'} />
                  <p className="mt-3 text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{item.description}</p>
                </button>
              ))}
            </div>

            <Card className="gap-5 rounded-2xl p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-semibold">{CATEGORIES.find((item) => item.value === category)?.label} payment</h2>
                <p className="text-sm text-muted-foreground">Payment comes directly from your Bills Account.</p>
              </div>
              {providersLoading ? <Skeleton className="h-10 w-full" /> : (
                <div>
                  <Label>Service provider</Label>
                  <Select value={providerId} onValueChange={(value) => { setProviderId(value); setIdentifier(''); setAmount(''); setReceipt(null); }}>
                    <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Choose provider" /></SelectTrigger>
                    <SelectContent>{categoryProviders.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {provider && (
                <>
                  <div>
                    <Label htmlFor="bill-identifier">{provider.identifierLabel}</Label>
                    <Input id="bill-identifier" className="mt-1.5" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={provider.identifierPlaceholder} inputMode={category === 'airtime' || category === 'internet' ? 'tel' : 'numeric'} />
                  </div>
                  <div>
                    <Label htmlFor="bill-amount">Amount (NGN)</Label>
                    <Input id="bill-amount" className="mt-1.5" type="number" min={provider.minimumAmountMinor / 100} max={provider.maximumAmountMinor / 100} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" inputMode="decimal" />
                    {provider.presetAmountsMinor && <div className="mt-2 flex flex-wrap gap-2">{provider.presetAmountsMinor.map((preset) => <Button key={preset} type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setAmount(String(preset / 100))}>{formatMinorAmount(preset, 'NGN')}</Button>)}</div>}
                  </div>
                  {amountMinor > billsMinor && <p className="text-sm text-destructive">Your Bills Account balance is not enough. Fund it before paying.</p>}
                  <div className="rounded-xl border bg-muted/40 p-4">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">You pay</span><strong>{formatMinorAmount(amountMinor, 'NGN')}</strong></div>
                    <div className="mt-2 flex justify-between text-sm"><span className="text-muted-foreground">Fee</span><strong>{formatMinorAmount(0, 'NGN')}</strong></div>
                  </div>
                  <Button className="w-full rounded-full" disabled={!canPay || payBill.isPending} onClick={() => void submit()}>
                    {payBill.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <WalletCards size={16} className="mr-2" />}Pay from Bills Account
                  </Button>
                </>
              )}
              {receipt && <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm"><p className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={17} /> Payment successful</p><p className="mt-1 text-muted-foreground">Reference: {receipt.reference}</p></div>}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-primary to-primary/80 p-5 text-primary-foreground shadow-lg shadow-primary/15 sm:p-6">
              <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-14 right-12 h-28 w-28 rounded-full border border-white/10" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><WalletCards size={17} /></span>
                    <div><p className="text-sm font-semibold">Bills Account</p><p className="text-[11px] text-primary-foreground/65">Ready for bills and airtime</p></div>
                  </div>
                  <Badge className="border-white/15 bg-white/10 text-[10px] text-white hover:bg-white/10">NGN</Badge>
                </div>

                <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground/60">Available balance</p>
                {walletLoading ? <Skeleton className="mt-2 h-10 w-44 bg-white/15" /> : <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">{formatMinorAmount(billsMinor, wallet?.balance.currency ?? 'NGN')}</p>}

                <div className="my-5 h-px bg-white/15" />
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-primary-foreground/65">Available to move</span>
                  {walletLoading ? <Skeleton className="h-4 w-24 bg-white/15" /> : <span className="font-semibold tabular-nums">{formatMinorAmount(availableMinor, wallet?.balance.currency ?? 'NGN')}</span>}
                </div>
                <p className="mt-2 text-[11px] leading-5 text-primary-foreground/60">Set money aside here to keep everyday bill payments separate.</p>

                <Button variant="secondary" className="mt-5 w-full rounded-full font-semibold shadow-sm" onClick={() => setFundOpen(true)}>
                  <Plus size={15} className="mr-1.5" /> Add money
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {view === 'history' && (
          <Card className="gap-0 overflow-hidden rounded-2xl p-0 shadow-sm">
            <div className="border-b px-4 py-3"><h2 className="text-sm font-semibold">Recent bill payments</h2></div>
            {paymentsLoading ? <div className="space-y-2 p-4"><Skeleton className="h-12" /><Skeleton className="h-12" /></div> : payments.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Your completed payments will appear here.</p> : payments.map((payment) => <div key={payment.id} className="flex items-center gap-3 border-b p-4 last:border-0"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{payment.providerName}</p><p className="truncate text-xs text-muted-foreground">{payment.customerIdentifier} · {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}</p></div><div className="shrink-0 text-right"><p className="text-sm font-semibold">{formatMinorAmount(payment.amountMinor, payment.currency)}</p><Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-700">Paid</Badge></div></div>)}
          </Card>
        )}
      </div>

      <Dialog open={fundOpen} onOpenChange={setFundOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fund Bills Account</DialogTitle>
            <DialogDescription>Move money from your available Naitrust balance into your dedicated bills balance.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="fund-bills-amount">Amount (NGN)</Label>
            <Input id="fund-bills-amount" className="mt-1.5" type="number" min="1" inputMode="decimal" value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} placeholder="0.00" autoFocus />
          </div>
          <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Available balance</span><span className="font-semibold tabular-nums">{formatMinorAmount(availableMinor, 'NGN')}</span></div>
            <div className="mt-2 flex justify-between gap-4"><span className="text-muted-foreground">Balance after funding</span><span className="font-semibold tabular-nums">{formatMinorAmount(Math.max(0, availableMinor - fundAmountMinor), 'NGN')}</span></div>
            <div className="mt-2 flex justify-between gap-4"><span className="text-muted-foreground">New Bills Account balance</span><span className="font-semibold tabular-nums">{formatMinorAmount(billsMinor + Math.max(0, fundAmountMinor), 'NGN')}</span></div>
          </div>
          {fundAmountMinor > availableMinor && <p className="text-sm text-destructive">Your available balance is not enough for this transfer.</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFundOpen(false)}>Cancel</Button>
            <Button disabled={!canFund} onClick={() => { setFundOpen(false); setFundPinOpen(true); }}>Accept and continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinPromptModal
        open={fundPinOpen}
        onOpenChange={setFundPinOpen}
        onVerified={confirmBillsFunding}
        title="Confirm Bills Account funding"
        description={`Enter your transaction PIN to move ${formatMinorAmount(fundAmountMinor, 'NGN')} to your Bills Account.`}
      />
    </DashboardLayout>
  );
}
