import { useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Copy,
  Landmark,
  MessageCircle,
  QrCode,
  Send,
  ShieldCheck,
  Search,
  Inbox,
  Clock3,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { BusinessVerificationModal } from '../pieces/business/BusinessVerificationModal';
import { SecureAccountModal } from '../pieces/security/SecureAccountModal';
import { TransactionList } from '../pieces/dashboard/TransactionList';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '../../libs/auth-context';
import { useMyBusiness } from '../../hooks/useMyBusiness';
import { useSecurity } from '../../hooks/useSecurity';
import { useTransactions } from '../../hooks/useTransactions';
import { useWallet } from '../../hooks/useWallet';
import { useInvitations } from '../../hooks/useInvitations';
import { accountTypeOf } from '../../libs/utils/account';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import type { SafeDealSummary } from '../../libs/store/types';

const COLLECTION_ACTIONS = [
  {
    title: 'WhatsApp request',
    description: 'Create a request and share it in the conversation.',
    icon: MessageCircle,
    accent: 'bg-[#eaf8f1] text-[#087a4b] dark:bg-emerald-500/10 dark:text-emerald-400',
    query: '?share=whatsapp',
  },
  {
    title: 'Show payment QR',
    description: 'Let a customer scan and pay your business.',
    icon: QrCode,
    accent: 'bg-[#edf4ff] text-primary',
    query: '?share=qr',
  },
  {
    title: 'Account details',
    description: 'Share your verified business account number.',
    icon: Landmark,
    accent: 'bg-[#f5efff] text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    query: '?share=account',
  },
];

const ACTIVE_DEAL_STATUSES = new Set([
  'pending_counterparty',
  'terms_negotiation',
  'terms_agreed',
  'awaiting_funding',
  'funded',
  'in_progress',
  'evidence_submitted',
  'buyer_review',
  'release_approved',
  'disputed',
]);

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const security = useSecurity();
  const { data: business } = useMyBusiness();
  const { data: deals, isLoading, isError } = useTransactions();
  const { data: wallet, isLoading: isWalletLoading } = useWallet();
  const { data: invitations } = useInvitations();

  const isBusiness = accountTypeOf(user) !== 'customer';
  const businessName = business?.name || user?.name || 'Your business';
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';
  const account = wallet?.virtualAccount;

  const handleOpenDeal = (deal: SafeDealSummary) => {
    navigate(`/app/deals/${deal.id}`);
  };

  const copyAccount = async () => {
    const accountNumber = account?.accountNumber;
    if (!accountNumber) {
      toast.info('Your business account details will appear after account setup.');
      return;
    }
    await navigator.clipboard.writeText(accountNumber);
    toast.success('Account number copied');
  };

  if (!isBusiness) {
    const activeDeals = deals?.filter((deal) => ACTIVE_DEAL_STATUSES.has(deal.status)) ?? [];
    const pendingInvitations = invitations?.filter((invitation) => invitation.status === 'pending') ?? [];
    const needsAction = activeDeals.filter((deal) =>
      ['pending_counterparty', 'terms_negotiation', 'awaiting_funding', 'buyer_review', 'disputed'].includes(deal.status),
    );

    return (
      <DashboardLayout title="Dashboard">
        <SecureAccountModal />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Good day, {firstName}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-foreground">
                Your protected transactions
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Find verified businesses, review invitations, and follow every important purchase.
              </p>
            </div>
            <Button className="rounded-full" onClick={() => navigate('/app/businesses')}>
              <Search size={15} /> Find a business
            </Button>
          </header>

          <section className="grid gap-3 sm:grid-cols-3">
            <Card className="rounded-2xl p-5 shadow-sm bg-[#04162f]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white"><ShieldCheck size={19} /></span>
              <p className="mt-4 text-3xl font-bold text-white">{activeDeals.length}</p>
              <p className="mt-1 text-sm text-white">Active Protected Deals</p>
            </Card>
            <Card className="rounded-2xl p-5 shadow-sm bg-[#04162f]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white"><Inbox size={19} /></span>
              <p className="mt-4 text-3xl font-bold text-white">{pendingInvitations.length}</p>
              <p className="mt-1 text-sm text-white">Invitations to review</p>
            </Card>
            <Card className="rounded-2xl p-5 shadow-sm bg-[#04162f]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white"><Clock3 size={19} /></span>
              <p className="mt-4 text-3xl font-bold text-white">{needsAction.length}</p>
              <p className="mt-1 text-sm text-white">Need your attention</p>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <button type="button" onClick={() => navigate('/app/businesses')} className="group rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Search size={19} /></span>
              <span className="mt-4 flex items-center gap-1 font-semibold">Find a verified business <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
              <span className="mt-1 block text-sm leading-5 text-muted-foreground">Search by business name or NT ID, then pay normally or propose a Protected Deal.</span>
            </button>
            <button type="button" onClick={() => navigate('/app/invitations')} className="group rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400"><Inbox size={19} /></span>
              <span className="mt-4 flex items-center gap-1 font-semibold">Review invitations <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
              <span className="mt-1 block text-sm leading-5 text-muted-foreground">Check the business, amount, terms, and your role before accepting anything.</span>
            </button>
          </section>

          {pendingInvitations.length > 0 && (
            <Card className="flex flex-col gap-4 rounded-2xl border-amber-500/20 bg-amber-500/[0.04] p-5 shadow-none sm:flex-row sm:items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400"><Inbox size={19} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">You have {pendingInvitations.length} invitation{pendingInvitations.length === 1 ? '' : 's'} waiting</p>
                <p className="mt-1 text-sm text-muted-foreground">Review the proposed terms before accepting or funding a transaction.</p>
              </div>
              <Button variant="outline" className="rounded-full bg-background" onClick={() => navigate('/app/invitations')}>Review now <ArrowRight size={15} /></Button>
            </Card>
          )}

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Recent Protected Deals</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your purchases, invitations, evidence, and completion status.</p>
              </div>
              {(deals?.length ?? 0) > 0 && <Button variant="ghost" size="sm" onClick={() => navigate('/app/deals')}>View all <ArrowRight size={14} /></Button>}
            </div>
            <TransactionList deals={deals?.slice(0, 4)} isLoading={isLoading} isError={isError} onCreate={() => navigate('/app/businesses')} onSelect={handleOpenDeal} />
          </section>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <BusinessVerificationModal />
      <SecureAccountModal />

      <div className="mx-auto flex w-full max-w-9xl flex-col gap-7">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Good day, {firstName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-[-0.025em] text-foreground">{businessName}</h1>
              {security.kycStatus === 'verified' && (
                <Badge variant="success" className="gap-1 rounded-full">
                  <BadgeCheck size={12} /> Verified business
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => navigate('/app/payments/send')}
          >
            <Send size={15} /> Send money
          </Button>
        </header>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight">How would you like to get paid?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start where the customer already is—WhatsApp, your counter, or a bank transfer.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {COLLECTION_ACTIONS.map((action, index) => (
              <motion.button
                key={action.title}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/app/payments/receive${action.query}`)}
                className="group flex min-h-36 flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.accent}`}>
                  <action.icon size={19} />
                </span>
                <span className="mt-4 flex items-center gap-1 font-semibold">
                  {action.title}
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
                <span className="mt-1 text-sm leading-5 text-muted-foreground">{action.description}</span>
              </motion.button>
            ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="rounded-2xl p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isBusiness ? 'Available business balance' : 'Available balance'}
                </p>
                {isWalletLoading || !wallet ? (
                  <Skeleton className="mt-3 h-10 w-52" />
                ) : (
                  <p className="mt-2 text-3xl font-bold tracking-[-0.035em] text-foreground">
                    {formatMinorAmount(wallet.balance.availableMinor, wallet.balance.currency)}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => navigate('/app/payments/receive?share=whatsapp')}
              >
                <ArrowDownToLine size={14} /> Request payment
              </Button>
            </div>

            {wallet && (
              <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Pending</p>
                  <p className="mt-1 font-semibold">{formatMinorAmount(wallet.balance.pendingMinor, wallet.balance.currency)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Protected</p>
                  <p className="mt-1 font-semibold">{formatMinorAmount(wallet.balance.protectedMinor, wallet.balance.currency)}</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="rounded-2xl border-primary/10 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Landmark size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Business account</p>
                <p className="mt-2 font-mono text-xl font-bold tracking-[0.1em]">
                  {account?.accountNumber ?? 'Account setup pending'}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {account ? `${account.bankName} · ${account.accountName}` : 'Complete setup to receive your account number'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => void copyAccount()}>
                <Copy size={14} /> Copy
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate('/app/payments/receive?share=account')}>
                View details
              </Button>
            </div>
          </Card>
        </div>

        <Card className="flex flex-col gap-4 rounded-2xl border-emerald-500/20 bg-emerald-500/[0.04] p-5 shadow-none sm:flex-row sm:items-center sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Need protection before money is released?</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Record the terms, payment and delivery evidence in a Protected Transaction.
            </p>
          </div>
          <Button variant="outline" className="rounded-full bg-background" onClick={() => navigate('/app/deals/new')}>
            Create protected transaction <ArrowRight size={15} />
          </Button>
        </Card>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Recent protected transactions</h2>
              <p className="mt-1 text-sm text-muted-foreground">Only transactions that need extra trust and evidence.</p>
            </div>
            {(deals?.length ?? 0) > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/deals')}>
                View all <ArrowRight size={14} />
              </Button>
            )}
          </div>
          <TransactionList
            deals={deals?.slice(0, 3)}
            isLoading={isLoading}
            isError={isError}
            onCreate={() => navigate('/app/deals/new')}
            onSelect={handleOpenDeal}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
