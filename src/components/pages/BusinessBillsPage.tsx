import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, History, Loader2, Radio, Smartphone, Tv, WalletCards, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useBillPayments, useBillProviders, usePayBill } from '../../hooks/useBills';
import { useWallet } from '../../hooks/useWallet';
import type { BillPayment, BillProvider, BillServiceCategory } from '../../libs/store/types';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';

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
  const [category, setCategory] = useState<BillServiceCategory>('electricity');
  const [providerId, setProviderId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState<BillPayment | null>(null);
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: providers = [], isLoading: providersLoading } = useBillProviders();
  const { data: payments = [], isLoading: paymentsLoading } = useBillPayments();
  const payBill = usePayBill();

  const categoryProviders = useMemo(() => providers.filter((provider) => provider.category === category), [category, providers]);
  const provider = providers.find((item) => item.id === providerId);
  const amountMinor = Math.round(Number(amount || 0) * 100);
  const availableMinor = wallet?.balance.availableMinor ?? 0;
  const canPay = Boolean(provider && identifier.trim().length >= 7 && amountMinor >= provider.minimumAmountMinor && amountMinor <= provider.maximumAmountMinor && amountMinor <= availableMinor);

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

  return (
    <DashboardLayout title="Bills & airtime">
      <div className="mx-auto w-full max-w-6xl">
        <PageHero eyebrow="Everyday payments" title="Pay bills without moving your money out." description="Use your available NaiTrust balance for electricity, internet, TV subscriptions, and airtime." icon={WalletCards} />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
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
                <p className="text-sm text-muted-foreground">Payment comes directly from your available balance.</p>
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
                  {amountMinor > availableMinor && <p className="text-sm text-destructive">Your available balance is not enough. Add money to NaiTrust before paying.</p>}
                  <div className="rounded-xl border bg-muted/40 p-4">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">You pay</span><strong>{formatMinorAmount(amountMinor, 'NGN')}</strong></div>
                    <div className="mt-2 flex justify-between text-sm"><span className="text-muted-foreground">Fee</span><strong>{formatMinorAmount(0, 'NGN')}</strong></div>
                  </div>
                  <Button className="w-full rounded-full" disabled={!canPay || payBill.isPending} onClick={() => void submit()}>
                    {payBill.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <WalletCards size={16} className="mr-2" />}Pay from NaiTrust balance
                  </Button>
                </>
              )}
              {receipt && <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm"><p className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={17} /> Payment successful</p><p className="mt-1 text-muted-foreground">Reference: {receipt.reference}</p></div>}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm">
              <p className="text-sm text-primary-foreground/75">Available to spend</p>
              {walletLoading ? <Skeleton className="mt-2 h-9 w-40" /> : <p className="mt-1 text-3xl font-bold">{formatMinorAmount(availableMinor, wallet?.balance.currency ?? 'NGN')}</p>}
              <p className="mt-3 text-xs leading-5 text-primary-foreground/70">Pending and Protected Deal funds are kept separate and cannot be used for bills.</p>
            </Card>
            <Card className="gap-0 overflow-hidden rounded-2xl p-0 shadow-sm">
              <div className="flex items-center gap-2 border-b p-4"><History size={17} /><h2 className="font-semibold">Recent bill payments</h2></div>
              {paymentsLoading ? <div className="space-y-2 p-4"><Skeleton className="h-12" /><Skeleton className="h-12" /></div> : payments.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">Your completed payments will appear here.</p> : payments.slice(0, 6).map((payment) => <div key={payment.id} className="flex items-center gap-3 border-b p-4 last:border-0"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{payment.providerName}</p><p className="text-xs text-muted-foreground">{payment.customerIdentifier} · {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}</p></div><div className="text-right"><p className="text-sm font-semibold">{formatMinorAmount(payment.amountMinor, payment.currency)}</p><Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-700">Paid</Badge></div></div>)}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
