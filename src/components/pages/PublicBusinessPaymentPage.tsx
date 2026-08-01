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

function titleFromSlug(slug = '') {
  return slug.split('-').filter(Boolean).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
}

export function PublicBusinessPaymentPage() {
  const { businessSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fixedAmount = Number(searchParams.get('amount') || 0);
  const reason = searchParams.get('for');
  const requestedExpiry = Number(searchParams.get('expires') || 15);
  const expiryMinutes = requestedExpiry > 0 ? Math.min(requestedExpiry, 1440) : 15;
  const [amount, setAmount] = useState(fixedAmount > 0 ? String(fixedAmount) : '');
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { data: business, isLoading } = usePublicBusiness(businessSlug);
  const businessName = useMemo(
    () => business?.name || titleFromSlug(businessSlug) || 'Naitrust Business',
    [business?.name, businessSlug],
  );
  const initials = businessName.split(' ').slice(0, 2).map((part) => part[0]).join('');

  // Preview data only. A production payment request must load signed account
  // details from the backend and must never trust account data from URL params.
  const paymentAccount = business?.paymentAccount ?? {
    bankName: 'Naitrust partner bank',
    accountNumber: '7012345678',
    accountName: businessName,
  };
  const isSpecificRequest = fixedAmount > 0 || Boolean(reason);

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

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] dark:bg-background"><Spinner size="lg" /></div>;
  }

  if (!business) {
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

  const checkTransfer = () => {
    setChecking(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] px-4 py-6 dark:bg-background sm:py-10">
      <SEOHead title={`Pay ${businessName}`} description={`Make a verified bank transfer to ${businessName} with Naitrust.`} noindex />
      <div className="mx-auto max-w-xl">
        <div className="mb-7 flex justify-center"><NaitrustLogo /></div>

        <Card className="overflow-hidden rounded-3xl border-0 shadow-xl shadow-slate-950/10">
          <div className="bg-[#071b31] px-6 py-7 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-[#071b31] shadow-lg">
              {initials || <Store />}
            </div>
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <h1 className="text-xl font-bold">{businessName}</h1>
              <BadgeCheck size={18} className="text-emerald-400" />
            </div>
            <p className="mt-1 text-sm text-white/65">Verified Naitrust business</p>
            <p className="mt-2 text-xs text-white/50">{business.category} · {business.ntId}</p>
          </div>

          <div className="space-y-5 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="gap-1 rounded-full">
                {isSpecificRequest ? <MessageCircle size={12} /> : <Store size={12} />}
                {isSpecificRequest ? 'Business payment request' : 'Open business payment'}
              </Badge>
              {isSpecificRequest && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 size={12} /> Request expires in {expiryMinutes === 60 ? '1 hour' : expiryMinutes === 1440 ? '24 hours' : `${expiryMinutes} minutes`}</span>}
            </div>

            {reason && (
              <div className="rounded-xl bg-muted px-4 py-3 text-sm">
                <span className="text-muted-foreground">Payment for:</span>{' '}
                <span className="font-semibold">{reason}</span>
              </div>
            )}

            {fixedAmount > 0 ? (
              <div className="rounded-2xl border bg-muted/40 px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground">Amount to pay</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">₦{fixedAmount.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">This amount was set by {businessName}.</p>
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

            <div className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4">
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
            </div>

            {confirmed ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
                <div className="flex items-center gap-2 font-semibold"><Check size={17} /> Transfer confirmed by payment provider</div>
                <p className="mt-1 text-sm leading-5">Your ordinary business payment receipt is ready. This payment is not a Protected Deal.</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs"><Receipt size={13} /> Receipt NT-PAY-{Date.now().toString().slice(-6)}</p>
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
                disabled={Number(amount) <= 0}
                onClick={checkTransfer}
              >
                I have made the transfer
              </Button>
            )}

            <div className="grid gap-2 rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
              <p className="flex gap-2"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" /> Confirm the account name before sending money.</p>
              <p className="flex gap-2"><LockKeyhole size={14} className="mt-0.5 shrink-0 text-primary" /> A screenshot is not payment confirmation. Naitrust verifies the transfer from the provider.</p>
            </div>

            <div className="border-t pt-5 text-center">
              <p className="text-xs text-muted-foreground">Need agreed terms, delivery evidence, or controlled release?</p>
              <Button variant="link" className="mt-1 h-auto p-0" onClick={() => navigate(`/login?returnTo=${encodeURIComponent(`/app/businesses/${business.id}`)}`)}>
                Sign in to start a Protected Deal
              </Button>
              <p className="mt-2 text-[11px] text-muted-foreground">This ordinary transfer is not a Protected Deal.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
