import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  Check,
  Clock3,
  Copy,
  Landmark,
  Loader2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Store,
  Receipt,
  ArrowRight,
  Building2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import { SEOHead } from '../utility/SEOHead';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Spinner from '../ui/spinner';
import { usePublicBusiness } from '../../hooks/useBusinessDirectory';
import { useAuth } from '../../libs/auth-context';
import { useConfirmTrustCheckoutTransfer, useTrustCheckout } from '../../hooks/useTrustCheckouts';
import { trustCheckoutsApi } from '../../libs/api/trust-checkouts.api';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import spiralBackground from '../../assets/spiral.svg';

function titleFromSlug(slug = '') {
  return slug.split('-').filter(Boolean).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
}

export function PublicBusinessPaymentPage() {
  const { businessSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request');
  const legacyFixedAmount = Number(searchParams.get('amount') || 0);
  const legacyReason = searchParams.get('for');
  const requestedExpiry = Number(searchParams.get('expires') || 15);
  const expiryMinutes = requestedExpiry > 0 ? Math.min(requestedExpiry, 1440) : 15;
  const [amount, setAmount] = useState(legacyFixedAmount > 0 ? String(legacyFixedAmount) : '');
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { data: business, isLoading } = usePublicBusiness(requestId ? undefined : businessSlug);
  const { data: checkout, isLoading: checkoutLoading } = useTrustCheckout(requestId);
  const confirmCheckout = useConfirmTrustCheckoutTransfer();
  const fixedAmount = checkout?.amountMinor ? checkout.amountMinor / 100 : legacyFixedAmount;
  const reason = checkout?.purpose || legacyReason;
  const businessName = useMemo(
    () => checkout?.recipientName || business?.name || titleFromSlug(businessSlug) || 'Naitrust Business',
    [business?.name, businessSlug, checkout?.recipientName],
  );
  const initials = businessName.split(' ').slice(0, 2).map((part) => part[0]).join('');

  // Preview data only. A production payment request must load signed account
  // details from the backend and must never trust account data from URL params.
  const paymentAccount = checkout?.account ?? business?.paymentAccount ?? {
    bankName: 'Naitrust partner bank',
    accountNumber: '7012345678',
    accountName: businessName,
  };
  const isSpecificRequest = Boolean(checkout) || fixedAmount > 0 || Boolean(reason);

  useEffect(() => {
    if (checkout?.amountMinor) setAmount(String(checkout.amountMinor / 100));
  }, [checkout?.amountMinor]);

  useEffect(() => {
    if (requestId) void trustCheckoutsApi.recordEvent(requestId, 'link_viewed');
  }, [requestId]);

  // Mock provider webhook. Production changes this state only after Anchor (or
  // the configured regulated provider) reports a matching inbound transfer.
  // Keep hooks above conditional returns so their order remains stable while
  // the business query moves from loading to resolved.
  useEffect(() => {
    if (!checking || confirmed) return;
    const timer = window.setTimeout(() => {
      setConfirmed(true);
      setChecking(false);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [checking, confirmed]);

  if (isLoading || (requestId && checkoutLoading)) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] dark:bg-background"><Spinner size="lg" /></div>;
  }

  if ((!business && !checkout) || (requestId && !checkout)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] px-4 dark:bg-background">
        <Card className="max-w-md items-center rounded-3xl p-8 text-center shadow-xl">
          <Store size={28} className="text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold">Business profile unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Check the payment link with the business before transferring money.</p>
        </Card>
      </div>
    );
  }

  const copyAccount = async () => {
    await navigator.clipboard.writeText(paymentAccount.accountNumber);
    setCopied(true);
    toast.success('Account number copied');
    window.setTimeout(() => setCopied(false), 2000);
  };

  const checkTransfer = async () => {
    if (requestId) {
      setChecking(true);
      try {
        const response = await confirmCheckout.mutateAsync(requestId);
        if (response.data.status === 'paid') {
          setConfirmed(true);
        } else {
          toast.info('Transfer not confirmed yet. We will update this page after the payment provider reports it.');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'The transfer has not been confirmed yet.');
      } finally {
        setChecking(false);
      }
      return;
    }
    setChecking(true);
  };

  const startProtectedTransaction = () => {
    if (requestId) void trustCheckoutsApi.recordEvent(requestId, 'protection_selected');
    const dealQuery = new URLSearchParams();
    if (requestId) dealQuery.set('checkout', requestId);
    if (business) {
      dealQuery.set('business', business.id);
      dealQuery.set('name', business.name);
      if (business.email) dealQuery.set('email', business.email);
    }
    const returnTo = `/app/deals/new?${dealQuery.toString()}`;
    navigate(isAuthenticated ? returnTo : `/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const isUnavailable = checkout?.status === 'expired' || checkout?.status === 'revoked';
  const isPaid = confirmed || checkout?.status === 'paid';
  const allowsDirect = !checkout || checkout.paymentMode !== 'protected';
  const allowsProtected = !checkout || checkout.paymentMode !== 'direct';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f9] px-4 py-6 dark:bg-background sm:py-10">
      <SEOHead title={`Pay ${businessName}`} description={`Make a verified bank transfer to ${businessName} with Naitrust.`} noindex />
      <img src={spiralBackground} alt="" aria-hidden="true" className="pointer-events-none absolute -right-48 -top-40 w-[42rem] opacity-[0.055] dark:opacity-[0.035]" />
      <div className="relative mx-auto max-w-xl">
        <Card className="overflow-hidden rounded-3xl border-0 shadow-xl shadow-slate-950/10">
          <div className="bg-[#071b31] px-6 py-7 text-center text-white">
            <div className="mb-6 flex items-center justify-between gap-3 text-left">
              <button type="button" onClick={() => navigate('/')} aria-label="Go to Naitrust home" className="rounded-lg transition-opacity hover:opacity-80"><NaitrustLogo size="sm" textColor="text-white" /></button>
              <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">Secure payment</Badge>
            </div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-[#071b31] shadow-lg">
              {initials || <Store />}
            </div>
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <h1 className="text-xl font-bold">{businessName}</h1>
              <BadgeCheck size={18} className="text-emerald-400" />
            </div>
            <p className="mt-1 text-sm text-white/65">{checkout?.recipientType === 'individual' ? 'Naitrust individual account' : checkout?.verification.businessVerified || business?.verified ? 'Verified Naitrust business' : 'Naitrust business account'}</p>
            <p className="mt-2 text-xs text-white/50">{checkout?.businessCategory || business?.category} · {checkout?.recipientNtId || business?.ntId}</p>
          </div>

          <div className="space-y-4 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="gap-1 rounded-full">
                {isSpecificRequest ? <MessageCircle size={12} /> : <Store size={12} />}
                {isSpecificRequest ? 'Business payment request' : 'Open business payment'}
              </Badge>
              {isSpecificRequest && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 size={12} /> {checkout ? `Expires ${new Date(checkout.expiresAt).toLocaleString()}` : `Request expires in ${expiryMinutes === 60 ? '1 hour' : expiryMinutes === 1440 ? '24 hours' : `${expiryMinutes} minutes`}`}</span>}
            </div>

            {checkout && <div className="border-b pb-4">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-muted-foreground">Payment for</p><p className="mt-1 font-semibold">{checkout.title}</p>{reason && reason !== checkout.title && <p className="mt-1 text-sm leading-5 text-muted-foreground">{reason}</p>}</div><Badge variant="secondary" className="shrink-0 capitalize">{checkout.category.replace('_', ' ')}</Badge></div>
              <p className="mt-3 text-xs text-muted-foreground">Requested for <span className="font-medium text-foreground">{checkout.requestedFromName || 'any customer with this link'}</span></p>
            </div>}

            {!checkout && reason && <p className="text-sm"><span className="text-muted-foreground">Payment for:</span> <span className="font-semibold">{reason}</span></p>}

            {fixedAmount > 0 ? (
              <div className="py-1">
                <p className="text-xs font-medium text-muted-foreground">Amount to pay</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">₦{fixedAmount.toLocaleString()}</p>
              </div>
            ) : (
              <div>
                <Label htmlFor="pay-amount">Amount to pay (NGN)</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">₦</span>
                  <Input id="pay-amount" type="number" min={1} value={amount} onChange={(event) => setAmount(event.target.value)} className="h-12 pl-8 text-lg font-semibold" placeholder="0.00" />
                </div>
              </div>
            )}

            {checkout && <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y py-3 text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700"><BadgeCheck size={14} /> {checkout.verification.businessVerified || checkout.verification.identityVerified ? 'Identity verified' : 'Verification incomplete'}</span>
              {checkout.verification.ownershipVerified && <span className="inline-flex items-center gap-1.5 text-muted-foreground"><UserRound size={14} /> Representative verified</span>}
              <Button variant="link" className="ml-auto h-auto p-0 text-xs" onClick={() => {
                const returnTo = `${window.location.pathname}${window.location.search}`;
                window.open(`/trust/${businessSlug}?from=payment&returnTo=${encodeURIComponent(returnTo)}`, '_blank', 'noopener,noreferrer');
              }}>Trust Profile <ArrowRight size={13} /></Button>
            </div>}

            {checkout?.deliveryExpectation && <div className="rounded-xl border px-4 py-3 text-sm"><span className="text-muted-foreground">Delivery expectation:</span> <span className="font-semibold">{checkout.deliveryExpectation}</span></div>}

            {isUnavailable && <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm"><p className="font-semibold">This Trust Checkout is no longer available.</p><p className="mt-1 text-muted-foreground">Ask the recipient to create a new payment request before transferring money.</p></div>}

            {allowsDirect && !isUnavailable && <div className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Landmark size={16} className="text-primary" /> Transfer to this account
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="text-xs text-muted-foreground">{paymentAccount.bankName}</p>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-[0.1em]">{paymentAccount.accountNumber}</p>
                  <p className="mt-1 text-sm font-medium">{paymentAccount.accountName}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full bg-background" onClick={() => void copyAccount()}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy number'}
                </Button>
              </div>
            </div>}

            {isPaid ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
                <div className="flex items-center gap-2 font-semibold"><Check size={17} /> Transfer confirmed by payment provider</div>
                <p className="mt-1 text-sm leading-5">Your ordinary business payment receipt is ready. This payment is not a Protected Deal.</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs"><Receipt size={13} /> Receipt {checkout?.paymentReference || `NT-PAY-${Date.now().toString().slice(-6)}`}</p>
                {checkout && <div className="mt-3 rounded-xl bg-white/60 p-3 text-xs dark:bg-black/10"><p className="font-semibold">Next action</p><p className="mt-1">{checkout.deliveryExpectation ? `Wait for: ${checkout.deliveryExpectation}` : 'Keep this receipt and follow up with the recipient for delivery or completion.'}</p></div>}
              </div>
            ) : checking ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
                <div className="flex items-center gap-2 font-semibold">
                  <Loader2 size={17} className="animate-spin" /> Checking for your transfer
                </div>
                <p className="mt-1 text-sm leading-5">
                  Keep this page open. Naitrust will confirm only after the payment provider reports that the money arrived.
                </p>
              </div>
            ) : (
              <Button
                className="h-12 w-full rounded-xl text-base"
                disabled={Number(amount) <= 0 || isUnavailable}
                onClick={() => void checkTransfer()}
              >
                I have made the transfer
              </Button>
            )}

            <p className="flex gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" /> Confirm the account name before paying. Screenshots are not proof of payment; Naitrust waits for provider confirmation.</p>

            {allowsProtected && !isUnavailable && !isPaid && <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-[#071b31] dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-foreground">
              <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm dark:bg-background"><LockKeyhole size={18} /></span><div><p className="font-semibold">Need more than a transfer?</p><p className="mt-1 text-xs leading-5 text-[#527086] dark:text-muted-foreground">Keep the agreement, delivery evidence, milestones, messages, payment status, and any issues together in one Protected Deal.</p></div></div>
              {checkout && (checkout.evidenceRequirements.length > 0 || checkout.milestones.length > 0) && <div className="mt-4 grid gap-2 text-xs text-[#527086] dark:text-muted-foreground">{checkout.evidenceRequirements.map((item) => <p key={item}>Evidence: {item}</p>)}{checkout.milestones.map((item) => <p key={item}>Milestone: {item}</p>)}</div>}
              <Button className="mt-4 w-full rounded-full" onClick={startProtectedTransaction}>Protect this transaction <ArrowRight size={16} /></Button>
            </div>}
            {allowsDirect && !isPaid && <p className="text-center text-[11px] text-muted-foreground">A direct transfer is not a Protected Deal.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
