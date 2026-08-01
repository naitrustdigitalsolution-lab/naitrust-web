import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import {
  ArrowLeft,
  ArrowDownToLine,
  Check,
  Copy,
  Landmark,
  Link2,
  MessageCircle,
  Phone,
  QrCode,
  Download,
  Share2,
  ShieldCheck,
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
  const isBusiness = accountTypeOf(user) !== 'customer';
  const accountContentLoading = isWalletLoading || (isBusiness && isBusinessLoading);
  const account = wallet?.virtualAccount;
  const shareMode = searchParams.get('share');
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
    const params = new URLSearchParams();
    if (Number(linkAmount) > 0) params.set('amount', linkAmount);
    if (linkReason.trim()) params.set('for', linkReason.trim());
    params.set('expires', linkExpiryMinutes);
    const query = params.toString();
    return `${origin}/pay/${slug}${query ? `?${query}` : ''}`;
  }, [business?.name, business?.slug, linkAmount, linkExpiryMinutes, linkReason, user?.name]);

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
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
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
      toast.info("Sharing isn't supported on this browser — payment link copied instead.");
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        toast.error('Could not share the QR code. Please try again.');
      }
    }
  };

  return (
    <DashboardLayout title="Receive Money">
      <div className="mx-auto w-full max-w-7xl">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-7 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-background to-background px-5 py-6 shadow-sm sm:px-7 lg:px-9 lg:py-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15">
              <ArrowDownToLine size={21} />
            </span>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                {isBusiness ? 'Your business payments' : 'Receive money'}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {isBusiness ? 'Get paid your way' : 'Receive Money'}
              </h1>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
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
          <div className="mb-5 grid items-stretch gap-5 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
          <Card className={`h-full overflow-hidden rounded-3xl border-primary/15 p-0 shadow-sm ${shareMode === 'account' ? 'ring-2 ring-primary/25' : ''}`}>
            <div className="flex h-full flex-col">
              <div className="bg-gradient-to-br from-[#071b31] via-[#0a3158] to-[#071b31] p-6 text-white sm:p-7">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/65">
                  <Landmark size={15} /> Business account
                </p>
                <p className="mt-5 font-mono text-3xl font-bold tracking-[0.14em] sm:text-4xl">
                  {account?.accountNumber ?? 'Account setup pending'}
                </p>
                <p className="mt-3 text-sm text-white/75">
                  {account ? `${account.bankName} · ${account.accountName}` : 'Your regulated partner account will appear here'}
                </p>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-3 border-t bg-card p-5">
                <p className="text-sm font-semibold">Receive a bank transfer</p>
                <p className="text-xs leading-5 text-muted-foreground">Share these details with customers paying from any Nigerian bank.</p>
                <Button className="mt-1 rounded-full" disabled={!account?.accountNumber} onClick={() => account?.accountNumber && void copy(account.accountNumber, 'account')}>
                  {copied === 'account' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'account' ? 'Account number copied' : 'Copy account number'}
                </Button>
              </div>
            </div>
          </Card>

          <Card className={`h-full overflow-hidden rounded-3xl border-emerald-500/20 shadow-sm ${shareMode === 'whatsapp' ? 'ring-2 ring-emerald-500/30' : ''}`}>
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f8f0] text-[#087a4b] dark:bg-emerald-500/10 dark:text-emerald-400">
                  <MessageCircle size={20} />
                </span>
                <div>
                  <p className="font-semibold">Create one payment request</p>
                  <p className="text-xs text-muted-foreground">Share the same request by WhatsApp, link, or QR.</p>
                </div>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                Add the payer, amount, and payment details once. Naitrust creates one verified request you can share anywhere.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                <div>
                  <Label htmlFor="whatsapp-amount">Amount (NGN)</Label>
                  <Input id="whatsapp-amount" type="number" min={0} value={linkAmount} onChange={(event) => setLinkAmount(event.target.value)} placeholder="0.00" className="mt-1.5" />
                </div>
                <div>
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
                <div className="sm:col-span-2">
                  <Label htmlFor="whatsapp-reason">Payment details</Label>
                  <Textarea id="whatsapp-reason" value={linkReason} onChange={(event) => setLinkReason(event.target.value)} placeholder="Describe what this payment is for, invoice details, quantity, or any note the payer should see." className="mt-1.5 min-h-24 resize-y" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button className="rounded-full bg-[#0b8f57] text-white hover:bg-[#087a4b]" disabled={!paymentCustomerName} onClick={shareToWhatsApp}>
                  <MessageCircle size={16} /> Share on WhatsApp
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => void copy(paymentLink, 'link')}>
                  {copied === 'link' ? <Check size={15} /> : <Link2 size={15} />} {copied === 'link' ? 'Link copied' : 'Copy payment link'}
                </Button>
                <Button variant="ghost" className="rounded-full" onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}>
                  Preview
                </Button>
              </div>
            </div>
          </Card>
          </div>

          <Card className={`overflow-hidden rounded-3xl p-0 shadow-sm ${shareMode === 'qr' ? 'ring-2 ring-primary/25' : ''}`}>
            <div className="grid items-center lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><QrCode size={20} /></span>
                  <div>
                    <p className="font-semibold">Customer payment QR</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">For your counter, stall, invoice, or checkout.</p>
                  </div>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                  Customers scan this code to open the verified payment page for {business?.name}. Download it for print or share it digitally.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => void copyQrImage()}><Copy size={15} /> Copy QR code</Button>
                  <Button variant="outline" onClick={() => void shareQrPoster()}><Share2 size={15} /> Share</Button>
                  <Button variant="outline" onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}>Preview</Button>
                  <Button onClick={() => void downloadQrPoster()}><Download size={15} /> Download QR</Button>
                </div>
              </div>
              <div className="border-t bg-muted/30 p-5 lg:border-l lg:border-t-0">
                <div ref={qrPosterRef} className="flex flex-col items-center rounded-2xl border bg-white p-5 text-[#071b31] shadow-sm">
                  <p className="mb-3 max-w-48 truncate text-sm font-bold">{business?.name}</p>
                  <QRCode value={paymentLink} size={164} fgColor="#071b31" />
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
              <div className="bg-gradient-to-br from-[#071b31] via-[#0a3158] to-[#071b31] p-6 text-white">
                <p className="flex items-center gap-2 text-sm font-medium text-white/70"><Landmark size={16} /> Personal Naitrust account</p>
                <p className="mt-5 font-mono text-2xl font-bold tracking-[0.12em]">7034567890</p>
                <p className="mt-2 text-sm text-white/80">Anchor Bank · Naitrust / {user?.name}</p>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Phone size={18} /></div>
              <div>
                <p className="text-sm font-semibold">Receive another Naitrust transfer</p>
                <p className="mt-1 text-xs text-muted-foreground">A sender can also find your account using either verified detail.</p>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => user?.email && void copy(user.email, 'email')} className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left hover:bg-muted/50">
                  <span className="min-w-0"><span className="block text-xs text-muted-foreground">Email</span><span className="block truncate text-sm font-medium">{user?.email ?? 'Not added'}</span></span>
                  {copied === 'email' ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button type="button" disabled={!user?.phone} onClick={() => user?.phone && void copy(user.phone, 'phone')} className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 disabled:opacity-60">
                  <span><span className="block text-xs text-muted-foreground">Phone</span><span className="block text-sm font-medium">{user?.phone ?? 'Add a verified phone number'}</span></span>
                  {user?.phone && (copied === 'phone' ? <Check size={14} /> : <Copy size={14} />)}
                </button>
              </div>
            </Card>
          </div>
        )}

        {!accountContentLoading && isBusiness && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            Naitrust confirms payments from the payment provider. A screenshot or customer message is never treated as proof that money arrived.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
