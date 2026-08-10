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
  Search,
  Send,
  ShieldCheck,
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
import { CustomerDashboardHome } from '../pieces/dashboard/CustomerDashboardHome';
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
    description: 'Create and share a payment request.',
    icon: MessageCircle,
    accent: 'bg-[#eaf8f1] text-[#087a4b] dark:bg-emerald-500/10 dark:text-emerald-400',
    kind: 'whatsapp',
  },
  {
    title: 'Show payment QR',
    description: 'Show your scan-to-pay code.',
    icon: QrCode,
    accent: 'bg-[#edf4ff] text-primary',
    kind: 'qr',
  },
  {
    title: 'Copy account number',
    description: 'Copy your business account details.',
    icon: Landmark,
    accent: 'bg-[#f5efff] text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    kind: 'copy',
  },
];

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
    return (
      <CustomerDashboardHome
        firstName={firstName}
        naitrustId={user?.naitrustId ?? ''}
        identityVerified={security.kycStatus === 'verified'}
        wallet={wallet}
        walletLoading={isWalletLoading}
        deals={deals}
        dealsLoading={isLoading}
        dealsError={isError}
        invitations={invitations}
        onOpenDeal={handleOpenDeal}
      />
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
        <header className="flex flex-wrap items-center justify-between gap-4 py-1 max-xl:!order-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">Good day, {firstName}</p>
              {security.kycStatus === 'verified' && (
                <Badge variant="success" className="gap-1 rounded-full px-2 py-0.5 text-[11px]">
                  <BadgeCheck size={11} /> Verified business
                </Badge>
              )}
            </div>
            {isBusinessLoading ? (
              <Skeleton className="mt-1 h-9 w-64" />
            ) : (
              <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">{businessName}</h1>
            )}
          </div>
          <Button className="rounded-full px-5" onClick={() => navigate('/app/deals/new')}>
            <ShieldCheck size={15} /> Protect a payment
          </Button>
        </header>

        <section className="grid gap-3 sm:grid-cols-3 max-xl:!order-1">
          {[
            { title: 'Your Trust Profile', detail: 'Show customers the checks you have completed.', path: '/app/trust-profile', icon: BadgeCheck },
            { title: 'Find a business', detail: 'Check a supplier or business before paying.', path: '/app/businesses', icon: Search },
            { title: 'Protect a payment', detail: 'Agree on terms and keep the proof together.', path: '/app/deals/new', icon: ShieldCheck },
          ].map((action) => (
            <button key={action.title} type="button" onClick={() => navigate(action.path)} className="group flex items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><action.icon size={18} /></span>
              <span className="min-w-0 flex-1"><span className="flex items-center gap-1 text-sm font-semibold">{action.title}<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></span><span className="mt-0.5 block text-xs leading-4 text-muted-foreground">{action.detail}</span></span>
            </button>
          ))}
        </section>

        <section className="max-xl:!order-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight">How would you like to get paid?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start where the customer already is, WhatsApp, your counter, or a bank transfer.
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
                className="group flex items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${action.accent}`}>
                  <action.icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    {action.title}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{action.description}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        <div className="grid gap-4 max-xl:!order-1 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="relative overflow-hidden rounded-3xl border-0 bg-primary dark:bg-[#04162f] p-5 text-white shadow-[0_18px_48px_rgba(7,49,88,.18)] sm:p-7">
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
                <p className="mt-1.5 truncate font-mono text-xs font-semibold text-primary">
                  {business?.ntId ?? user?.naitrustId}
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
              Record the terms, payment and delivery evidence in a Protected Deal.
            </p>
          </div>
          <Button variant="outline" className="rounded-full bg-background" onClick={() => navigate('/app/deals/new')}>
            Protect a payment <ArrowRight size={15} />
          </Button>
        </Card>

        <section>
          <div className="mb-3 flex items-start justify-between gap-3 sm:items-end">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">Recent Protected Deals</h2>
              <p className="mt-1 text-sm text-muted-foreground">Deals where the terms, payment status, and evidence stay together.</p>
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
