import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpRight,
  Building2,
  Check,
  Copy,
  Landmark,
  Loader2,
  Plus,
  ReceiptText,
  Settings,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useFundWallet,
  useLinkedBankAccounts,
  useWallet,
  useWalletActivity,
  useWithdrawFromWallet,
} from '../../hooks/useWallet';
import {
  formatMinorAmount,
  parseMajorAmountToMinor,
} from '../../libs/utils/safe-deal-presentation';
import type {
  WalletActivityKind,
  WalletCurrencyAccount,
} from '../../libs/store/types';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PinPromptModal } from '../pieces/security/PinPromptModal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ACTIVITY_META: Record<WalletActivityKind, { label: string; incoming: boolean }> = {
  funding: { label: 'Balance funded', incoming: true },
  currency_exchange: { label: 'Currency conversion', incoming: false },
  withdrawal: { label: 'Bank withdrawal', incoming: false },
  instant_transfer_out: { label: 'Order payment', incoming: false },
  instant_transfer_in: { label: 'Earning received', incoming: true },
  protected_allocation: { label: 'Supplier order funded', incoming: false },
  protected_release: { label: 'Order funds received', incoming: true },
  bill_funding: { label: 'Balance allocation', incoming: false },
  bill_payment: { label: 'Payment', incoming: false },
  fee: { label: 'Service fee', incoming: false },
};

function FundingDetail({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-b py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={() => void copy()} aria-label={`Copy ${label}`}>
        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
      </Button>
    </div>
  );
}

