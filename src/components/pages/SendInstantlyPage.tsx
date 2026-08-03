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

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AtSign,
  Check,
  Landmark,
  Loader2,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  Users,
  XCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { PinPromptModal } from '../pieces/security/PinPromptModal';
import { VerificationGate } from '../pieces/security/VerificationGate';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useBeneficiaries } from '../../hooks/useBeneficiaries';
import { useSecurity } from '../../hooks/useSecurity';
import { useCreateInstantTransfer, useInstantTransfers, useValidateRecipient } from '../../hooks/useInstantTransfer';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import type { InstantTransfer, RecipientMethod, TransferRecipient } from '../../libs/store/types';

type FlowStep = 'recipient' | 'confirm' | 'amount' | 'review' | 'processing' | 'result';
type RecipientRoute = 'naitrust' | 'bank_transfer' | 'beneficiary';
type NaitrustLookup = 'naitrust_account_number' | 'naitrust_id' | 'email_address' | 'phone_number';

const METHOD_META: Record<RecipientMethod, { label: string; icon: typeof AtSign; placeholder: string }> = {
  naitrust_account_number: { label: 'Account number', icon: Landmark, placeholder: '10-digit account number' },
  naitrust_id: { label: 'Naitrust ID', icon: AtSign, placeholder: 'e.g. NT-A12B34 or ayo_stores' },
  email_address: { label: 'Email', icon: Mail, placeholder: 'e.g. customer@email.com' },
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

const STEP_SEQUENCE: { key: FlowStep; label: string }[] = [
  { key: 'recipient', label: 'Recipient' },
  { key: 'confirm', label: 'Confirm' },
  { key: 'amount', label: 'Amount' },
  { key: 'review', label: 'Review' },
];

export function SendInstantlyPage() {
  const navigate = useNavigate();
  const security = useSecurity();
  const [step, setStep] = useState<FlowStep>('recipient');
  const [method, setMethod] = useState<RecipientRoute>('naitrust');
  const [naitrustLookup, setNaitrustLookup] = useState<NaitrustLookup>('naitrust_account_number');
  const [identifier, setIdentifier] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [resolveError, setResolveError] = useState('');
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

  // Auto-resolve the account name from the bank + account number, the way a
  // real NUBAN name-enquiry would — the customer never types the name themselves.
  useEffect(() => {
    if (method !== 'bank_transfer' || !recipientBank || identifier.length !== 10) {
      setResolvedAccountName('');
      setResolveError('');
      setResolvingAccount(false);
      return;
    }
    let cancelled = false;
    setResolvingAccount(true);
    setResolveError('');
    const timer = setTimeout(() => {
      void validateRecipient
        .mutateAsync({ method: 'bank_transfer', identifier, bankName: recipientBank })
        .then((response) => {
          if (cancelled) return;
          setResolvedAccountName(response.data.resolvedName ?? '');
        })
        .catch(() => {
          if (cancelled) return;
          setResolvedAccountName('');
          setResolveError('We could not resolve a name for that account. Double-check the number and bank.');
        })
        .finally(() => {
          if (!cancelled) setResolvingAccount(false);
        });
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, recipientBank, identifier]);

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
    setRecipientBank('');
    setResolvedAccountName('');
    setResolveError('');
    setAmountNaira('');
    setNarration('');
    setResult(null);
    setError('');
  };

  const currentStepIndex = STEP_SEQUENCE.findIndex((s) => s.key === step);
  const recipientName = recipient?.resolvedName ?? recipient?.identifier;

  if (!security.canCreateDeal) {
    return (
      <DashboardLayout title="Send Money">
        <VerificationGate
          missing={security.missingForDeal}
          title="Finish verification to send money"
          description="Complete identity verification and set your transaction PIN before making an instant transfer."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Send Money">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-7 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-background to-background px-5 py-6 shadow-sm sm:px-7 lg:px-9 lg:py-8">
          <div className="flex items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15">
                <Send size={21} />
              </span>
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Instant transfer</span>
                  <span className="hidden items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 sm:inline-flex">
                    <Zap size={10} /> Fast & direct
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Send Money</h1>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
                  Use this for people and businesses you already trust.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (step === 'recipient' ? navigate('/app/payments') : reset())}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background/80 px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur transition-colors hover:border-primary/30 hover:text-foreground"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">{step === 'recipient' ? 'Back to Payments' : 'Start over'}</span>
              <span className="sm:hidden">{step === 'recipient' ? 'Back' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {currentStepIndex >= 0 && (
          <div className="mb-7 rounded-2xl border bg-card px-4 py-4 shadow-sm sm:px-6">
            <div className="flex items-center">
              {STEP_SEQUENCE.map((s, i) => (
                <div key={s.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                        i <= currentStepIndex
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                          : 'border bg-background text-muted-foreground'
                      }`}
                    >
                      {i < currentStepIndex ? <Check size={13} /> : i + 1}
                    </div>
                    <span className={`hidden text-xs font-semibold sm:block ${i <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEP_SEQUENCE.length - 1 && (
                    <div className={`mx-2 h-px flex-1 sm:mx-4 ${i < currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
          <div className="min-w-0">
        {step === 'recipient' && (
          <Card className="overflow-hidden rounded-3xl border-border/80 p-0 shadow-sm">
            <div className="border-b px-5 py-5 sm:px-7">
              <p className="text-lg font-bold text-foreground">Who are you sending money to?</p>
              <p className="mt-1 text-sm text-muted-foreground">Choose a saved recipient or enter their payment details.</p>
            </div>
            <div className="p-5 sm:p-7">
            {recentRecipients.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Recent recipients</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {recentRecipients.map((r) => (
                    <button
                      key={r.identifier}
                      type="button"
                      onClick={() => void handlePickRecipient(r)}
                      className="flex min-w-0 items-center gap-3 rounded-xl border bg-background p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm"
                    >
                      <CounterpartyAvatar name={r.resolvedName ?? r.identifier} className="h-9 w-9 shrink-0 text-xs" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{r.resolvedName ?? r.identifier}</span>
                        <span className="block truncate text-xs text-muted-foreground">{r.bankName ?? 'Naitrust recipient'}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Tabs value={method} onValueChange={(v) => { setMethod(v as RecipientRoute); setIdentifier(''); setError(''); }}>
              <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted/70 p-1">
                {([
                  { key: 'naitrust', label: 'Naitrust account' },
                  { key: 'bank_transfer', label: 'Bank account' },
                  { key: 'beneficiary', label: 'Beneficiary' },
                ] as const).map(({ key, label }) => (
                  <TabsTrigger key={key} value={key} className="min-h-10 rounded-lg px-2 text-xs data-[state=active]:shadow-sm sm:text-sm">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="naitrust" className="mt-4 space-y-4">
                <div>
                  <Label>Find their Naitrust account with</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {([
                      ['naitrust_account_number', 'Account number'],
                      ['naitrust_id', 'Naitrust ID'],
                      ['email_address', 'Email'],
                      ['phone_number', 'Business phone'],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setNaitrustLookup(key); setIdentifier(''); setError(''); }}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                          naitrustLookup === key ? 'border-primary bg-primary/10 text-primary' : 'bg-background text-muted-foreground hover:bg-accent/50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="naitrust-recipient">{METHOD_META[naitrustLookup].label}</Label>
                  <Input
                    id="naitrust-recipient"
                    type={naitrustLookup === 'email_address' ? 'email' : naitrustLookup === 'phone_number' ? 'tel' : 'text'}
                    inputMode={naitrustLookup === 'naitrust_account_number' ? 'numeric' : naitrustLookup === 'phone_number' ? 'tel' : undefined}
                    maxLength={naitrustLookup === 'naitrust_account_number' ? 10 : undefined}
                    value={identifier}
                    onChange={(e) => setIdentifier(
                      naitrustLookup === 'naitrust_account_number'
                        ? e.target.value.replace(/\D/g, '').slice(0, 10)
                        : e.target.value,
                    )}
                    placeholder={METHOD_META[naitrustLookup].placeholder}
                    className="mt-1.5"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Use the details registered to the person or business on Naitrust.
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  className="w-full rounded-full"
                  disabled={
                    validateRecipient.isPending
                    || (naitrustLookup === 'naitrust_account_number' && identifier.length !== 10)
                    || (naitrustLookup === 'email_address' && !identifier.includes('@'))
                    || (naitrustLookup === 'phone_number' && identifier.replace(/\D/g, '').length < 10)
                    || (naitrustLookup === 'naitrust_id' && identifier.trim().length < 3)
                  }
                  onClick={() => void handlePickRecipient({ method: naitrustLookup, identifier: identifier.trim() })}
                >
                  {validateRecipient.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Find Naitrust account
                </Button>
              </TabsContent>

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
                {identifier.length === 10 && recipientBank && (
                  <div className="rounded-xl border bg-muted/40 p-3">
                    {resolvingAccount ? (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" /> Looking up account name…
                      </p>
                    ) : resolvedAccountName ? (
                      <div className="flex items-center gap-2.5">
                        <CounterpartyAvatar name={resolvedAccountName} className="h-8 w-8 text-xs" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Account name</p>
                          <p className="truncate text-sm font-semibold text-foreground">{resolvedAccountName}</p>
                        </div>
                      </div>
                    ) : resolveError ? (
                      <p className="text-sm text-destructive">{resolveError}</p>
                    ) : null}
                  </div>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  className="w-full rounded-full"
                  disabled={!recipientBank || identifier.length !== 10 || !resolvedAccountName || resolvingAccount || validateRecipient.isPending}
                  onClick={() => void handlePickRecipient({
                    method: 'bank_transfer',
                    identifier,
                    bankName: recipientBank,
                    resolvedName: resolvedAccountName,
                  })}
                >
                  {validateRecipient.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Continue
                </Button>
              </TabsContent>

              <TabsContent value="beneficiary" className="mt-4 space-y-2">
                {loadingBeneficiaries ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Loading beneficiaries…</p>
                ) : !beneficiaries || beneficiaries.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No saved recipients yet. Send by account number, email, or phone to save one.
                  </p>
                ) : (
                  beneficiaries.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        void handlePickRecipient({
                          method: b.type === 'naitrust_user' ? 'beneficiary' : 'bank_transfer',
                          identifier: b.type === 'naitrust_user' ? (b.email ?? b.phone ?? b.id) : (b.accountNumber ?? b.id),
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
                          {b.type === 'naitrust_user' ? (b.email ?? b.phone) : `${b.bankName} · ${b.accountNumber}`}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </TabsContent>
            </Tabs>
            </div>
          </Card>
        )}

        {step === 'confirm' && recipient && (
          <Card className="flex flex-col items-center gap-4 rounded-3xl p-8 text-center shadow-sm sm:p-10">
            <CounterpartyAvatar name={recipient.resolvedName ?? recipient.identifier} className="h-14 w-14 text-base" />
            <div>
              <p className="text-lg font-semibold text-foreground">{recipient.resolvedName ?? recipient.identifier}</p>
              <p className="text-sm text-muted-foreground">
                {recipient.bankName ? `${recipient.bankName} · ${recipient.identifier}` : recipient.identifier}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Is this who you want to pay?</p>
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1 rounded-md" onClick={() => setStep('recipient')}>
                Not them
              </Button>
              <Button className="flex-1 rounded-md" onClick={() => setStep('amount')}>
                Confirm
              </Button>
            </div>
          </Card>
        )}

        {step === 'amount' && recipient && (
          <Card className="rounded-3xl p-5 shadow-sm sm:p-7">
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
          <Card className="rounded-3xl p-5 shadow-sm sm:p-7">
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
            <Button className="mt-5 w-full rounded-md" onClick={() => setPinOpen(true)}>
              Confirm & Pay
            </Button>
          </Card>
        )}

        {step === 'processing' && (
          <Card className="flex flex-col items-center gap-3 rounded-3xl p-10 text-center shadow-sm">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Sending your transfer…</p>
          </Card>
        )}

        {step === 'result' && result && (
          <Card className="flex flex-col items-center gap-4 rounded-3xl p-8 text-center shadow-sm">
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
              <Button variant="outline" className="flex-1 rounded-md" onClick={reset}>
                Send another
              </Button>
              <Button className="flex-1 rounded-md" onClick={() => navigate('/app/transactions')}>
                <Send size={15} className="mr-1.5" />
                Done
              </Button>
            </div>
          </Card>
        )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            {recipient && step !== 'result' && step !== 'processing' ? (
              <Card className="gap-0 overflow-hidden rounded-2xl border-primary/15 p-0 shadow-sm">
                <div className="border-b bg-primary/[0.05] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Transfer summary</p>
                  <div className="mt-4 flex items-center gap-3">
                    <CounterpartyAvatar name={recipientName ?? ''} className="h-11 w-11 text-sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{recipientName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {recipient.bankName ? `${recipient.bankName} · ${recipient.identifier}` : recipient.identifier}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">{amountMinor > 0 ? formatMinorAmount(amountMinor, 'NGN') : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Transfer fee</span>
                    <span className="font-semibold">{feeMinor > 0 ? formatMinorAmount(feeMinor, 'NGN') : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">{amountMinor > 0 ? formatMinorAmount(amountMinor + feeMinor, 'NGN') : '—'}</span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="rounded-2xl border-primary/15 bg-primary/[0.035] p-5 shadow-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck size={19} />
                </div>
                <p className="mt-4 text-sm font-bold text-foreground">Only send to people you trust</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Instant transfers cannot be held for delivery. Check the recipient name and account details before you pay.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/app/deals/new')}
                  className="mt-4 text-left text-xs font-semibold text-primary hover:underline"
                >
                  Paying someone new? Protect the payment instead →
                </button>
              </Card>
            )}

            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ShieldCheck size={14} className="text-emerald-600" /> Secure transfer
              </p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                You’ll review every detail and confirm with your transaction PIN before money is sent.
              </p>
            </div>
          </aside>
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
