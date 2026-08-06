/**
 * WalletPage
 * `/app/wallet`: the everyday account: available, pending and protected
 * balances kept visually distinct (protected funds are never shown as
 * withdrawable or instantly transferable), fund/withdraw actions, linked
 * bank accounts, and the wallet activity feed. Mock-only for this phase , 
 * no backend wallet endpoint exists yet (see wallet.api.ts).
 *
 * Balance-first layout inspired by Revolut's home screen: the available
 * balance is the single largest, boldest element on the page, with quick
 * actions directly beneath it.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Download,
  Landmark,
  Loader2,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { useFundWallet, useLinkedBankAccounts, useWallet, useWalletActivity, useWithdrawFromWallet } from '../../hooks/useWallet';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import type { WalletActivityKind } from '../../libs/store/types';

const ACTIVITY_META: Record<WalletActivityKind, { label: string; positive: boolean }> = {
  funding: { label: 'Wallet funding', positive: true },
  withdrawal: { label: 'Withdrawal', positive: false },
  instant_transfer_out: { label: 'Instant transfer', positive: false },
  instant_transfer_in: { label: 'Instant transfer received', positive: true },
  protected_allocation: { label: 'Allocated to protected deal', positive: false },
  protected_release: { label: 'Protected deal released', positive: true },
  bill_payment: { label: 'Bill payment', positive: false },
  fee: { label: 'Fee', positive: false },
};

export function WalletPage() {
  const navigate = useNavigate();
  const { data: wallet, isLoading } = useWallet();
  const { data: bankAccounts } = useLinkedBankAccounts();
  const { data: activity, isLoading: loadingActivity } = useWalletActivity();
  const fundWallet = useFundWallet();
  const withdraw = useWithdrawFromWallet();

  const [fundOpen, setFundOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const defaultBankAccount = bankAccounts?.find((b) => b.isDefault) ?? bankAccounts?.[0];
  const amountMinor = Math.round(parseFloat(amount || '0') * 100);

  const handleFund = async () => {
    if (!defaultBankAccount || !amountMinor) return;
    try {
      await fundWallet.mutateAsync({ linkedBankAccountId: defaultBankAccount.id, amountMinor });
      toast.success('Funding recorded: added to your pending balance');
      setFundOpen(false);
      setAmount('');
    } catch {
      toast.error('Could not fund the wallet. Please try again.');
    }
  };

  const handleWithdraw = async () => {
    if (!defaultBankAccount || !amountMinor || !wallet) return;
    if (amountMinor > wallet.balance.availableMinor) {
      toast.error('You can only withdraw from your available balance.');
      return;
    }
    try {
      await withdraw.mutateAsync({ linkedBankAccountId: defaultBankAccount.id, amountMinor });
      toast.success('Withdrawal recorded');
      setWithdrawOpen(false);
      setAmount('');
    } catch {
      toast.error('Could not withdraw. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Wallet">
      <div className="mx-auto w-full max-w-3xl">
        {isLoading || !wallet ? (
          <Skeleton className="h-56 w-full rounded-2xl" />
        ) : (
          <Card className="gap-4 overflow-hidden bg-linear-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-sm sm:p-8">
            <p className="text-sm font-medium text-primary-foreground/80">Available balance</p>
            <p className="text-4xl font-bold tracking-tight sm:text-5xl">
              {formatMinorAmount(wallet.balance.availableMinor, wallet.balance.currency)}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
              <span>
                Pending: <strong className="font-semibold text-primary-foreground">{formatMinorAmount(wallet.balance.pendingMinor, wallet.balance.currency)}</strong>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} />
                Protected: <strong className="font-semibold text-primary-foreground">{formatMinorAmount(wallet.balance.protectedMinor, wallet.balance.currency)}</strong>
              </span>
            </div>
            <p className="text-xs leading-5 text-primary-foreground/70">
              Protected funds are managed through NaiTrust's regulated payment partners and released
              according to the agreed transaction terms: they aren't available for withdrawal or
              instant transfer until a deal completes.
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="secondary" className="rounded-full" onClick={() => setFundOpen(true)}>
                <Plus size={15} className="mr-1.5" />
                Fund account
              </Button>
              <Button variant="secondary" className="rounded-full" onClick={() => setWithdrawOpen(true)}>
                <ArrowUpFromLine size={15} className="mr-1.5" />
                Withdraw
              </Button>
              <Button variant="secondary" className="rounded-full" onClick={() => navigate('/app/payments/receive')}>
                <ArrowDownToLine size={15} className="mr-1.5" />
                Receive
              </Button>
            </div>
          </Card>
        )}

        {wallet && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="gap-1 p-4 shadow-sm">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp size={12} /> Total inflow
              </p>
              <p className="text-sm font-semibold text-foreground">{formatMinorAmount(wallet.totalInflowMinor, wallet.balance.currency)}</p>
            </Card>
            <Card className="gap-1 p-4 shadow-sm">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown size={12} /> Total outflow
              </p>
              <p className="text-sm font-semibold text-foreground">{formatMinorAmount(wallet.totalOutflowMinor, wallet.balance.currency)}</p>
            </Card>
            <Card className="gap-1 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Account limit</p>
              <p className="text-sm font-semibold text-foreground">{formatMinorAmount(wallet.accountLimitMinor, wallet.balance.currency)}</p>
            </Card>
            <Card className="gap-1 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Linked accounts</p>
              <p className="text-sm font-semibold text-foreground">{bankAccounts?.length ?? 0}</p>
            </Card>
          </div>
        )}

        {bankAccounts && bankAccounts.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-foreground">Linked bank accounts</p>
            <Card className="gap-0 overflow-hidden p-0 shadow-sm">
              {bankAccounts.map((b) => (
                <div key={b.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Landmark size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{b.bankName}</p>
                    <p className="text-xs text-muted-foreground">{b.accountNumber} · {b.accountName}</p>
                  </div>
                  {b.isDefault && <span className="text-xs font-medium text-primary">Default</span>}
                </div>
              ))}
            </Card>
          </div>
        )}

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Wallet activity</p>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/app/transactions')}>
              <Download size={13} className="mr-1" />
              View statement
            </Button>
          </div>
          {loadingActivity ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : !activity || activity.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground shadow-sm">No wallet activity yet.</Card>
          ) : (
            <Card className="gap-0 overflow-hidden p-0 shadow-sm">
              {activity.map((event) => {
                const meta = ACTIVITY_META[event.kind];
                return (
                  <div key={event.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {meta.label} · {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className={`text-sm font-semibold ${meta.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                      {meta.positive ? '+' : '-'}
                      {formatMinorAmount(event.amountMinor, event.currency)}
                    </p>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </div>

      <Dialog open={fundOpen} onOpenChange={setFundOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Fund account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              From {defaultBankAccount ? `${defaultBankAccount.bankName} ${defaultBankAccount.accountNumber}` : 'your linked bank account'}
            </p>
            <Label htmlFor="fund-amount">Amount (NGN)</Label>
            <Input id="fund-amount" type="number" inputMode="decimal" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button className="w-full rounded-md" disabled={!amountMinor || fundWallet.isPending} onClick={() => void handleFund()}>
              {fundWallet.isPending && <Loader2 size={15} className="mr-1.5 animate-spin" />}
              Fund account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Withdraw</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              To {defaultBankAccount ? `${defaultBankAccount.bankName} ${defaultBankAccount.accountNumber}` : 'your linked bank account'} · Available:{' '}
              {wallet ? formatMinorAmount(wallet.balance.availableMinor, wallet.balance.currency) : 'Not available'}
            </p>
            <Label htmlFor="withdraw-amount">Amount (NGN)</Label>
            <Input id="withdraw-amount" type="number" inputMode="decimal" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button className="w-full rounded-md" disabled={!amountMinor || withdraw.isPending} onClick={() => void handleWithdraw()}>
              {withdraw.isPending && <Loader2 size={15} className="mr-1.5 animate-spin" />}
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
