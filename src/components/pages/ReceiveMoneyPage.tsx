import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import {
  ArrowDownToLine,
  Check,
  Copy,
  Landmark,
  Link2,
  MessageCircle,
  AtSign,
  QrCode,
  Download,
  Share2,
  ShieldCheck,
  Mail,
  Smartphone,
  Code2,
  Loader2,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../libs/auth-context';
import { useWallet } from '../../hooks/useWallet';
import { useMyBusiness } from '../../hooks/useMyBusiness';
import { useCounterparties } from '../../hooks/useCounterparties';
import { accountTypeOf } from '../../libs/utils/account';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { useCreateTrustCheckout } from '../../hooks/useTrustCheckouts';
import type { TrustCheckout, TrustCheckoutCategory } from '../../libs/store/types';
import { LIGHT_PROTECTION_MAX_AMOUNT_MINOR } from '../../libs/protected-deals/create-deal-options';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function ReceiveMoneyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: wallet, isLoading: isWalletLoading } = useWallet();
  const { data: business, isLoading: isBusinessLoading } = useMyBusiness();
  const { data: counterparties } = useCounterparties();
  const [copied, setCopied] = useState('');
  const [linkAmount, setLinkAmount] = useState('');
  const [linkReason, setLinkReason] = useState('');
  const [linkExpiryMinutes, setLinkExpiryMinutes] = useState('15');
  const [selectedCustomerId, setSelectedCustomerId] = useState('new');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [checkoutTitle, setCheckoutTitle] = useState('');
  const [checkoutCategory, setCheckoutCategory] = useState<TrustCheckoutCategory>('product');
  const [amountMode, setAmountMode] = useState<'fixed' | 'customer'>('fixed');
  const [createdCheckout, setCreatedCheckout] = useState<TrustCheckout | null>(null);
  const [showRequestOptions, setShowRequestOptions] = useState(false);
  const createTrustCheckout = useCreateTrustCheckout();
  const isBusiness = accountTypeOf(user) !== 'customer';
  const accountContentLoading = isWalletLoading || (isBusiness && isBusinessLoading);
  const account = wallet?.virtualAccount;
  const shareMode = searchParams.get('share');
  const [activeMethod, setActiveMethod] = useState<'account' | 'request' | 'qr'>(
    shareMode === 'request' ? 'request' : shareMode === 'qr' ? 'qr' : 'account',
  );
  const qrPosterRef = useRef<HTMLDivElement>(null);
  const savedCustomers = useMemo(
    () => (counterparties ?? []).filter((item) =>
      !item.isBlocked && (item.relation === 'customer' || item.relation === 'buyer')),
    [counterparties],
  );
  const selectedCustomer = savedCustomers.find((item) => item.id === selectedCustomerId);
  const paymentCustomerName = selectedCustomer?.name || newCustomerName.trim();

  const paymentLink = useMemo(() => {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    const slug = business?.slug || slugify(business?.name || user?.name || 'business');
    return createdCheckout
      ? `${origin}/pay/${slug}?request=${encodeURIComponent(createdCheckout.publicId)}&source=qr`
      : `${origin}/pay/${slug}`;
  }, [business?.name, business?.slug, createdCheckout, user?.name]);

  const createCheckout = async () => {
    if (!business) return toast.error('Your business profile is still loading.');
    if (!paymentCustomerName) return toast.error('Choose a customer or enter their name.');
    if (!checkoutTitle.trim()) return toast.error('Enter a payment title.');
    if (amountMode === 'fixed' && Number(linkAmount) <= 0) return toast.error('Enter the fixed amount.');

    try {
      const response = await createTrustCheckout.mutateAsync({
        businessId: business.id,
        businessSlug: business.slug || slugify(business.name),
        recipientName: business.name,
        recipientType: 'business',
        recipientNtId: business.ntId,
        businessCategory: business.category,
        registrationNumberMasked: business.rcNumber ? `••••${business.rcNumber.slice(-4)}` : undefined,
        phone: business.phone,
        supportEmail: business.email,
        account: business.paymentAccount ?? {
          bankName: 'Anchor MFB',
          accountNumber: '7012345678',
          accountName: business.name,
        },
        verification: {
          identityVerified: Boolean(business.identityVerifiedAt || business.verified),
          businessVerified: Boolean(business.businessVerifiedAt || business.verified),
          ownershipVerified: Boolean(business.ownershipVerifiedAt || business.verified),
          verifiedAt: business.businessVerifiedAt || business.identityVerifiedAt,
          expiresAt: business.verificationExpiresAt,
        },
        requestedFromName: paymentCustomerName,
        category: checkoutCategory,
        title: checkoutTitle.trim(),
        purpose: linkReason.trim() || checkoutTitle.trim(),
        description: linkReason.trim() || undefined,
        amountMinor: amountMode === 'fixed' ? Math.round(Number(linkAmount) * 100) : undefined,
        customerEntersAmount: amountMode === 'customer',
        currency: 'NGN',
        paymentMode: 'direct',
        expiresInMinutes: Number(linkExpiryMinutes),
        evidenceRequirements: [],
        milestones: [],
      });
      setCreatedCheckout(response.data);
      toast.success('Trust Checkout ready to share');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create the Trust Checkout.');
    }
  };

  const ensureSmartQr = async () => {
    if (createdCheckout || createTrustCheckout.isPending || !business) return;
    try {
      const response = await createTrustCheckout.mutateAsync({
        businessId: business.id,
        businessSlug: business.slug || slugify(business.name),
        recipientName: business.name,
        recipientType: 'business',
        recipientNtId: business.ntId,
        businessCategory: business.category,
        phone: business.phone,
        supportEmail: business.email,
        account: business.paymentAccount ?? { bankName: 'Anchor MFB', accountNumber: '7012345678', accountName: business.name },
        verification: { identityVerified: Boolean(business.identityVerifiedAt || business.verified), businessVerified: Boolean(business.businessVerifiedAt || business.verified), ownershipVerified: Boolean(business.ownershipVerifiedAt || business.verified), verifiedAt: business.businessVerifiedAt || business.identityVerifiedAt, expiresAt: business.verificationExpiresAt },
        requestedFromName: 'Walk-in customer',
        category: 'custom',
        title: 'Customer payment',
        purpose: 'Customer payment',
        customerEntersAmount: true,
        currency: 'NGN',
        paymentMode: 'direct',
        expiresInMinutes: 1440,
        evidenceRequirements: [],
        milestones: [],
      });
      setCreatedCheckout(response.data);
    } catch { toast.error('Could not create the secure payment QR.'); }
  };

  useEffect(() => {
    if (activeMethod === 'qr' && business && !createdCheckout) void ensureSmartQr();
    // The QR is created once per mounted receive screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMethod, business?.id, createdCheckout]);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      toast.error('Could not copy. Please copy it manually.');
    }
  };

  const whatsappMessage = useMemo(() => {
    const amountText = Number(linkAmount) > 0
      ? formatMinorAmount(Math.round(Number(linkAmount) * 100), 'NGN')
      : 'the amount shown on the payment page';
    const purposeText = linkReason.trim() ? ` for ${linkReason.trim()}` : '';
    return [
      `Hello${paymentCustomerName ? ` ${paymentCustomerName}` : ''},`,
      `Payment request from ${business?.name || 'my business'}`,
      `Please pay ${amountText}${purposeText}.`,
      '',
      'Verify the business and get the correct account number here:',
      paymentLink,
      '',
      'Naitrust will confirm the transfer automatically. Do not rely on a screenshot as proof of payment.',
    ].join('\n');
  }, [business?.name, linkAmount, linkReason, paymentCustomerName, paymentLink]);

  const shareToWhatsApp = () => {
    if (!createdCheckout) return toast.error('Create the Trust Checkout first.');
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
  };

  const shareByEmail = () => {
    if (!createdCheckout) return toast.error('Create the Trust Checkout first.');
    window.location.href = `mailto:?subject=${encodeURIComponent(`Payment request from ${business?.name ?? 'Naitrust'}`)}&body=${encodeURIComponent(whatsappMessage)}`;
  };

  const shareBySms = () => {
    if (!createdCheckout) return toast.error('Create the Trust Checkout first.');
    window.location.href = `sms:?&body=${encodeURIComponent(whatsappMessage)}`;
  };

  const copyCheckoutButton = () => {
    if (!createdCheckout) return toast.error('Create the Trust Checkout first.');
    const snippet = `<a href="${paymentLink}" target="_blank" rel="noopener noreferrer">Pay with Naitrust</a>`;
    void copy(snippet, 'embed');
  };

  const downloadQrPoster = async () => {
    if (!qrPosterRef.current) return;
    try {
      const dataUrl = await toPng(qrPosterRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `${slugify(business?.name || 'naitrust-business')}-payment-qr.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Payment QR downloaded');
    } catch {
      toast.error('Could not download the QR. Please try again.');
    }
  };

  const copyQrImage = async () => {
    if (!qrPosterRef.current) return;
    try {
      const dataUrl = await toPng(qrPosterRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      toast.success('QR code copied to clipboard');
    } catch {
      toast.error('Could not copy the QR code. Try downloading it instead.');
    }
  };

  const shareQrPoster = async () => {
    if (!qrPosterRef.current) return;
    const name = business?.name || 'this business';
    const shareText = `Scan or tap to pay ${name} securely on Naitrust.`;
    try {
      const dataUrl = await toPng(qrPosterRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${slugify(name)}-payment-qr.png`, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `Pay ${name} on Naitrust`, text: shareText, files: [file] });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: `Pay ${name} on Naitrust`, text: shareText, url: paymentLink });
        return;
      }
      await copy(paymentLink, 'share-link');
      toast.info("Sharing isn't supported on this browser: payment link copied instead.");
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        toast.error('Could not share the QR code. Please try again.');
      }
    }
  };

  return (
    <DashboardLayout title="Receive Money">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5 sm:overflow-hidden sm:rounded-3xl sm:border sm:border-primary/15 sm:bg-gradient-to-r sm:from-primary/[0.09] sm:via-background sm:to-background sm:px-7 sm:py-5 sm:shadow-sm">
          <div className="flex items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15 sm:flex">
              <ArrowDownToLine size={21} />
            </span>
            <div>
              <p className="mb-1.5 hidden text-xs font-bold uppercase tracking-[0.15em] text-primary sm:block">
                {isBusiness ? 'Your business payments' : 'Receive money'}
              </p>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                {isBusiness ? <><span className="sm:hidden">Your business payments</span><span className="hidden sm:inline">Get paid your way</span></> : 'Receive Money'}
              </h1>
              <p className="mt-1.5 hidden max-w-xl text-sm leading-6 text-muted-foreground sm:block">
                {isBusiness
                  ? 'Share your account number, payment link or QR code with any customer.'
                  : 'Use your personal account number to receive money from any Nigerian bank.'}
              </p>
            </div>
          </div>
        </div>

        {accountContentLoading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        ) : isBusiness && (
          <>
          <div className="mb-4 flex">
            <div className="inline-flex w-full items-center rounded-xl border bg-muted/40 p-1 sm:w-auto">
            {[
              { id: 'account' as const, icon: Landmark, title: 'Account' },
              { id: 'request' as const, icon: Link2, title: 'Request' },
              { id: 'qr' as const, icon: QrCode, title: 'QR code' },
            ].map((method) => <button key={method.id} type="button" aria-pressed={activeMethod === method.id} onClick={() => { setActiveMethod(method.id); if (method.id === 'qr') void ensureSmartQr(); }} className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:min-w-32 sm:text-sm ${activeMethod === method.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <method.icon size={15} className="hidden sm:block" /><span className="truncate">{method.title}</span>
            </button>)}
            </div>
          </div>

          <div className="mb-5 w-full">
          <div className={`${activeMethod !== 'account' ? 'hidden' : ''} grid gap-5 md:grid-cols-[1.2fr_.8fr]`}>
            <Card className="overflow-hidden border-primary/15 shadow-sm">
              <div className="bg-primary p-6 text-white dark:bg-[#04162f]">
                <p className="text-sm font-medium text-white/70">
                  Business Naitrust account
                </p>
                <p className="mt-5 font-mono text-2xl font-bold tracking-[0.12em]">
                  {account?.accountNumber ?? 'Account setup pending'}
                </p>
                <p className="mt-2 text-sm text-white/80">
                  {account
                    ? `${account.bankName} · ${account.accountName}`
                    : 'Your regulated partner account will appear here'}
                </p>
                <p className="mt-2 font-mono text-xs font-semibold text-white/60">
                  {business?.ntId ?? user?.naitrustId ?? 'Naitrust ID setup pending'}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <p className="text-xs text-muted-foreground">Receive a bank transfer from any Nigerian bank.</p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!account?.accountNumber}
                  onClick={() => account?.accountNumber && void copy(account.accountNumber, 'business-account')}
                >
                  {copied === 'business-account' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'business-account' ? 'Copied' : 'Copy number'}
                </Button>
              </div>
            </Card>

            <Card className="flex flex-col justify-center gap-3 p-4 shadow-sm sm:p-6">
              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                <AtSign size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">Business Naitrust ID</p>
                <p className="mt-1 text-xs text-muted-foreground">Share this ID when a customer wants to pay your business on Naitrust.</p>
              </div>
              <button
                type="button"
                disabled={!(business?.ntId ?? user?.naitrustId)}
                onClick={() => {
                  const businessNaitrustId = business?.ntId ?? user?.naitrustId;
                  if (businessNaitrustId) void copy(businessNaitrustId, 'business-naitrust-id');
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="min-w-0 truncate font-mono text-sm font-semibold">
                  {business?.ntId ?? user?.naitrustId ?? 'ID setup pending'}
                </span>
                {(business?.ntId ?? user?.naitrustId) && (copied === 'business-naitrust-id' ? <Check size={14} /> : <Copy size={14} />)}
              </button>
            </Card>
          </div>

          <Card className={`${activeMethod !== 'request' ? 'hidden' : ''} overflow-hidden rounded-none border-x-0 border-primary/15 shadow-none sm:rounded-3xl sm:border-x sm:shadow-sm`}>
            <div className="px-0 py-4 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#e9f8f0] text-[#087a4b] dark:bg-emerald-500/10 dark:text-emerald-400 sm:flex">
                  <Link2 size={19} />
                </span>
                <div>
                  <p className="font-semibold">Request payment</p>
                  <p className="hidden text-xs text-muted-foreground sm:block">Set the payment details, then share the link. This is a payment request, not a Protected Deal — there's no held payment, evidence, or dispute review.</p>
                </div>
                </div>
                <div className="hidden flex-wrap gap-2 sm:flex"><Button variant="ghost" size="sm" className="rounded-full" onClick={() => window.open(`/trust/${business?.slug || slugify(business?.name || '')}`, '_blank', 'noopener,noreferrer')}><BadgeCheck size={15} /> Trust Profile</Button><Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/app/deals/new')}><ShieldCheck size={15} /> Protected Deal</Button></div>
              </div>
              <div className="mt-6 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="whatsapp-customer">Customer or payer</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger id="whatsapp-customer" className="mt-1.5 w-full">
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New or walk-in customer</SelectItem>
                      {savedCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}{customer.businessName ? ` · ${customer.businessName}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={`${showRequestOptions ? 'block' : 'hidden'} sm:block`}>
                  <Label htmlFor="checkout-category">Transaction type</Label>
                  <Select value={checkoutCategory} onValueChange={(value) => setCheckoutCategory(value as TrustCheckoutCategory)}>
                    <SelectTrigger id="checkout-category" className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem><SelectItem value="service">Service</SelectItem>
                      <SelectItem value="supplier_order">Supplier order</SelectItem><SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="project">Project</SelectItem><SelectItem value="rental">Rental</SelectItem>
                      <SelectItem value="custom">Custom transaction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={`${showRequestOptions ? 'block' : 'hidden'} sm:block`}>
                  <Label htmlFor="payment-expiry">Request expires after</Label>
                  <Select value={linkExpiryMinutes} onValueChange={setLinkExpiryMinutes}>
                    <SelectTrigger id="payment-expiry" className="mt-1.5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedCustomerId === 'new' && (
                  <div>
                    <Label htmlFor="whatsapp-customer-name">Customer name</Label>
                    <Input id="whatsapp-customer-name" value={newCustomerName} onChange={(event) => setNewCustomerName(event.target.value)} placeholder="Enter the customer's name" className="mt-1.5" />
                  </div>
                )}
                <div className="sm:col-span-2 lg:col-span-2">
                  <Label htmlFor="checkout-title">Payment title</Label>
                  <Input id="checkout-title" value={checkoutTitle} onChange={(event) => setCheckoutTitle(event.target.value)} placeholder="e.g. Website design deposit" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="amount-mode">Amount</Label>
                  <Select value={amountMode} onValueChange={(value) => setAmountMode(value as 'fixed' | 'customer')}>
                    <SelectTrigger id="amount-mode" className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="fixed">Set a fixed amount</SelectItem><SelectItem value="customer">Customer enters amount</SelectItem></SelectContent>
                  </Select>
                </div>
                {amountMode === 'fixed' && <div><Label htmlFor="whatsapp-amount">Amount (NGN)</Label><Input id="whatsapp-amount" type="number" min={1} value={linkAmount} onChange={(event) => setLinkAmount(event.target.value)} placeholder="0.00" className="mt-1.5" /></div>}
                <button type="button" onClick={() => setShowRequestOptions((value) => !value)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary sm:hidden">More options <ChevronDown size={14} className={`transition-transform ${showRequestOptions ? 'rotate-180' : ''}`} /></button>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="whatsapp-reason">Payment details <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Textarea id="whatsapp-reason" value={linkReason} onChange={(event) => setLinkReason(event.target.value)} placeholder="Add a short note" className="mt-1.5 min-h-20 resize-y sm:min-h-24" />
                </div>
              </div>
              {amountMode === 'fixed' && Math.round(Number(linkAmount) * 100) > LIGHT_PROTECTION_MAX_AMOUNT_MINOR && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">This amount may be better suited to a Protected Deal</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">A payment link only requests money — it doesn't hold the payment, collect evidence, or support a dispute review. For amounts above ₦50,000, a Protected Deal gives your customer that protection.</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-3 rounded-full bg-background"
                      onClick={() => navigate(`/app/deals/new?amount=${encodeURIComponent(linkAmount)}${paymentCustomerName ? `&name=${encodeURIComponent(paymentCustomerName)}` : ''}`)}
                    >
                      <ShieldCheck size={14} /> Start a Protected Deal instead
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-5 flex justify-end border-t pt-4 sm:mt-6 sm:pt-5"><Button className="h-10 w-full rounded-full px-7 text-xs sm:h-11 sm:w-auto sm:rounded-md sm:text-sm" disabled={createTrustCheckout.isPending} onClick={() => void createCheckout()}>{createTrustCheckout.isPending ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}{createdCheckout ? 'Create another link' : 'Create payment link'} <ArrowRight size={15} /></Button></div>
              {createdCheckout && <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.045] p-4 sm:p-5">
                <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700"><Check size={15} /></span><div><p className="text-sm font-semibold">Payment link ready</p><p className="text-xs text-muted-foreground">Share it with your customer to collect this payment.</p></div></div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border bg-background p-2"><p className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">{paymentLink}</p><Button size="sm" variant="ghost" className="shrink-0 rounded-lg" onClick={() => void copy(paymentLink, 'link')}>{copied === 'link' ? <Check size={14} /> : <Copy size={14} />} {copied === 'link' ? 'Copied' : 'Copy'}</Button></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" className="rounded-full bg-[#0b8f57] text-white hover:bg-[#087a4b]" onClick={shareToWhatsApp}><MessageCircle size={15} /> WhatsApp</Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={shareByEmail}><Mail size={15} /> Email</Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={shareBySms}><Smartphone size={15} /> SMS</Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}>Open link <ArrowRight size={14} /></Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={copyCheckoutButton}><Code2 size={14} /> Website button</Button>
                </div>
              </div>}
            </div>
          </Card>
          </div>

          <Card className={`${activeMethod !== 'qr' ? 'hidden' : ''} w-full overflow-hidden rounded-2xl p-0 shadow-sm`}>
            <div className="grid items-center lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="order-2 p-4 sm:p-6 lg:order-1 lg:p-7">
                <div>
                  <p className="text-base font-semibold">Customer payment QR</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">Customers scan to pay {business?.name} on its verified payment page.</p>
                </div>
                <div className="mt-4 grid grid-cols-4 divide-x overflow-hidden rounded-xl border bg-background">
                  <button disabled={!createdCheckout} type="button" className="flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-medium hover:bg-muted/50 disabled:opacity-40 sm:h-11 sm:flex-row sm:gap-1.5 sm:text-xs" onClick={() => void copyQrImage()}><Copy size={15} />Copy</button>
                  <button disabled={!createdCheckout} type="button" className="flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-medium hover:bg-muted/50 disabled:opacity-40 sm:h-11 sm:flex-row sm:gap-1.5 sm:text-xs" onClick={() => void shareQrPoster()}><Share2 size={15} />Share</button>
                  <button disabled={!createdCheckout} type="button" className="flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-medium hover:bg-muted/50 disabled:opacity-40 sm:h-11 sm:flex-row sm:gap-1.5 sm:text-xs" onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}><Eye size={15} />Preview</button>
                  <button disabled={!createdCheckout} type="button" className="flex h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-primary hover:bg-muted/50 disabled:opacity-40 sm:h-11 sm:flex-row sm:gap-1.5 sm:text-xs" onClick={() => void downloadQrPoster()}><Download size={15} />Download</button>
                </div>
              </div>
              <div className="order-1 border-b bg-muted/30 p-5 lg:order-2 lg:border-b-0 lg:border-l">
                <div ref={qrPosterRef} className="flex flex-col items-center rounded-2xl border bg-white p-5 text-[#071b31] shadow-sm">
                  <p className="mb-3 max-w-48 truncate text-sm font-bold">{business?.name}</p>
                  {createdCheckout ? <QRCode value={paymentLink} size={164} fgColor="#071b31" /> : <div className="grid h-[164px] w-[164px] place-items-center"><Loader2 size={24} className="animate-spin text-primary" /></div>}
                  <p className="mt-3 text-[10px] font-semibold">Scan to pay with Naitrust</p>
                  <p className="mt-1 text-[9px] text-slate-500">{linkAmount ? formatMinorAmount(Math.round(Number(linkAmount) * 100), 'NGN') : 'Customer enters the amount'}</p>
                </div>
              </div>
            </div>
          </Card>
          </>
        )}

        {!accountContentLoading && !isBusiness && (
          <div className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
            <Card className="overflow-hidden border-primary/15 shadow-sm ">
              <div className="bg-primary dark:bg-[#04162f] p-6 text-white">
                <p className="flex items-center gap-2 text-sm font-medium text-white/70"><Landmark size={16} /> Personal Naitrust account</p>
                <p className="mt-5 font-mono text-2xl font-bold tracking-[0.12em]">7034567890</p>
                <p className="mt-2 text-sm text-white/80">Anchor Bank · Naitrust / {user?.name}</p>
                <p className="mt-2 font-mono text-xs font-semibold text-white/60">{user?.naitrustId}</p>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <p className="text-xs text-muted-foreground">Receive a bank transfer from any Nigerian bank.</p>
                <Button variant="outline" size="sm" onClick={() => void copy('7034567890', 'personal-account')}>
                  {copied === 'personal-account' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'personal-account' ? 'Copied' : 'Copy number'}
                </Button>
              </div>
            </Card>
            <Card className="flex flex-col justify-center gap-3 p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><AtSign size={18} /></div>
              <div>
                <p className="text-sm font-semibold">Your Naitrust ID</p>
                <p className="mt-1 text-xs text-muted-foreground">Share this ID when someone wants to pay your Naitrust account.</p>
              </div>
              <button type="button" disabled={!user?.naitrustId} onClick={() => user?.naitrustId && void copy(user.naitrustId, 'naitrust-id')} className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 disabled:opacity-60">
                <span className="font-mono text-sm font-semibold">{user?.naitrustId ?? 'ID setup pending'}</span>
                {user?.naitrustId && (copied === 'naitrust-id' ? <Check size={14} /> : <Copy size={14} />)}
              </button>
            </Card>
          </div>
        )}

        {!accountContentLoading && isBusiness && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
            <ShieldCheck size={16} className="mt-0.5 hidden shrink-0 sm:block" />
            <span className="sm:hidden">Only provider-confirmed payments count as received.</span>
            <span className="hidden sm:inline">Naitrust confirms payments from the payment provider. A screenshot or customer message is never treated as proof that money arrived.</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
