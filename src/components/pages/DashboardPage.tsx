import { useRef, useState } from 'react';
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
  Download,
} from 'lucide-react';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { BusinessVerificationModal } from '../pieces/business/BusinessVerificationModal';
import { SecureAccountModal } from '../pieces/security/SecureAccountModal';
import { TransactionList } from '../pieces/dashboard/TransactionList';
import { ActivityChart } from '../pieces/dashboard/ActivityChart';
import { DealBreakdown } from '../pieces/dashboard/DealBreakdown';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useAuth } from '../../libs/auth-context';
import { useMyBusiness } from '../../hooks/useMyBusiness';
import { useSecurity } from '../../hooks/useSecurity';
import { useTransactions } from '../../hooks/useTransactions';
import { useWallet } from '../../hooks/useWallet';
import { useInvitations } from '../../hooks/useInvitations';
import { accountTypeOf } from '../../libs/utils/account';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import type { SafeDealSummary } from '../../libs/store/types';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

type CollectionActionKind = 'whatsapp' | 'qr' | 'copy';

const COLLECTION_ACTIONS: {
  title: string;
  description: string;
  icon: typeof MessageCircle;
  accent: string;
  kind: CollectionActionKind;
}[] = [
  {
    title: 'WhatsApp request',
    description: 'Create a request and share it in the conversation.',
    icon: MessageCircle,
    accent: 'bg-[#eaf8f1] text-[#087a4b] dark:bg-emerald-500/10 dark:text-emerald-400',
    kind: 'whatsapp',
  },
  {
    title: 'Show payment QR',
    description: 'Pull up your scan-to-pay code right here — no page change.',
    icon: QrCode,
    accent: 'bg-[#edf4ff] text-primary',
    kind: 'qr',
  },
  {
    title: 'Copy account number',
    description: 'One tap to copy your verified account number to send anywhere.',
    icon: Landmark,
    accent: 'bg-[#f5efff] text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    kind: 'copy',
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
  const { data: business, isLoading: isBusinessLoading } = useMyBusiness();
  const { data: deals, isLoading, isError } = useTransactions();
  const { data: wallet, isLoading: isWalletLoading } = useWallet();
  const { data: invitations } = useInvitations();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const qrDownloadRef = useRef<HTMLDivElement>(null);

  const isBusiness = accountTypeOf(user) !== 'customer';
  const businessName = business?.name ?? (isBusinessLoading ? '' : 'Your business');
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';
  const account = wallet?.virtualAccount;
  const paymentLink = typeof window === 'undefined'
    ? ''
    : `${window.location.origin}/pay/${slugify(businessName)}`;

  const handleOpenDeal = (deal: SafeDealSummary) => {
    navigate(`/app/deals/${deal.id}`);
  };

  const handleCollectionAction = (kind: CollectionActionKind) => {
    if (kind === 'whatsapp') {
      navigate('/app/payments/receive?share=whatsapp');
    } else if (kind === 'qr') {
      setQrDialogOpen(true);
    } else {
      void copyAccount();
    }
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

  const downloadPaymentQr = async () => {
    if (!qrDownloadRef.current) return;
    try {
      const dataUrl = await toPng(qrDownloadRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `${slugify(businessName)}-payment-qr.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Payment QR downloaded');
    } catch {
      toast.error('Could not download the QR code. Please try again.');
    }
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
        <div className="mx-auto flex w-full max-w-9xl flex-col gap-6">
          <header className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.08] via-background to-background px-5 py-6 sm:px-7 sm:py-7">
            <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-wrap items-end justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-muted-foreground">Good day, {firstName}</p>
                  {security.kycStatus === 'verified' && (
                    <Badge variant="success" className="gap-1 rounded-md px-2 py-0.5 text-[11px]">
                      <BadgeCheck size={11} /> Identity verified
                    </Badge>
                  )}
                </div>
                <h1 className="mt-2 max-w-xl text-2xl font-bold tracking-[-0.035em] text-foreground sm:text-3xl">
                  Pay with confidence.
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Send money when you trust them, or protect the transaction when you need clearer terms and delivery proof.
                </p>
              </div>
              <Button className="rounded-full px-5" onClick={() => navigate('/app/deals/new')}>
                <ShieldCheck size={16} /> Create Protected Deal
              </Button>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
            <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#071b31] via-[#0a3158] to-[#071b31] p-5 text-white shadow-[0_18px_48px_rgba(7,49,88,.18)] sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/65">Available balance</p>
                  {isWalletLoading || !wallet ? (
                    <Skeleton className="mt-3 h-10 w-52" />
                  ) : (
                    <p className="mt-2 text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                      {formatMinorAmount(wallet.balance.availableMinor, wallet.balance.currency)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  className="rounded-md bg-white text-[#073158] hover:bg-white/90"
                  onClick={() => navigate('/app/payments/receive')}
                >
                  <ArrowDownToLine size={14} /> Receive money
                </Button>
              </div>

              {wallet && (
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 text-sm">
                  <div>
                    <p className="text-white/55">Pending</p>
                    <p className="mt-1 font-semibold text-white">{formatMinorAmount(wallet.balance.pendingMinor, wallet.balance.currency)}</p>
                  </div>
                  <div>
                    <p className="text-white/55">Protected</p>
                    <p className="mt-1 font-semibold text-white">{formatMinorAmount(wallet.balance.protectedMinor, wallet.balance.currency)}</p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="rounded-2xl border-primary/10 bg-gradient-to-br from-white to-[#edf6ff] p-5 shadow-sm dark:from-card dark:to-primary/10 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Landmark size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Your account</p>
                  <p className="mt-2 font-mono text-xl font-bold tracking-[0.1em]">
                    {account?.accountNumber ?? 'Account setup pending'}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {account ? `${account.bankName} · ${account.accountName}` : 'Complete setup to receive your account number'}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant="outline" size="sm" className="rounded-md" onClick={() => void copyAccount()}>
                  <Copy size={14} /> Copy
                </Button>
                <Button variant="ghost" size="sm" className="rounded-md" onClick={() => navigate('/app/payments/receive')}>
                  View details
                </Button>
              </div>
            </Card>
          </div>

          <Card className="grid gap-0 overflow-hidden rounded-2xl p-0 shadow-sm sm:grid-cols-3">
            {[
              { icon: ShieldCheck, value: activeDeals.length, label: 'Active deals', tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
              { icon: Inbox, value: pendingInvitations.length, label: 'Invitations', tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300' },
              { icon: Clock3, value: needsAction.length, label: 'Need attention', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
            ].map((item, index) => (
              <button key={item.label} type="button" onClick={() => navigate(index === 1 ? '/app/invitations' : '/app/deals')} className="flex items-center gap-3 border-b px-4 py-4 text-left transition hover:bg-muted/40 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}><item.icon size={17} /></span>
                <span><strong className="block text-xl leading-none text-foreground">{item.value}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.label}</span></span>
              </button>
            ))}
          </Card>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-foreground">What would you like to do?</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Send, title: 'Send money', text: 'Pay someone you already trust.', path: '/app/payments/send' },
                { icon: ShieldCheck, title: 'Protect a transaction', text: 'Agree terms before money moves.', path: '/app/deals/new' },
                { icon: Search, title: 'Find a business', text: 'Check who you are dealing with.', path: '/app/businesses' },
              ].map((action) => (
                <button key={action.title} type="button" onClick={() => navigate(action.path)} className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:items-start">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><action.icon size={18} /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center gap-1 text-sm font-semibold text-foreground">{action.title}<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{action.text}</span></span>
                </button>
              ))}
            </div>
          </section>

          {pendingInvitations.length > 0 && (
            <Card className="flex flex-col gap-4 rounded-2xl border-amber-500/20 bg-amber-500/[0.04] p-5 shadow-none sm:flex-row sm:items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400"><Inbox size={19} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">You have {pendingInvitations.length} invitation{pendingInvitations.length === 1 ? '' : 's'} waiting</p>
                <p className="mt-1 text-sm text-muted-foreground">Review the proposed terms before accepting or funding a transaction.</p>
              </div>
              <Button variant="outline" className="rounded-md bg-background" onClick={() => navigate('/app/invitations')}>Review now <ArrowRight size={15} /></Button>
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

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Customer payment QR</DialogTitle>
            <DialogDescription>Let a customer scan this with their phone to pay {businessName}.</DialogDescription>
          </DialogHeader>
          <div ref={qrDownloadRef} className="flex flex-col items-center rounded-2xl border bg-white p-6 text-[#071b31]">
            <QRCode value={paymentLink} size={192} fgColor="#071b31" />
            <p className="mt-4 text-center text-sm font-semibold">{businessName}</p>
            <p className="mt-1 text-center text-xs text-slate-500">Verify before you transfer</p>
          </div>
          <Button className="w-full rounded-full" onClick={() => void downloadPaymentQr()}>
            <Download size={16} /> Download QR code
          </Button>
          <Button variant="outline" className="w-full rounded-full" onClick={() => navigate('/app/payments/receive?share=qr')}>
            More ways to get paid
          </Button>
        </DialogContent>
      </Dialog>

      <div className="mx-auto flex w-full max-w-9xl flex-col gap-7 max-xl:[&>*]:order-3 xl:[&>*]:order-none">
        <header className="flex flex-wrap items-start justify-between gap-4 max-xl:!order-0">
          <div>
            <p className="text-sm text-muted-foreground">Good day, {firstName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {isBusinessLoading ? (
                <Skeleton className="h-8 w-56" />
              ) : (
                <h1 className="text-2xl font-bold tracking-[-0.025em] text-foreground">{businessName}</h1>
              )}
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
            onClick={() => navigate('/app/payments')}
          >
            <Send size={15} /> Send money
          </Button>
        </header>

        <section className="max-xl:!order-2">
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
                onClick={() => handleCollectionAction(action.kind)}
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

        <div className="grid gap-4 max-xl:!order-1 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-[#071b31] via-[#0a3158] to-[#071b31] p-5 text-white shadow-[0_24px_65px_rgba(7,49,88,.22)] sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="text-white/65">{isBusiness ? 'Available business balance' : 'Available balance'}</span>
                </p>
                {isWalletLoading || !wallet ? (
                  <Skeleton className="mt-3 h-10 w-52" />
                ) : (
                  <p className="mt-2 text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                    {formatMinorAmount(wallet.balance.availableMinor, wallet.balance.currency)}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                className="rounded-full bg-white text-[#075cb5] hover:bg-white/90"
                onClick={() => navigate('/app/payments/receive?share=whatsapp')}
              >
                <ArrowDownToLine size={14} /> Request payment
              </Button>
            </div>

            {wallet && (
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/20 pt-4 text-sm">
                <div>
                  <p className="text-white/60">Pending</p>
                  <p className="mt-1 font-semibold text-white">{formatMinorAmount(wallet.balance.pendingMinor, wallet.balance.currency)}</p>
                </div>
                <div>
                  <p className="text-white/60">Protected</p>
                  <p className="mt-1 font-semibold text-white">{formatMinorAmount(wallet.balance.protectedMinor, wallet.balance.currency)}</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="rounded-3xl border-primary/10 bg-gradient-to-br from-white to-[#edf6ff] p-5 shadow-sm dark:from-card dark:to-primary/10 sm:p-7">
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

        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Business performance</h2>
            <p className="mt-1 text-sm text-muted-foreground">How your Protected Deals are trending, at a glance.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
            <ActivityChart deals={deals} isLoading={isLoading} currency={wallet?.balance.currency ?? 'NGN'} />
            <DealBreakdown deals={deals} isLoading={isLoading} currency={wallet?.balance.currency ?? 'NGN'} />
          </div>
        </section>

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
          <div className="mb-3 flex items-start justify-between gap-3 sm:items-end">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">Recent protected transactions</h2>
              <p className="mt-1 text-sm text-muted-foreground">Only transactions that need extra trust and evidence.</p>
            </div>
            {(deals?.length ?? 0) > 0 && (
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => navigate('/app/deals')}>
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
