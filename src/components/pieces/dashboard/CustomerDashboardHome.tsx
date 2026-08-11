import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Building2,
  Copy,
  Inbox,
  Landmark,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBeneficiaries } from '../../../hooks/useBeneficiaries';
import type { DealInvitation, SafeDealSummary, WalletAccount } from '../../../libs/store/types';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { SecureAccountModal } from '../security/SecureAccountModal';
import { DashboardLayout } from './DashboardLayout';
import { CustomerOverviewStats } from './CustomerOverviewStats';
import { TransactionList } from './TransactionList';

interface CustomerDashboardHomeProps {
  firstName: string;
  naitrustId: string;
  identityVerified: boolean;
  wallet: WalletAccount | undefined;
  walletLoading: boolean;
  deals: SafeDealSummary[] | undefined;
  dealsLoading: boolean;
  dealsError: boolean;
  invitations: DealInvitation[] | undefined;
  onOpenDeal: (deal: SafeDealSummary) => void;
}

const CUSTOMER_SHORTCUTS = [
  {
    title: 'Find a business',
    description: 'Review its Trust Profile before paying.',
    path: '/app/businesses',
    icon: Building2,
  },
  {
    title: 'Protect a payment',
    description: 'Agree on terms before paying.',
    path: '/app/deals/new',
    icon: ShieldCheck,
  },
  {
    title: 'Pay a business',
    description: 'Pay after checking who you are dealing with.',
    path: '/app/payments',
    icon: Send,
  },
  {
    title: 'Receive money',
    description: 'Share your account or payment link.',
    path: '/app/payments/receive',
    icon: ArrowDownToLine,
  },
] as const;

export function CustomerDashboardHome({
  firstName,
  naitrustId,
  identityVerified,
  wallet,
  walletLoading,
  deals,
  dealsLoading,
  dealsError,
  invitations,
  onOpenDeal,
}: CustomerDashboardHomeProps) {
  const navigate = useNavigate();
  const { data: beneficiaries, isLoading: beneficiariesLoading } = useBeneficiaries();
  const account = wallet?.virtualAccount;
  const pendingInvitations = invitations?.filter((invitation) => invitation.status === 'pending') ?? [];
  const pendingReleaseDeal = deals?.find((deal) => deal.status === 'buyer_review');

  const copyAccount = async () => {
    if (!account?.accountNumber) {
      toast.info('Your account number will appear after account setup.');
      return;
    }
    await navigator.clipboard.writeText(account.accountNumber);
    toast.success('Account number copied');
  };

  return (
    <DashboardLayout title="Dashboard">
      <SecureAccountModal />
      <div className="mx-auto flex w-full max-w-9xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4 py-1">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">Good day, {firstName}</p>
              {identityVerified && (
                <Badge variant="success" className="gap-1 rounded-full px-2 py-0.5 text-[11px]">
                  <BadgeCheck size={11} /> Verified
                </Badge>
              )}
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">Pay with more confidence.</h1>
          </div>
          <Button className="rounded-full px-5" onClick={() => navigate('/app/businesses')}>
            <Building2 size={16} /> Find a business
          </Button>
        </header>

        {pendingReleaseDeal && (
          <button type="button" onClick={() => navigate(`/app/deals/${pendingReleaseDeal.id}`)} className="flex w-full items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-left transition hover:bg-amber-500/[0.12]">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Check your purchase before payment releases</span><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">Make sure {pendingReleaseDeal.title} is complete, correct, and in the agreed condition. After release, you cannot open a Naitrust payment dispute for this deal.</span></span>
            <ArrowRight size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
          </button>
        )}

        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)]">
          <Card className="relative overflow-hidden rounded-3xl border-0  bg-primary dark:bg-[#04162f] p-5 text-white shadow-[0_18px_48px_rgba(7,49,88,.18)]">
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-white/60">Available balance</p>
                  {walletLoading || !wallet ? (
                    <Skeleton className="mt-2 h-8 w-44 bg-white/15" />
                  ) : (
                    <p className="mt-1.5 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
                      {formatMinorAmount(wallet.balance.availableMinor, wallet.balance.currency)}
                    </p>
                  )}
                </div>
                <Button size="sm" className="shrink-0 rounded-full bg-white text-[#071b31] hover:bg-white/90" onClick={() => navigate('/app/payments/receive')}>
                  <ArrowDownToLine size={14} /> Receive
                </Button>
              </div>

              {wallet && (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-3 text-xs">
                  <div><p className="text-white/45">Pending</p><p className="mt-0.5 font-semibold">{formatMinorAmount(wallet.balance.pendingMinor, wallet.balance.currency)}</p></div>
                  <div><p className="text-white/45">Protected</p><p className="mt-0.5 font-semibold">{formatMinorAmount(wallet.balance.protectedMinor, wallet.balance.currency)}</p></div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-white/[0.07] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Landmark size={15} className="shrink-0 text-white/60" />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-semibold tracking-[0.08em]">{account?.accountNumber ?? 'Setup pending'}</p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-white/50">{naitrustId}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full text-white hover:bg-white/10 hover:text-white" aria-label="Copy account number" onClick={() => void copyAccount()}>
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="gap-0 overflow-hidden rounded-3xl p-0 shadow-sm">
            <div className="border-b px-5 py-3.5"><h2 className="font-semibold">Quick access</h2></div>
            <div className="grid grid-cols-2 gap-2 p-2.5">
              {CUSTOMER_SHORTCUTS.map((shortcut) => (
                <button key={shortcut.title} type="button" onClick={() => navigate(shortcut.path)} className="group flex min-w-0 items-center gap-2.5 rounded-2xl p-3 text-left transition-colors hover:bg-muted/50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><shortcut.icon size={16} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-5 sm:truncate">{shortcut.title}</span><span className="mt-0.5 hidden truncate text-[11px] text-muted-foreground sm:block">{shortcut.description}</span></span>
                  <ArrowRight size={14} className="hidden shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 xl:block" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <CustomerOverviewStats
          deals={deals}
          dealsLoading={dealsLoading}
          beneficiaryCount={beneficiaries?.length ?? 0}
          beneficiariesLoading={beneficiariesLoading}
          pendingInvitationCount={pendingInvitations.length}
          onNavigate={navigate}
        />

        {pendingInvitations.length > 0 && (
          <button type="button" onClick={() => navigate('/app/invitations')} className="flex w-full items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3 text-left transition hover:bg-amber-500/[0.08]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400"><Inbox size={17} /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{pendingInvitations.length} invitation{pendingInvitations.length === 1 ? '' : 's'} waiting</span><span className="mt-0.5 block text-xs text-muted-foreground">Review the terms before accepting.</span></span>
            <ArrowRight size={15} className="shrink-0 text-muted-foreground" />
          </button>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Recent protected activity</h2>
            {(deals?.length ?? 0) > 0 && <Button variant="ghost" size="sm" onClick={() => navigate('/app/deals')}>View all <ArrowRight size={14} /></Button>}
          </div>
          <TransactionList
            deals={deals?.slice(0, 3)}
            isLoading={dealsLoading}
            isError={dealsError}
            onCreate={() => navigate('/app/businesses')}
            onSelect={onOpenDeal}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
