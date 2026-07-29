import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import {
  ArrowLeft,
  Check,
  Copy,
  HandCoins,
  Landmark,
  Link2,
  Loader2,
  MessageCircle,
  Phone,
  QrCode,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../libs/auth-context';
import { useCreatePaymentRequest } from '../../hooks/usePaymentRequests';
import { useWallet } from '../../hooks/useWallet';
import { useMyBusiness } from '../../hooks/useMyBusiness';
import { useCounterparties } from '../../hooks/useCounterparties';
import { accountTypeOf } from '../../libs/utils/account';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function ReceiveMoneyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: wallet } = useWallet();
  const { data: business } = useMyBusiness();
  const { data: counterparties } = useCounterparties();
  const [copied, setCopied] = useState('');
  const [linkAmount, setLinkAmount] = useState('');
  const [linkReason, setLinkReason] = useState('');
  const [requestName, setRequestName] = useState('');
  const [requestAmount, setRequestAmount] = useState('');
  const [reason, setReason] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('new');
  const [newCustomerName, setNewCustomerName] = useState('');
  const createRequest = useCreatePaymentRequest();
  const isBusiness = accountTypeOf(user) !== 'customer' && Boolean(business);
  const shareHandle = user?.phone ?? user?.email ?? 'your Naitrust account';
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
    const slug = slugify(business?.name || user?.name || 'business');
    const params = new URLSearchParams();
    if (Number(linkAmount) > 0) params.set('amount', linkAmount);
    if (linkReason.trim()) params.set('for', linkReason.trim());
    const query = params.toString();
    return `${origin}/pay/${slug}${query ? `?${query}` : ''}`;
  }, [business?.name, linkAmount, linkReason, user?.name]);

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

  const handleRequest = async () => {
    const amountMinor = Math.round(parseFloat(requestAmount || '0') * 100);
    if (!requestName || !amountMinor) return;
    try {
      await createRequest.mutateAsync({
        requestedFromName: requestName,
        amountMinor,
        currency: 'NGN',
        reason: reason || undefined,
      });
      toast.success('Payment request sent');
      setRequestName('');
      setRequestAmount('');
      setReason('');
    } catch {
      toast.error('Could not send the request. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Receive Money">
      <div className="mx-auto w-full max-w-9xl">
        <button type="button" onClick={() => navigate('/app/payments')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} /> Back to Payments
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isBusiness ? 'Get paid your way' : 'Receive Money'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isBusiness
              ? 'Share your account number, payment link or QR code with any customer.'
              : 'Use your personal account number to receive money from any Nigerian bank.'}
          </p>
        </div>

        {isBusiness && (
          <>
          <Card className={`mb-5 overflow-hidden rounded-2xl border-emerald-500/20 shadow-sm ${shareMode === 'whatsapp' ? 'ring-2 ring-emerald-500/30' : ''}`}>
            <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f8f0] text-[#087a4b] dark:bg-emerald-500/10 dark:text-emerald-400">
                    <MessageCircle size={20} />
                  </span>
                  <div>
                    <p className="font-semibold">Collect from a WhatsApp conversation</p>
                    <p className="text-xs text-muted-foreground">No customer account or card required.</p>
                  </div>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                  Choose the customer, set the amount and reason, then share the verified request. Your customer opens it,
                  sees the business details and transfers to the unique account shown.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="whatsapp-customer">Customer</Label>
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
                  {selectedCustomerId === 'new' && (
                    <div className="sm:col-span-2">
                      <Label htmlFor="whatsapp-customer-name">Customer name</Label>
                      <Input id="whatsapp-customer-name" value={newCustomerName} onChange={(event) => setNewCustomerName(event.target.value)} placeholder="Enter the customer's name" className="mt-1.5" />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <Label htmlFor="whatsapp-reason">Payment for</Label>
                    <Input id="whatsapp-reason" value={linkReason} onChange={(event) => setLinkReason(event.target.value)} placeholder="e.g. 10 cartons of stock" className="mt-1.5" />
                  </div>
                </div>
                <Button className="mt-4 rounded-full bg-[#0b8f57] text-white hover:bg-[#087a4b]" disabled={!paymentCustomerName || !linkAmount || !linkReason.trim()} onClick={shareToWhatsApp}>
                  <MessageCircle size={16} /> Share payment request
                </Button>
              </div>
              <div className="border-t bg-[#f4fbf7] p-5 dark:bg-emerald-500/[0.04] lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">Customer flow</p>
                <ol className="mt-3 space-y-2.5 text-sm">
                  {[
                    'Open the Naitrust request from WhatsApp',
                    'Verify the business and payment purpose',
                    'Transfer to the account number shown',
                    'Receive an automatic confirmation',
                  ].map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <div className="space-y-5">
              <Card className={`overflow-hidden border-primary/15 shadow-sm ${shareMode === 'account' ? 'ring-2 ring-primary/25' : ''}`}>
                <div className="bg-primary p-5 text-primary-foreground">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80"><Landmark size={16} /> Business account</p>
                  <p className="mt-4 font-mono text-2xl font-bold tracking-[0.12em]">{account?.accountNumber ?? 'Account setup pending'}</p>
                  <p className="mt-2 text-sm">{account ? `${account.bankName} · ${account.accountName}` : 'Your regulated partner account will appear here'}</p>
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="text-xs text-muted-foreground">Customers can transfer to this account from any Nigerian bank.</p>
                  <Button variant="outline" size="sm" disabled={!account?.accountNumber} onClick={() => account?.accountNumber && void copy(account.accountNumber, 'account')}>
                    {copied === 'account' ? <Check size={14} /> : <Copy size={14} />} {copied === 'account' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </Card>

              <Card className="p-5 shadow-sm">
                <p className="flex items-center gap-2 font-semibold"><Link2 size={17} /> Create a payment link</p>
                <p className="mt-1 text-sm text-muted-foreground">Leave the amount empty so the customer can enter it, or set a fixed amount.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="link-amount">Amount (optional)</Label>
                    <Input id="link-amount" type="number" min={0} value={linkAmount} onChange={(event) => setLinkAmount(event.target.value)} placeholder="Customer enters amount" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="link-reason">Payment for (optional)</Label>
                    <Input id="link-reason" value={linkReason} onChange={(event) => setLinkReason(event.target.value)} placeholder="e.g. Carton of stock" className="mt-1.5" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2 rounded-xl bg-muted p-2 pl-3">
                  <p className="min-w-0 flex-1 truncate self-center text-xs text-muted-foreground">{paymentLink}</p>
                  <Button size="sm" onClick={() => void copy(paymentLink, 'link')}>
                    {copied === 'link' ? <Check size={14} /> : <Copy size={14} />} {copied === 'link' ? 'Copied' : 'Copy link'}
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button className="rounded-full bg-[#0b8f57] text-white hover:bg-[#087a4b]" onClick={shareToWhatsApp}>
                    <MessageCircle size={15} /> Share on WhatsApp
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}>
                    Preview request
                  </Button>
                </div>
              </Card>
            </div>

            <Card className={`flex flex-col items-center p-6 text-center shadow-sm ${shareMode === 'qr' ? 'ring-2 ring-primary/25' : ''}`}>
              <div className="mb-3 flex items-center gap-2 font-semibold"><QrCode size={18} /> Customer payment QR</div>
              <p className="mb-5 max-w-sm text-sm text-muted-foreground">Display this at your stall, shop or checkout. Scanning opens a payment page for {business?.name}.</p>
              <div ref={qrPosterRef} className="rounded-2xl border bg-white p-6 text-[#071b31] shadow-sm">
                <div className="mb-4 text-center">
                  <p className="text-lg font-bold">{business?.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Scan to pay this verified Naitrust business</p>
                </div>
                <QRCode value={paymentLink} size={208} fgColor="#071b31" />
                <p className="mt-4 text-center text-xs font-semibold">Verify before you transfer</p>
              </div>
              <p className="mt-4 text-sm font-semibold">{business?.name}</p>
              <p className="text-xs text-muted-foreground">{linkAmount ? formatMinorAmount(Math.round(Number(linkAmount) * 100), 'NGN') : 'Customer enters the amount'}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}>Preview payment page</Button>
                <Button onClick={() => void downloadQrPoster()}><Download size={15} /> Download shop QR</Button>
              </div>
            </Card>
          </div>
          </>
        )}

        {!isBusiness && (
          <div className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
            <Card className="overflow-hidden border-primary/15 shadow-sm">
              <div className="bg-[#102f50] p-6 text-white">
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
                <p className="text-sm font-semibold">Your Naitrust ID</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">{shareHandle}</p>
              </div>
              <Button variant="outline" size="sm" className="w-fit" onClick={() => void copy(shareHandle, 'handle')}>
                {copied === 'handle' ? <Check size={14} /> : <Copy size={14} />} {copied === 'handle' ? 'Copied' : 'Copy ID'}
              </Button>
            </Card>
          </div>
        )}

        {isBusiness && <Card className="mt-6 p-5 shadow-sm">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold"><HandCoins size={15} /> Request a specific amount</p>
          <p className="mb-4 text-xs text-muted-foreground">Send a direct payment request to a customer or contact.</p>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.25fr_auto] md:items-end">
            <div><Label htmlFor="req-name">From</Label><Input id="req-name" value={requestName} onChange={(e) => setRequestName(e.target.value)} placeholder="Customer name" className="mt-1.5" /></div>
            <div><Label htmlFor="req-amount">Amount (NGN)</Label><Input id="req-amount" type="number" min={0} value={requestAmount} onChange={(e) => setRequestAmount(e.target.value)} placeholder="0.00" className="mt-1.5" /></div>
            <div><Label htmlFor="req-reason">Reason (optional)</Label><Input id="req-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What is this for?" className="mt-1.5" /></div>
            <Button disabled={!requestName || !requestAmount || createRequest.isPending} onClick={() => void handleRequest()}>
              {createRequest.isPending && <Loader2 size={15} className="animate-spin" />} Send request
            </Button>
          </div>
        </Card>}

        {isBusiness && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            Naitrust confirms payments from the payment provider. A screenshot or customer message is never treated as proof that money arrived.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