export function CommerceWalletPage() {
  const navigate = useNavigate();
  const { data: wallet, isLoading } = useWallet();
  const { data: accounts = [] } = useLinkedBankAccounts();
  const { data: activity = [], isLoading: loadingActivity } = useWalletActivity();
  const fundWallet = useFundWallet();
  const withdraw = useWithdrawFromWallet();
  const [fundOpen, setFundOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [pinOpen, setPinOpen] = useState(false);
  const defaultBank = accounts.find((item) => item.isDefault) ?? accounts[0];
  const selectedBank = accounts.find((item) => item.id === selectedBankId) ?? defaultBank;
  const fundAmountMinor = parseMajorAmountToMinor(fundAmount);
  const withdrawAmountMinor = parseMajorAmountToMinor(withdrawAmount);

  const fallbackNgn: WalletCurrencyAccount = {
    currency: 'NGN',
    availableMinor: wallet?.balance.availableMinor ?? 0,
    fundingAccount: wallet?.virtualAccount,
  };
  const ngnAccount = wallet?.currencyAccounts?.find((item) => item.currency === 'NGN') ?? fallbackNgn;

  const openFunding = () => {
    setFundAmount('');
    setFundOpen(true);
  };

  const completeFunding = async () => {
    if (fundAmountMinor <= 0) return;
    try {
      await fundWallet.mutateAsync({
        linkedBankAccountId: defaultBank?.id ?? 'ngn-bank-transfer',
        amountMinor: fundAmountMinor,
        currency: 'NGN',
      });
      toast.success(`${formatMinorAmount(fundAmountMinor, 'NGN')} added to your balance.`);
      setFundOpen(false);
      setFundAmount('');
    } catch {
      toast.error('Could not add Naira. Please try again.');
    }
  };

  const completeWithdrawal = async () => {
    if (!selectedBank) return;
    try {
      await withdraw.mutateAsync({ linkedBankAccountId: selectedBank.id, amountMinor: withdrawAmountMinor });
      setWithdrawAmount('');
      toast.success(`Withdrawal sent to ${selectedBank.bankName} ${selectedBank.accountNumber}.`);
    } catch {
      toast.error('The withdrawal could not be completed.');
    }
  };

  return (
    <DashboardLayout title="Wallet">
      <div className="w-full">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Order wallet</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">Your Naira balance</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Fund orders, receive refunds and withdraw earnings.</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => navigate('/app/transactions')}>
            <ReceiptText size={15} /> View all activity
          </Button>
        </header>

        <section className="grid overflow-hidden rounded-[2rem] border bg-card shadow-[0_18px_55px_rgba(7,27,49,.08)] lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,.65fr)]">
          <div className="relative overflow-hidden bg-[#071b31] p-5 text-white sm:p-7 lg:p-8">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
            <div className="absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/65">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white"><WalletCards size={17} /></span>
                  Available balance
                </div>
                <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">NGN</Badge>
              </div>
              {isLoading ? (
                <Skeleton className="mt-7 h-12 w-64 bg-white/10" />
              ) : (
                <p className="mt-7 text-4xl font-bold tracking-[-.04em] sm:text-5xl">{formatMinorAmount(ngnAccount.availableMinor, 'NGN')}</p>
              )}
              <p className="mt-3 max-w-lg text-xs leading-5 text-white/55">Available for confirmed quotes or withdrawal to a verified Nigerian bank account.</p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <Button className="rounded-full bg-white text-[#071b31] hover:bg-white/90" onClick={openFunding}><Plus size={15} /> Add money</Button>
                <Button variant="outline" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={() => document.querySelector('#withdraw-naira')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><ArrowUpRight size={15} /> Withdraw</Button>
                <Button variant="ghost" className="rounded-full text-white/75 hover:bg-white/10 hover:text-white" onClick={() => navigate('/app/quotes')}>Pay a quote</Button>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Your funding account</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Transfer Naira here from any Nigerian bank.</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Landmark size={17} /></span>
            </div>
            <div className="mt-3">
              {ngnAccount.fundingAccount ? (
                <>
                  <FundingDetail label="Bank" value={ngnAccount.fundingAccount.bankName} />
                  <FundingDetail label="Account number" value={ngnAccount.fundingAccount.accountNumber} />
                  <FundingDetail label="Account name" value={ngnAccount.fundingAccount.accountName} />
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed p-4 text-xs leading-5 text-muted-foreground">Complete account verification to receive your funding details.</div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(21rem,.8fr)]">
          <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-semibold">Recent activity</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Order funding, earnings, refunds and withdrawals.</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => navigate('/app/transactions')}>See all</Button>
            </div>
            {loadingActivity ? (
              <div className="space-y-3 p-5">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-12 rounded-xl" />)}</div>
            ) : activity.length === 0 ? (
              <div className="grid min-h-64 place-items-center p-8 text-center"><div><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><ReceiptText size={19} /></span><p className="mt-3 text-sm font-semibold">No activity yet</p><p className="mt-1 text-xs text-muted-foreground">Funding and order payments will appear here.</p></div></div>
            ) : (
              <div className="divide-y">
                {activity.slice(0, 6).map((event) => {
                  const meta = ACTIVITY_META[event.kind];
                  const Icon = meta.incoming ? ArrowDownLeft : ArrowUpRight;
                  return (
                    <div key={event.id} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.incoming ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}><Icon size={16} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{meta.label}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{event.description} · {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</p>
                      </div>
                      <p className={`shrink-0 text-sm font-semibold ${meta.incoming ? 'text-emerald-600' : 'text-foreground'}`}>{meta.incoming ? '+' : '-'}{formatMinorAmount(event.amountMinor, event.currency)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card id="withdraw-naira" className="rounded-3xl border-primary/10 p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">Withdraw to your bank</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Choose a verified account and enter an amount.</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><ArrowDownToLine size={17} /></span>
            </div>

            {selectedBank ? (
              <div className="mt-5">
                <Label htmlFor="withdraw-bank">Bank account</Label>
                <Select value={selectedBank.id} onValueChange={setSelectedBankId}>
                  <SelectTrigger id="withdraw-bank" className="mt-2 h-12 w-full rounded-xl bg-background px-3">
                    <SelectValue placeholder="Choose a verified account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <span className="flex items-center gap-2"><Building2 size={14} /> {account.bankName} {account.accountNumber}{account.isDefault ? ' · Default' : ''}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs text-muted-foreground">{selectedBank.accountName}</p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">Add a verified withdrawal account in Settings.</div>
            )}

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="withdraw-amount">Amount</Label>
                <span className="text-[11px] text-muted-foreground">Available {formatMinorAmount(ngnAccount.availableMinor, 'NGN')}</span>
              </div>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₦</span>
                <Input id="withdraw-amount" type="number" inputMode="decimal" min="1" className="h-12 pl-8 text-base font-semibold" placeholder="0.00" value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} />
              </div>
            </div>
            <Button className="mt-4 h-11 w-full rounded-full" disabled={!selectedBank || withdrawAmountMinor <= 0 || withdrawAmountMinor > ngnAccount.availableMinor || withdraw.isPending} onClick={() => setPinOpen(true)}>Continue withdrawal</Button>
            <Button variant="ghost" className="mt-2 w-full rounded-full text-xs" onClick={() => navigate('/app/settings?tab=payments')}><Settings size={14} /> Manage bank accounts</Button>
          </Card>
        </div>
      </div>

      <Dialog open={fundOpen} onOpenChange={setFundOpen}>
        <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add money</DialogTitle>
            <DialogDescription>Transfer Naira to your order balance.</DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border px-4">
            {ngnAccount.fundingAccount ? (
              <>
                <FundingDetail label="Bank" value={ngnAccount.fundingAccount.bankName} />
                <FundingDetail label="Account number" value={ngnAccount.fundingAccount.accountNumber} />
                <FundingDetail label="Account name" value={ngnAccount.fundingAccount.accountName} />
              </>
            ) : (
              <p className="py-4 text-sm leading-6 text-muted-foreground">Complete account verification to receive your Naira funding details.</p>
            )}
          </div>

          <div>
            <Label htmlFor="fund-amount">Amount</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">₦</span>
              <Input id="fund-amount" type="number" inputMode="decimal" min="1" className="h-12 pl-8 text-base font-semibold" placeholder="0.00" value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button className="h-11 w-full rounded-full" disabled={fundAmountMinor <= 0 || fundWallet.isPending} onClick={() => void completeFunding()}>
              {fundWallet.isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Add to balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinPromptModal open={pinOpen} onOpenChange={setPinOpen} onVerified={() => void completeWithdrawal()} title="Confirm withdrawal" description={`Confirm this withdrawal to ${selectedBank?.bankName ?? 'your selected account'} with your transaction PIN.`} />
    </DashboardLayout>
  );
}
