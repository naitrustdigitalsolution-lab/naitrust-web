/**
 * SendInstantlyPage
 * The Instant Payment flow (`/app/payments/send`): everyday transfers
 * between parties who already trust each other. Mock-only for this phase
 * (no backend endpoint exists yet: see instant-transfer.api.ts): every
 * completed transfer is clearly labeled with a SandboxBadge, never shown as
 * a real completed payment.
 *
 * Flow: resolve/select recipient -> optionally save beneficiary -> amount &
 * narration -> review -> security confirmation (PIN) -> processing -> result.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  AtSign,
  BadgeCheck,
  Check,
  Landmark,
  Loader2,
  Send,
  ShieldCheck,
  UserPlus,
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
import { useBeneficiaries, useCreateBeneficiary } from '../../hooks/useBeneficiaries';
import { useSecurity } from '../../hooks/useSecurity';
import { useCreateInstantTransfer, useInstantTransfers, useValidateRecipient } from '../../hooks/useInstantTransfer';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import {
  beneficiaryInputFromRecipient,
  isRecipientSaved,
} from '../../libs/beneficiaries/recipient-beneficiary';
import { NIGERIAN_BANKS } from '../../libs/payments/recipient-options';
import { isNaitrustId, normalizeNaitrustId } from '../../libs/identity/naitrust-id';
import type { InstantTransfer, TransferRecipient } from '../../libs/store/types';

type FlowStep = 'recipient' | 'amount' | 'review' | 'processing' | 'result';
type RecipientRoute = 'naitrust' | 'bank_transfer' | 'beneficiary';
type NaitrustLookup = 'naitrust_account_number' | 'naitrust_id';

const METHOD_META: Record<NaitrustLookup, { label: string; icon: typeof AtSign; placeholder: string }> = {
  naitrust_account_number: { label: 'Account number', icon: Landmark, placeholder: 'e.g. 0128842193' },
  naitrust_id: { label: 'Naitrust ID', icon: AtSign, placeholder: 'e.g. NT-PA-128842' },
};

function recipientDetails(recipient: TransferRecipient): string {
  if (recipient.method === 'bank_transfer') {
    return [recipient.bankName, recipient.identifier].filter(Boolean).join(' · ');
  }
  return [
    recipient.naitrustAccountNumber,
    recipient.naitrustId,
  ].filter(Boolean).join(' · ') || recipient.identifier;
}

function estimateFeeMinor(amountMinor: number): number {
  return amountMinor > 5000000 ? 50000 : 15000;
}

const STEP_SEQUENCE: { key: FlowStep; label: string }[] = [
  { key: 'recipient', label: 'Recipient' },
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
  const [resolvingRecipient, setResolvingRecipient] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [resolvingBankRecipient, setResolvingBankRecipient] = useState(false);
  const [bankLookupError, setBankLookupError] = useState('');
  const [recipient, setRecipient] = useState<TransferRecipient | null>(null);
  const [amountNaira, setAmountNaira] = useState('');
  const [narration, setNarration] = useState('');
  const [pinOpen, setPinOpen] = useState(false);
  const [result, setResult] = useState<InstantTransfer | null>(null);
  const [error, setError] = useState('');
  const [beneficiarySaved, setBeneficiarySaved] = useState(false);

  const { data: beneficiaries, isLoading: loadingBeneficiaries } = useBeneficiaries();
  const createBeneficiary = useCreateBeneficiary();
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
  const recipientAlreadySaved = useMemo(
    () => isRecipientSaved(beneficiaries, recipient),
    [beneficiaries, recipient],
  );
  const beneficiaryInput = useMemo(
    () => (recipient ? beneficiaryInputFromRecipient(recipient) : null),
    [recipient],
  );
  const savedBeneficiaries = beneficiaries ?? [];

  // Resolve a Naitrust account after a complete account number or ID is entered.
  useEffect(() => {
    const value = identifier.trim();
    const isComplete = naitrustLookup === 'naitrust_account_number'
      ? value.length === 10
      : isNaitrustId(value);
    if (method !== 'naitrust' || !isComplete) {
      setRecipient(null);
      setLookupError('');
      setResolvingRecipient(false);
      return;
    }
    let cancelled = false;
    setRecipient(null);
    setResolvingRecipient(true);
    setLookupError('');
    const timer = setTimeout(() => {
      void validateRecipient
        .mutateAsync({ method: naitrustLookup, identifier: value })
        .then((response) => {
          if (cancelled) return;
          setRecipient(response.data);
        })
        .catch(() => {
          if (cancelled) return;
          setRecipient(null);
          setLookupError('We could not find that Naitrust account. Check the account number or Naitrust ID.');
        })
        .finally(() => {
          if (!cancelled) setResolvingRecipient(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, naitrustLookup, identifier]);

  // Mock the bank name-enquiry step after a complete bank and account number.
  useEffect(() => {
    if (method !== 'bank_transfer') {
      setResolvingBankRecipient(false);
      setBankLookupError('');
      return;
    }
    if (!recipientBank || identifier.length !== 10) {
      setRecipient(null);
      setResolvingBankRecipient(false);
      setBankLookupError('');
      return;
    }
    let cancelled = false;
    setRecipient(null);
    setResolvingBankRecipient(true);
    setBankLookupError('');
    const timer = setTimeout(() => {
      void validateRecipient
        .mutateAsync({ method: 'bank_transfer', identifier, bankName: recipientBank })
        .then((response) => {
          if (!cancelled) setRecipient(response.data);
        })
        .catch(() => {
          if (cancelled) return;
          setRecipient(null);
          setBankLookupError('We could not confirm that bank account. Check the bank and account number.');
        })
        .finally(() => {
          if (!cancelled) setResolvingBankRecipient(false);
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
      setBeneficiarySaved(false);
      setStep('amount');
    } catch {
      setError('We could not find that recipient. Double-check the details and try again.');
    }
  };

  const handleAddBeneficiary = async () => {
    if (!beneficiaryInput || recipientAlreadySaved) return;
    try {
      await createBeneficiary.mutateAsync(beneficiaryInput);
      setBeneficiarySaved(true);
      toast.success(`${beneficiaryInput.name} was added to your beneficiaries.`);
    } catch {
      toast.error('This recipient could not be added. Please try again.');
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
    setLookupError('');
    setResolvingRecipient(false);
    setBankLookupError('');
    setResolvingBankRecipient(false);
    setAmountNaira('');
    setNarration('');
    setResult(null);
    setError('');
    setBeneficiarySaved(false);
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
              <p className="mt-1 text-sm text-muted-foreground">Choose a beneficiary, Naitrust account, or Nigerian bank account.</p>
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
                        <span className="block truncate text-xs text-muted-foreground">
                          {recipientDetails(r)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Tabs
              value={method}
              onValueChange={(value) => {
                setMethod(value as RecipientRoute);
                setIdentifier('');
                setRecipientBank('');
                setRecipient(null);
                setLookupError('');
                setBankLookupError('');
                setError('');
                setBeneficiarySaved(false);
              }}
            >
              <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted/70 p-1">
                {([
                  { key: 'naitrust', label: 'Naitrust account' },
                  { key: 'bank_transfer', label: 'Bank account' },
                  { key: 'beneficiary', label: 'Beneficiaries' },
                ] as const).map(({ key, label }) => (
                  <TabsTrigger key={key} value={key} className="min-h-10 rounded-lg px-2 text-xs data-[state=active]:shadow-sm sm:text-sm">
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="naitrust" className="mt-4 space-y-4">
                <div>
                  <Label>Find their Naitrust account with</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(Object.entries(METHOD_META) as [NaitrustLookup, (typeof METHOD_META)[NaitrustLookup]][]).map(([key, meta]) => {
                      const Icon = meta.icon;
                      return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setNaitrustLookup(key);
                          setIdentifier('');
                          setRecipient(null);
                          setLookupError('');
                          setBeneficiarySaved(false);
                        }}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors sm:text-sm ${
                          naitrustLookup === key ? 'border-primary bg-primary/10 text-primary' : 'bg-background text-muted-foreground hover:bg-accent/50'
                        }`}
                      >
                        <Icon size={15} />
                        {meta.label}
                      </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label htmlFor="naitrust-recipient">{METHOD_META[naitrustLookup].label}</Label>
                  <Input
                    id="naitrust-recipient"
                    type="text"
                    inputMode={naitrustLookup === 'naitrust_account_number' ? 'numeric' : undefined}
                    maxLength={naitrustLookup === 'naitrust_account_number' ? 10 : 13}
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(
                        naitrustLookup === 'naitrust_account_number'
                          ? event.target.value.replace(/\D/g, '').slice(0, 10)
                          : normalizeNaitrustId(event.target.value),
                      );
                      setBeneficiarySaved(false);
                    }}
                    placeholder={METHOD_META[naitrustLookup].placeholder}
                    className="mt-1.5 h-11"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    We will show the registered person or business before you continue.
                  </p>
                </div>
                {resolvingRecipient && (
                  <div className="flex items-center gap-2 rounded-xl border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 size={15} className="animate-spin text-primary" />
                    Finding Naitrust account…
                  </div>
                )}
                {lookupError && (
                  <p className="rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-3 text-sm text-destructive">
                    {lookupError}
                  </p>
                )}
                {recipient && !resolvingRecipient && (
                  <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.035]">
                    <div className="flex items-center gap-3 border-b border-primary/10 px-4 py-4">
                      <CounterpartyAvatar name={recipientName ?? ''} className="h-11 w-11 text-sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-foreground">{recipientName}</p>
                          {recipient.identityVerified && <BadgeCheck size={15} className="shrink-0 text-primary" aria-label="Verified Naitrust account" />}
                        </div>
                        <p className="mt-0.5 text-xs capitalize text-muted-foreground">{recipient.accountType ?? 'Naitrust'} account</p>
                      </div>
                    </div>
                    <dl className="grid gap-3 px-4 py-4 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Account number</dt>
                        <dd className="mt-1 font-semibold text-foreground">{recipient.naitrustAccountNumber ?? 'Not available'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Naitrust ID</dt>
                        <dd className="mt-1 font-semibold text-foreground">{recipient.naitrustId ?? 'Not available'}</dd>
                      </div>
                    </dl>
                    <div className="grid gap-2 border-t border-primary/10 bg-background/55 p-3 sm:grid-cols-2">
                      {recipientAlreadySaved || beneficiarySaved ? (
                        <div className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <Check size={14} /> Saved beneficiary
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          disabled={createBeneficiary.isPending}
                          onClick={() => void handleAddBeneficiary()}
                        >
                          {createBeneficiary.isPending ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <UserPlus size={15} className="mr-1.5" />}
                          Add to beneficiaries
                        </Button>
                      )}
                      <Button type="button" className="rounded-full" onClick={() => setStep('amount')}>
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bank_transfer" className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="recipient-bank">Recipient bank</Label>
                  <Select value={recipientBank} onValueChange={(value) => {
                    setRecipientBank(value);
                    setRecipient(null);
                    setBankLookupError('');
                    setBeneficiarySaved(false);
                  }}>
                    <SelectTrigger id="recipient-bank" className="mt-1.5 h-11 w-full">
                      <SelectValue placeholder="Select a Nigerian bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bank-account-number">Account number</Label>
                  <Input
                    id="bank-account-number"
                    value={identifier}
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(event) => {
                      setIdentifier(event.target.value.replace(/\D/g, '').slice(0, 10));
                      setBeneficiarySaved(false);
                    }}
                    placeholder="10-digit account number"
                    className="mt-1.5 h-11"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    We will confirm the account name before you continue.
                  </p>
                </div>
                {resolvingBankRecipient && (
                  <div className="flex items-center gap-2 rounded-xl border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 size={15} className="animate-spin text-primary" />
                    Confirming bank account…
                  </div>
                )}
                {bankLookupError && (
                  <p className="rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-3 text-sm text-destructive">
                    {bankLookupError}
                  </p>
                )}
                {recipient?.method === 'bank_transfer' && !resolvingBankRecipient && (
                  <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.035]">
                    <div className="flex items-center gap-3 px-4 py-4">
                      <CounterpartyAvatar name={recipientName ?? ''} className="h-11 w-11 text-sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{recipientName}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{recipientDetails(recipient)}</p>
                      </div>
                    </div>
                    <div className="grid gap-2 border-t border-primary/10 bg-background/55 p-3 sm:grid-cols-2">
                      {recipientAlreadySaved || beneficiarySaved ? (
                        <div className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <Check size={14} /> Saved beneficiary
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          disabled={createBeneficiary.isPending}
                          onClick={() => void handleAddBeneficiary()}
                        >
                          {createBeneficiary.isPending ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <UserPlus size={15} className="mr-1.5" />}
                          Add to beneficiaries
                        </Button>
                      )}
                      <Button type="button" className="rounded-full" onClick={() => setStep('amount')}>
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="beneficiary" className="mt-4 space-y-2">
                {loadingBeneficiaries ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Loading beneficiaries…</p>
                ) : savedBeneficiaries.length === 0 ? (
                  <div className="rounded-xl border border-dashed px-5 py-8 text-center">
                    <Users size={20} className="mx-auto text-muted-foreground" />
                    <p className="mt-3 text-sm font-semibold text-foreground">No saved beneficiaries yet</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Confirm a Naitrust or bank account, then add it as a beneficiary.
                    </p>
                  </div>
                ) : (
                  savedBeneficiaries.map((beneficiary) => {
                    const isBankAccount = beneficiary.type === 'bank_account';
                    const savedIdentifier = isBankAccount
                      ? beneficiary.accountNumber ?? beneficiary.id
                      : beneficiary.naitrustAccountNumber
                        ?? beneficiary.naitrustId
                        ?? beneficiary.naitrustIdentifier
                        ?? beneficiary.id;
                    const savedMethod = isBankAccount
                      ? 'bank_transfer' as const
                      : beneficiary.naitrustAccountNumber
                        ? 'naitrust_account_number' as const
                        : 'naitrust_id' as const;
                    return (
                    <button
                      key={beneficiary.id}
                      type="button"
                      onClick={() =>
                        void handlePickRecipient({
                          method: savedMethod,
                          identifier: savedIdentifier,
                          resolvedName: beneficiary.name,
                          bankName: beneficiary.bankName,
                          naitrustAccountNumber: beneficiary.naitrustAccountNumber,
                          naitrustId: beneficiary.naitrustId,
                        })
                      }
                      className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
                    >
                      <CounterpartyAvatar name={beneficiary.name} />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                          {beneficiary.name}
                          {!isBankAccount && <BadgeCheck size={14} className="shrink-0 text-primary" />}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {isBankAccount
                            ? [beneficiary.bankName, beneficiary.accountNumber].filter(Boolean).join(' · ')
                            : [beneficiary.naitrustAccountNumber, beneficiary.naitrustId].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </button>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
            </div>
          </Card>
        )}

        {step === 'amount' && recipient && (
          <Card className="rounded-3xl p-5 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
              <CounterpartyAvatar name={recipient.resolvedName ?? recipient.identifier} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{recipient.resolvedName ?? recipient.identifier}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {recipientDetails(recipient)}
                </p>
              </div>
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
            <Button className="mt-5 w-full rounded-md" onClick={() => setPinOpen(true)} disabled={createBeneficiary.isPending}>
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
            {beneficiarySaved && (
              <p className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Users size={14} /> Recipient saved to your beneficiaries
              </p>
            )}
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
                        {recipientDetails(recipient)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">{amountMinor > 0 ? formatMinorAmount(amountMinor, 'NGN') : 'Not available'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Transfer fee</span>
                    <span className="font-semibold">{feeMinor > 0 ? formatMinorAmount(feeMinor, 'NGN') : 'Not available'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">{amountMinor > 0 ? formatMinorAmount(amountMinor + feeMinor, 'NGN') : 'Not available'}</span>
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
