/**
 * SendInstantlyPage
 * The Instant Payment flow (`/app/payments/send`) — everyday transfers
 * between parties who already trust each other. Mock-only for this phase
 * (no backend endpoint exists yet — see instant-transfer.api.ts): every
 * completed transfer is clearly labeled with a SandboxBadge, never shown as
 * a real completed payment.
 *
 * Flow: select/add recipient -> confirm recipient -> amount & narration ->
 * review -> security confirmation (PIN) -> processing -> result -> receipt.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AtSign,
  Banknote,
  Check,
  Landmark,
  Loader2,
  Phone,
  Send,
  Users,
  XCircle,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { SandboxBadge } from '../pieces/general/SandboxBadge';
import { PinPromptModal } from '../pieces/security/PinPromptModal';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useBeneficiaries } from '../../hooks/useBeneficiaries';
import { useCreateInstantTransfer, useInstantTransfers, useValidateRecipient } from '../../hooks/useInstantTransfer';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import type { InstantTransfer, RecipientMethod, TransferRecipient } from '../../libs/store/types';

type FlowStep = 'recipient' | 'confirm' | 'amount' | 'review' | 'processing' | 'result';

const METHOD_META: Record<RecipientMethod, { label: string; icon: typeof AtSign; placeholder: string }> = {
  naitrust_username: { label: 'Naitrust account', icon: AtSign, placeholder: 'e.g. chioma_electronics' },
  phone_number: { label: 'Phone number', icon: Phone, placeholder: 'e.g. +2348031234567' },
  bank_transfer: { label: 'Bank account', icon: Landmark, placeholder: 'Account number' },
  beneficiary: { label: 'Beneficiary', icon: Users, placeholder: '' },
};

const NIGERIAN_BANKS = [
  'Access Bank',
  'First Bank of Nigeria',
  'GTBank',
  'Kuda MFB',
  'Moniepoint MFB',
  'OPay',
  'PalmPay',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'UBA',
  'Union Bank',
  'Wema Bank',
  'Zenith Bank',
];

function estimateFeeMinor(amountMinor: number): number {
  return amountMinor > 5000000 ? 50000 : 15000;
}

export function SendInstantlyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<FlowStep>('recipient');
  const [method, setMethod] = useState<RecipientMethod>('bank_transfer');
  const [identifier, setIdentifier] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipient, setRecipient] = useState<TransferRecipient | null>(null);
  const [amountNaira, setAmountNaira] = useState('');
  const [narration, setNarration] = useState('');
  const [pinOpen, setPinOpen] = useState(false);
  const [result, setResult] = useState<InstantTransfer | null>(null);
  const [error, setError] = useState('');

  const { data: beneficiaries, isLoading: loadingBeneficiaries } = useBeneficiaries();
  const { data: recentTransfers } = useInstantTransfers();
  const validateRecipient = useValidateRecipient();
  const createTransfer = useCreateInstantTransfer();

  const recentRecipients = useMemo(() => {
    if (!recentTransfers) return [];
    const seen = new Set<string>();
    const unique: TransferRecipient[] = [];
    for (const transfer of recentTransfers) {
      const key = transfer.recipient.resolvedName ?? transfer.recipient.identifier;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(transfer.recipient);
      if (unique.length >= 4) break;
    }
    return unique;
  }, [recentTransfers]);

  const amountMinor = Math.round(parseFloat(amountNaira || '0') * 100);
  const feeMinor = amountMinor > 0 ? estimateFeeMinor(amountMinor) : 0;

  const handlePickRecipient = async (candidate: TransferRecipient) => {
    setError('');
    try {
      const response = await validateRecipient.mutateAsync(candidate);
      setRecipient(response.data);
      setStep('confirm');
    } catch {
      setError('We could not find that recipient. Double-check the details and try again.');
    }
  };

  const handleSubmitTransfer = async () => {
    if (!recipient) return;
    setStep('processing');
    try {
      const response = await createTransfer.mutateAsync({
        recipient,
        amountMinor,
        currency: 'NGN',
        narration: narration || undefined,
      });
      setResult(response.data);
      setStep('result');
    } catch {
      setError('Something went wrong sending this transfer. Please try again.');
      setStep('review');
    }
  };

  const reset = () => {
    setStep('recipient');
    setRecipient(null);
    setIdentifier('');
    setRecipientName('');
    setRecipientBank('');
    setAmountNaira('');
    setNarration('');
    setResult(null);
    setError('');
  };

  return (
    <DashboardLayout title="Send Instantly">
      <div className="mx-auto w-full max-w-9xl">
        <button
          type="button"
          onClick={() => (step === 'recipient' ? navigate('/app/payments') : reset())}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          {step === 'recipient' ? 'Back to Payments' : 'Start over'}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Send Instantly</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use this for people and businesses you already trust.
          </p>
        </div>

        <div className="max-w-2xl">
        {step === 'recipient' && (
          <Card className="p-5 shadow-sm">
            {recentRecipients.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Recent recipients</p>
                <div className="flex flex-wrap gap-2">
                  {recentRecipients.map((r) => (
                    <button
                      key={r.identifier}
                      type="button"
                      onClick={() => void handlePickRecipient(r)}
                      className="flex items-center gap-2 rounded-full border bg-muted/40 py-1.5 pl-1.5 pr-3 text-sm transition-colors hover:bg-accent"
                    >
                      <CounterpartyAvatar name={r.resolvedName ?? r.identifier} className="h-6 w-6 text-[10px]" />
                      {r.resolvedName ?? r.identifier}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Tabs value={method} onValueChange={(v) => setMethod(v as RecipientMethod)}>
              <TabsList className="grid w-full grid-cols-3">
                {(['bank_transfer', 'naitrust_username', 'beneficiary'] as RecipientMethod[]).map((key) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {METHOD_META[key].label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="bank_transfer" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="recipient-bank">Bank</Label>
                  <Select value={recipientBank} onValueChange={setRecipientBank}>
                    <SelectTrigger id="recipient-bank" className="mt-1.5 w-full">
                      <SelectValue placeholder="Select the recipient's bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipient-account">Account number</Label>
                  <Input
                    id="recipient-account"
                    value={identifier}
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit account number"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="recipient-name">Account name</Label>
                  <Input
                    id="recipient-name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Name you expect on the account"
                    className="mt-1.5"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Naitrust will compare this with the name returned by the bank before you send.
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  className="w-full rounded-full"
                  disabled={!recipientBank || identifier.length !== 10 || !recipientName.trim() || validateRecipient.isPending}
                  onClick={() => void handlePickRecipient({
                    method: 'bank_transfer',
                    identifier,
                    bankName: recipientBank,
                    resolvedName: recipientName.trim(),
                  })}
                >
                  {validateRecipient.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Verify account
                </Button>
              </TabsContent>

              <TabsContent value="naitrust_username" className="mt-4 space-y-3">
                <Label htmlFor="naitrust-recipient">Naitrust username or account ID</Label>
                <Input
                  id="naitrust-recipient"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={METHOD_META.naitrust_username.placeholder}
                />
                <p className="text-xs text-muted-foreground">
                  Use this for an instant in-house transfer to another Naitrust business.
                </p>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  className="w-full rounded-full"
                  disabled={!identifier || validateRecipient.isPending}
                  onClick={() => void handlePickRecipient({ method: 'naitrust_username', identifier })}
                >
                  {validateRecipient.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Find Naitrust business
                </Button>
              </TabsContent>

              <TabsContent value="beneficiary" className="mt-4 space-y-2">
                {loadingBeneficiaries ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Loading beneficiaries…</p>
                ) : !beneficiaries || beneficiaries.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No saved beneficiaries yet. Send to a username, phone number, or bank account to save one.
                  </p>
                ) : (
                  beneficiaries.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        void handlePickRecipient({
                          method: b.type === 'naitrust_user' ? 'beneficiary' : 'bank_transfer',
                          identifier: b.type === 'naitrust_user' ? (b.username ?? b.id) : (b.accountNumber ?? b.id),
                          resolvedName: b.name,
                          bankName: b.bankName,
                        })
                      }
                      className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
                    >
                      <CounterpartyAvatar name={b.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{b.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {b.type === 'naitrust_user' ? `@${b.username}` : `${b.bankName} · ${b.accountNumber}`}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )}

        {step === 'confirm' && recipient && (
          <Card className="flex flex-col items-center gap-4 p-8 text-center shadow-sm">
            <CounterpartyAvatar name={recipient.resolvedName ?? recipient.identifier} className="h-14 w-14 text-base" />
            <div>
              <p className="text-lg font-semibold text-foreground">{recipient.resolvedName ?? recipient.identifier}</p>
              <p className="text-sm text-muted-foreground">
                {recipient.bankName ? `${recipient.bankName} · ${recipient.identifier}` : recipient.identifier}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Is this who you want to pay?</p>
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep('recipient')}>
                Not them
              </Button>
              <Button className="flex-1 rounded-full" onClick={() => setStep('amount')}>
                Confirm
              </Button>
            </div>
          </Card>
        )}

        {step === 'amount' && recipient && (
          <Card className="p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
              <CounterpartyAvatar name={recipient.resolvedName ?? recipient.identifier} />
              <p className="text-sm font-medium text-foreground">{recipient.resolvedName ?? recipient.identifier}</p>
            </div>
            <Label htmlFor="amount">Amount (NGN)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              min={0}
              value={amountNaira}
              onChange={(e) => setAmountNaira(e.target.value)}
              placeholder="0.00"
              className="mt-1.5 text-lg font-semibold"
            />
            <Label htmlFor="narration" className="mt-4 block">
              Narration <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="What's this for?"
              className="mt-1.5"
            />
            <Button
              className="mt-5 w-full rounded-full"
              disabled={!amountMinor || amountMinor <= 0}
              onClick={() => setStep('review')}
            >
              Review transfer
            </Button>
          </Card>
        )}

        {step === 'review' && recipient && (
          <Card className="p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-foreground">Review transfer</p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">To</dt>
                <dd className="font-medium text-foreground">{recipient.resolvedName ?? recipient.identifier}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-medium text-foreground">{formatMinorAmount(amountMinor, 'NGN')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Fee</dt>
                <dd className="font-medium text-foreground">{formatMinorAmount(feeMinor, 'NGN')}</dd>
              </div>
              {narration && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Narration</dt>
                  <dd className="font-medium text-foreground">{narration}</dd>
                </div>
              )}
              <div className="flex justify-between border-t pt-3">
                <dt className="font-semibold text-foreground">Total</dt>
                <dd className="font-semibold text-foreground">{formatMinorAmount(amountMinor + feeMinor, 'NGN')}</dd>
              </div>
            </dl>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <Button className="mt-5 w-full rounded-full" onClick={() => setPinOpen(true)}>
              Confirm & Pay
            </Button>
          </Card>
        )}

        {step === 'processing' && (
          <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Sending your transfer…</p>
          </Card>
        )}

        {step === 'result' && result && (
          <Card className="flex flex-col items-center gap-4 p-8 text-center shadow-sm">
            {result.status === 'successful' && (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check size={28} />
              </div>
            )}
            {result.status === 'pending' && (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock size={28} />
              </div>
            )}
            {result.status === 'failed' && (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle size={28} />
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-foreground">
                {result.status === 'successful' && 'Transfer successful'}
                {result.status === 'pending' && 'Transfer pending'}
                {result.status === 'failed' && 'Transfer failed'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatMinorAmount(result.amountMinor, result.currency)} to{' '}
                {result.recipient.resolvedName ?? result.recipient.identifier}
              </p>
            </div>
            {result.isMock && <SandboxBadge />}
            <Card className="w-full gap-1.5 bg-muted/40 p-4 text-left text-sm shadow-none">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-medium text-foreground">{result.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium text-foreground">{formatMinorAmount(result.feeMinor, result.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize text-foreground">{result.status}</span>
              </div>
            </Card>
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1 rounded-full" onClick={reset}>
                Send another
              </Button>
              <Button className="flex-1 rounded-full" onClick={() => navigate('/app/transactions')}>
                <Send size={15} className="mr-1.5" />
                Done
              </Button>
            </div>
          </Card>
        )}

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Banknote size={13} />
          Instant Payments run in a sandbox for this phase — no real money moves.
        </p>
        </div>
      </div>

      <PinPromptModal
        open={pinOpen}
        onOpenChange={setPinOpen}
        onVerified={() => void handleSubmitTransfer()}
        title="Confirm this transfer"
        description="Enter your transaction PIN to send this payment."
      />
    </DashboardLayout>
  );
}
