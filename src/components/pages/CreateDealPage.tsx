/**
 * CreateDealPage
 * Create Safe Deal wizard (`/app/deals/new`), contained but space-filling.
 * A liveness check gates entry (once every 30 days, for security). Steps:
 *  1) Basics — use case, then the deal type (structure) that use case allows
 *     (single / milestone tracking / recurring), party mode, and your role
 *     framed as sending vs receiving funds.
 *  2) Terms & parties — the amount and terms first, then the counterparties at
 *     the bottom, each with the amount they pay/receive when there's more than
 *     one. The deal-open window is capped at 30 days.
 *  3) Agreement — AI-drafted, confirmed by you.
 *  4) Review & send.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Coins,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Repeat,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { VerticalStepper, type StepMeta } from '../pieces/general/VerticalStepper';
import { AgreementDocument } from '../pieces/agreement/AgreementDocument';
import { LivenessCheckModal } from '../pieces/verification/LivenessCheckModal';
import { PinPromptModal } from '../pieces/security/PinPromptModal';
import { VerificationGate } from '../pieces/security/VerificationGate';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useCreateDeal } from '../../hooks/useTransactions';
import { useSecurity } from '../../hooks/useSecurity';
import { useAuth } from '../../libs/auth-context';
import { agreementsApi } from '../../libs/api/agreements.api';
import { useCases } from '../../libs/use-cases';
import { dealTypeMeta, featuresForUseCase } from '../../libs/features/use-case-features';
import { accountTypeOf, partyModeOptionsFor } from '../../libs/utils/account';
import { formatMinorAmount, partyModeLabel, roleLabel } from '../../libs/utils/safe-deal-presentation';
import {
  MAX_DEAL_OPEN_DAYS,
  type AgreementDraft,
  type DealRole,
  type DealType,
  type PartyMode,
} from '../../libs/store/types';

const STEPS: StepMeta[] = [
  { title: 'Deal basics', description: 'Use case, deal type, and your role.' },
  { title: 'Terms & parties', description: 'Set the terms, then invite counterparties.' },
  { title: 'Agreement', description: 'Review the AI-drafted agreement for both parties.' },
  { title: 'Review & send', description: 'Confirm everything and invite the counterparty.' },
];

const USE_CASE_SHORT: Record<string, string> = {
  'supplier-orders': 'Supplier orders',
  'contractor-projects': 'Contractor work',
  'social-commerce': 'Social storefront',
  'high-value-personal-purchases': 'High-value purchase',
  'freelance-agency-work': 'Freelance project',
  'event-vendors': 'Events & bookings',
  'property-agent-payments': 'Property & agents',
  'vehicle-transactions': 'Vehicles',
  'diaspora-purchases': 'Diaspora purchase',
  'business-service-providers': 'Business services',
};

const DEAL_TYPE_ICON: Record<DealType, typeof Coins> = {
  single: Coins,
  milestone: Truck,
  recurring: Repeat,
};

interface ParticipantForm {
  name: string;
  email: string;
  allocation: string;
}

interface FormState {
  useCase: string;
  dealType: DealType | null;
  partyMode: PartyMode | null;
  role: DealRole | null;
  participants: ParticipantForm[];
  title: string;
  description: string;
  amount: string;
  deliveryDueDate: string;
  openUntil: string;
  releaseConditions: string;
}

const emptyParticipant = (): ParticipantForm => ({ name: '', email: '', allocation: '' });

const INITIAL: FormState = {
  useCase: '',
  dealType: null,
  partyMode: null,
  role: null,
  participants: [emptyParticipant()],
  title: '',
  description: '',
  amount: '',
  deliveryDueDate: '',
  openUntil: '',
  releaseConditions: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function ChoiceCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Building2;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        'flex flex-1 items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ' +
        (selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-accent/40')
      }
    >
      <div
        className={
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' +
          (selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')
        }
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 px-4 py-3">
      <dt className="w-40 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function CreateDealPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createDeal = useCreateDeal();
  const security = useSecurity();

  const [livenessOk, setLivenessOk] = useState(security.livenessFresh);
  const [showPin, setShowPin] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreement, setAgreement] = useState<AgreementDraft | null>(null);
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const invalidateAgreement = () => {
    setAgreement(null);
    setAgreementConfirmed(false);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    invalidateAgreement();
  };

  const selectUseCase = (slug: string) => {
    const features = featuresForUseCase(slug);
    setForm((prev) => ({ ...prev, useCase: slug, dealType: features.defaultDealType }));
    setErrors((prev) => ({ ...prev, useCase: '', dealType: '' }));
    invalidateAgreement();
  };

  const updateParticipant = (index: number, key: keyof ParticipantForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    }));
    setErrors((prev) => ({ ...prev, [`participant_${index}_${key}`]: '' }));
    invalidateAgreement();
  };

  const addParticipant = () => {
    setForm((prev) => ({ ...prev, participants: [...prev.participants, emptyParticipant()] }));
    invalidateAgreement();
  };

  const removeParticipant = (index: number) => {
    setForm((prev) => ({ ...prev, participants: prev.participants.filter((_, i) => i !== index) }));
    invalidateAgreement();
  };

  const selectedUseCase = useCases.find((u) => u.slug === form.useCase);
  const features = featuresForUseCase(form.useCase);
  const amountMinor = Math.round(Number(form.amount || 0) * 100);
  const isReleaser = form.role === 'buyer';
  const multiParty = form.participants.length > 1;
  const myName = user?.name || 'You';

  const allocatedMinor = useMemo(
    () => form.participants.reduce((sum, p) => sum + Math.round(Number(p.allocation || 0) * 100), 0),
    [form.participants],
  );
  const remainderMinor = amountMinor - allocatedMinor;

  const today = useMemo(() => new Date(), []);
  const minOpen = format(addDays(today, 1), 'yyyy-MM-dd');
  const maxOpen = format(addDays(today, MAX_DEAL_OPEN_DAYS), 'yyyy-MM-dd');

  const participantNames = form.participants.map((p) => p.name.trim()).filter(Boolean);
  const buyerName = isReleaser ? myName : participantNames[0] || 'The buyer';
  const sellerName = isReleaser ? participantNames.join(', ') || 'The seller' : myName;

  // "Who's involved" options depend on the account type (a customer never sees
  // business-to-business). Auto-select when there's only one sensible option.
  const partyModeOptions = useMemo(() => partyModeOptionsFor(accountTypeOf(user)), [user]);
  useEffect(() => {
    if (partyModeOptions.length === 1 && !form.partyMode) {
      setForm((prev) => ({ ...prev, partyMode: partyModeOptions[0].mode }));
    }
  }, [partyModeOptions, form.partyMode]);

  const generateAgreement = async (version: number) => {
    setIsGenerating(true);
    setAgreementConfirmed(false);
    try {
      const response = await agreementsApi.draft(
        {
          useCaseTitle: selectedUseCase?.title ?? 'General safe deal',
          partyModeLabel: form.partyMode ? partyModeLabel(form.partyMode) : 'Protected',
          buyerName,
          sellerName,
          title: form.title,
          description: form.description,
          amountMinor,
          currency: 'NGN',
          deliveryDueDate: form.deliveryDueDate,
          releaseConditions: form.releaseConditions,
        },
        version,
      );
      setAgreement(response.data);
    } catch {
      toast.error('Could not draft the agreement. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (step === 3 && !agreement && !isGenerating) void generateAgreement(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, agreement]);

  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!form.useCase) next.useCase = 'Pick the use case that fits this deal.';
      if (!form.dealType) next.dealType = 'Choose a deal type.';
      if (!form.partyMode) next.partyMode = 'Choose the parties.';
      if (!form.role) next.role = 'Select your role.';
    }
    if (step === 2) {
      if (!form.title.trim()) next.title = 'Give the deal a short title.';
      const amount = Number(form.amount);
      if (!form.amount || Number.isNaN(amount) || amount <= 0)
        next.amount = 'Enter an amount greater than zero.';
      if (!form.deliveryDueDate) next.deliveryDueDate = 'Set a delivery due date.';
      if (!form.openUntil) {
        next.openUntil = 'Set how long the deal stays open.';
      } else {
        const days = differenceInCalendarDays(new Date(form.openUntil), today);
        if (days < 1) next.openUntil = 'Pick a future date.';
        else if (days > MAX_DEAL_OPEN_DAYS) next.openUntil = `At most ${MAX_DEAL_OPEN_DAYS} days.`;
      }
      if (!form.releaseConditions.trim())
        next.releaseConditions = 'Describe what must happen before funds release.';
      form.participants.forEach((p, i) => {
        if (!p.name.trim()) next[`participant_${i}_name`] = 'Enter a name.';
        if (!EMAIL_RE.test(p.email)) next[`participant_${i}_email`] = 'Enter a valid email.';
      });
      if (multiParty && amountMinor > 0 && allocatedMinor !== amountMinor) {
        next.allocation = `Amounts must add up to ${formatMinorAmount(amountMinor, 'NGN')}.`;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step === 3 && (!agreement || !agreementConfirmed)) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/app/deals');
      return;
    }
    setStep((s) => Math.max(s - 1, 1));
  };

  const doSubmit = async () => {
    if (!agreement) return;
    try {
      const expiresInDays = Math.min(
        MAX_DEAL_OPEN_DAYS,
        Math.max(1, differenceInCalendarDays(new Date(form.openUntil), today)),
      );
      await createDeal.mutateAsync({
        useCase: form.useCase,
        dealType: form.dealType!,
        partyMode: form.partyMode!,
        role: form.role!,
        participants: form.participants.map((p) => ({
          name: p.name.trim(),
          email: p.email.trim(),
          allocationMinor: multiParty ? Math.round(Number(p.allocation || 0) * 100) : amountMinor,
        })),
        title: form.title.trim(),
        description: form.description.trim(),
        amountMinor,
        currency: 'NGN',
        deliveryDueDate: form.deliveryDueDate,
        releaseConditions: form.releaseConditions.trim(),
        expiresInDays,
        agreement,
      });
      toast.success('Safe deal created — invitation and agreement sent to the counterparty.');
      navigate('/app/deals');
    } catch {
      toast.error('Could not create the safe deal. Please try again.');
    }
  };

  // Final submit is guarded by the transaction PIN (money-moving action).
  const requestSubmit = () => {
    if (!agreement) return;
    setShowPin(true);
  };

  const continueDisabled =
    createDeal.isPending || (step === 3 && (isGenerating || !agreement || !agreementConfirmed));

  const partiesHeading = !form.role
    ? 'Counterparties'
    : isReleaser
      ? 'Who are you paying?'
      : 'Who is paying you?';
  const perPartyLabel = isReleaser ? 'Amount they receive (NGN)' : 'Amount they pay (NGN)';

  // Hard gate: no deal starts until email + KYC are verified.
  const startBlocked = !security.emailVerified || security.kycStatus !== 'verified';
  if (startBlocked) {
    return (
      <DashboardLayout title="Create safe deal">
        <VerificationGate missing={security.missingForDeal} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create safe deal">
      <LivenessCheckModal
        open={!livenessOk}
        onOpenChange={(open) => {
          if (!open && !livenessOk) navigate('/app');
        }}
        onVerified={() => setLivenessOk(true)}
        onCancel={() => navigate('/app')}
        reason="Before creating a deal, confirm it is really you. This is required once every 30 days."
      />
      <PinPromptModal
        open={showPin}
        onOpenChange={setShowPin}
        onVerified={doSubmit}
        title="Confirm with your PIN"
        description="Enter your 4-digit transaction PIN to create this safe deal."
      />

      <div className="mx-auto w-full max-w-9xl">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left rail */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              New safe deal
            </p>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
              Create a safe deal
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Agree terms and protect payment through a regulated partner. Funds only release when
              the agreed conditions are met.
            </p>
            <div className="mt-8">
              <VerticalStepper steps={STEPS} currentStep={step} />
            </div>
            <div className="mt-8 hidden gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 lg:flex">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-muted-foreground">
                Payment goes into a partner-issued virtual account with a regulated partner. Naitrust
                never holds your funds directly.
              </p>
            </div>
          </aside>

          {/* Right — step card (fills the column) */}
          <main className="w-full">
            <Card className="gap-0 p-5 shadow-sm md:p-7">
              <div className="mb-5">
                <p className="text-xs font-semibold text-primary">
                  Step {step} of {STEPS.length}
                </p>
                <h2 className="mt-1 text-lg font-bold text-foreground">{STEPS[step - 1].title}</h2>
              </div>

              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <Label className="mb-2 block">What is this deal for?</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {useCases.map((useCase) => {
                        const Icon = useCase.icon;
                        const selected = form.useCase === useCase.slug;
                        return (
                          <button
                            key={useCase.slug}
                            type="button"
                            onClick={() => selectUseCase(useCase.slug)}
                            aria-pressed={selected}
                            className={
                              'flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors ' +
                              (selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-accent/40')
                            }
                          >
                            <Icon size={18} className={selected ? 'text-primary' : 'text-muted-foreground'} />
                            <span className="text-xs font-semibold leading-4 text-foreground">
                              {USE_CASE_SHORT[useCase.slug] ?? useCase.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <FieldError message={errors.useCase} />
                  </div>

                  {form.useCase && (
                    <div>
                      <Label className="mb-2 block">Deal type</Label>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {features.dealTypes.map((type) => {
                          const meta = dealTypeMeta(type);
                          const Icon = DEAL_TYPE_ICON[type];
                          return (
                            <ChoiceCard
                              key={type}
                              selected={form.dealType === type}
                              onClick={() => set('dealType', type)}
                              icon={Icon}
                              title={meta.label}
                              description={meta.description}
                            />
                          );
                        })}
                      </div>
                      {features.note && (
                        <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
                          {features.note}
                        </p>
                      )}
                      <FieldError message={errors.dealType} />
                    </div>
                  )}

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <Label className="mb-2 block">Who's involved</Label>
                      <div className="flex flex-col gap-3">
                        {partyModeOptions.map((opt) => (
                          <ChoiceCard
                            key={opt.mode}
                            selected={form.partyMode === opt.mode}
                            onClick={() => set('partyMode', opt.mode)}
                            icon={opt.mode === 'b2b' ? Building2 : User}
                            title={opt.title}
                            description={opt.description}
                          />
                        ))}
                      </div>
                      <FieldError message={errors.partyMode} />
                    </div>

                    <div>
                      <Label className="mb-2 block">Your role</Label>
                      <div className="flex flex-col gap-3">
                        <ChoiceCard
                          selected={form.role === 'buyer'}
                          onClick={() => set('role', 'buyer')}
                          icon={ArrowUpRight}
                          title="I'm sending funds"
                          description="You're the buyer — you pay in and release on delivery."
                        />
                        <ChoiceCard
                          selected={form.role === 'seller'}
                          onClick={() => set('role', 'seller')}
                          icon={ArrowDownLeft}
                          title="I'm receiving funds"
                          description="You're the seller — you deliver, then get paid."
                        />
                      </div>
                      <FieldError message={errors.role} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6">
                  {/* Terms first, so the amount exists before allocating to parties */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <Label htmlFor="title">Deal title</Label>
                      <Input
                        id="title"
                        className="mt-1.5"
                        placeholder="e.g. Custom furniture set — 3-seater and dining"
                        value={form.title}
                        onChange={(e) => set('title', e.target.value)}
                      />
                      <FieldError message={errors.title} />
                    </div>

                    <div>
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        className="mt-1.5"
                        rows={2}
                        placeholder="What is being delivered? Include specifics both parties agreed to."
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="amount">Total amount (NGN)</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="0"
                          inputMode="decimal"
                          className="mt-1.5"
                          placeholder="450000"
                          value={form.amount}
                          onChange={(e) => set('amount', e.target.value)}
                        />
                        {amountMinor > 0 && !errors.amount && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatMinorAmount(amountMinor, 'NGN')}
                          </p>
                        )}
                        <FieldError message={errors.amount} />
                      </div>
                      <div>
                        <Label htmlFor="due">Delivery due date</Label>
                        <Input
                          id="due"
                          type="date"
                          className="mt-1.5"
                          value={form.deliveryDueDate}
                          onChange={(e) => set('deliveryDueDate', e.target.value)}
                        />
                        <FieldError message={errors.deliveryDueDate} />
                      </div>
                      <div>
                        <Label htmlFor="open">Deal open until (up to {MAX_DEAL_OPEN_DAYS} days)</Label>
                        <Input
                          id="open"
                          type="date"
                          min={minOpen}
                          max={maxOpen}
                          className="mt-1.5"
                          value={form.openUntil}
                          onChange={(e) => set('openUntil', e.target.value)}
                        />
                        <FieldError message={errors.openUntil} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="release">Release conditions</Label>
                      <Textarea
                        id="release"
                        className="mt-1.5"
                        rows={3}
                        placeholder="What must be true before protected funds are released?"
                        value={form.releaseConditions}
                        onChange={(e) => set('releaseConditions', e.target.value)}
                      />
                      <FieldError message={errors.releaseConditions} />
                    </div>
                  </div>

                  {/* Parties at the bottom */}
                  <div className="border-t pt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <Label>{partiesHeading}</Label>
                      <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full" onClick={addParticipant}>
                        <Plus size={14} className="mr-1" />
                        Add {isReleaser ? 'recipient' : 'payer'}
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {form.participants.map((p, i) => (
                        <div key={i} className="rounded-xl border p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {isReleaser ? 'Recipient' : 'Payer'} {i + 1}
                            </span>
                            {form.participants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeParticipant(i)}
                                className="text-muted-foreground transition-colors hover:text-destructive"
                                aria-label="Remove"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                          <div className="mt-2 space-y-2">
                            <div>
                              <Input
                                placeholder="Name or business"
                                value={p.name}
                                onChange={(e) => updateParticipant(i, 'name', e.target.value)}
                              />
                              <FieldError message={errors[`participant_${i}_name`]} />
                            </div>
                            <div>
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                value={p.email}
                                onChange={(e) => updateParticipant(i, 'email', e.target.value)}
                              />
                              <FieldError message={errors[`participant_${i}_email`]} />
                            </div>
                            {multiParty && (
                              <div>
                                <Label className="text-xs">{perPartyLabel}</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  inputMode="decimal"
                                  className="mt-1"
                                  placeholder="0"
                                  value={p.allocation}
                                  onChange={(e) => updateParticipant(i, 'allocation', e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {multiParty && amountMinor > 0 && (
                      <p
                        className={
                          'mt-2 text-xs ' +
                          (remainderMinor === 0 ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400')
                        }
                      >
                        {isReleaser ? 'Allocated' : 'Assigned'} {formatMinorAmount(allocatedMinor, 'NGN')} of{' '}
                        {formatMinorAmount(amountMinor, 'NGN')}
                        {remainderMinor !== 0 && ` · ${formatMinorAmount(Math.abs(remainderMinor), 'NGN')} ${remainderMinor > 0 ? 'left' : 'over'}`}
                      </p>
                    )}
                    <FieldError message={errors.allocation} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-4">
                  {isGenerating || !agreement ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-6 py-12 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Sparkles size={22} className="animate-pulse" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Drafting your agreement…</p>
                      <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                        We use AI to turn your terms into a clear agreement for both parties. You
                        review and confirm it — nothing is sent until you do.
                      </p>
                    </div>
                  ) : (
                    <>
                      <AgreementDocument
                        agreement={agreement}
                        editable={editingAgreement}
                        onChange={(next) => {
                          setAgreement(next);
                          setAgreementConfirmed(false);
                        }}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs leading-5 text-muted-foreground">
                          AI-drafted from your terms — edit any clause, then both parties accept it
                          before the deal freezes.
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            type="button"
                            variant={editingAgreement ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full"
                            onClick={() => setEditingAgreement((v) => !v)}
                          >
                            {editingAgreement ? (
                              <>
                                <Check size={14} className="mr-1.5" />
                                Done editing
                              </>
                            ) : (
                              <>
                                <Pencil size={14} className="mr-1.5" />
                                Edit
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              setEditingAgreement(false);
                              void generateAgreement(agreement.version + 1);
                            }}
                          >
                            <RefreshCw size={14} className="mr-1.5" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <Checkbox
                          checked={agreementConfirmed}
                          onCheckedChange={(checked) => setAgreementConfirmed(checked === true)}
                          className="mt-0.5"
                        />
                        <span className="text-sm leading-6 text-foreground">
                          This agreement reflects what both parties discussed. Send it with the
                          invitation for the counterparty to accept.
                        </span>
                      </label>
                    </>
                  )}
                </div>
              )}

              {step === 4 && agreement && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-foreground">{form.title}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                      {formatMinorAmount(amountMinor, 'NGN')}
                    </p>
                  </div>

                  <dl className="divide-y divide-border rounded-xl border">
                    <ReviewRow label="Use case" value={selectedUseCase?.title ?? '—'} />
                    <ReviewRow label="Deal type" value={form.dealType ? dealTypeMeta(form.dealType).label : '—'} />
                    <ReviewRow label="Who's involved" value={form.partyMode ? partyModeLabel(form.partyMode) : '—'} />
                    <ReviewRow
                      label="Your role"
                      value={form.role ? `${roleLabel(form.role)} · ${isReleaser ? 'sending funds' : 'receiving funds'}` : '—'}
                    />
                    <ReviewRow
                      label={multiParty ? (isReleaser ? 'Recipients' : 'Payers') : 'Counterparty'}
                      value={form.participants
                        .map((p) => (multiParty && p.allocation ? `${p.name} (${formatMinorAmount(Math.round(Number(p.allocation) * 100), 'NGN')})` : p.name))
                        .join(', ')}
                    />
                    <ReviewRow label="Delivery due" value={form.deliveryDueDate || '—'} />
                    <ReviewRow
                      label="Deal open until"
                      value={form.openUntil ? format(new Date(form.openUntil), 'MMM d, yyyy') : '—'}
                    />
                    <ReviewRow
                      label="Agreement"
                      value={`v${agreement.version} · ${agreement.sections.length} clauses · confirmed by you`}
                    />
                  </dl>

                  {form.dealType === 'recurring' && (
                    <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
                      <Repeat size={14} className="mt-0.5 shrink-0 text-primary" />
                      This is a recurring deal — when it completes, a new linked deal is created
                      automatically, carrying this deal's history forward.
                    </div>
                  )}

                  <p className="text-xs leading-5 text-muted-foreground">
                    On create, we send the invitation and this agreement to the counterparty to
                    review and accept. Payment is protected through a regulated partner — Naitrust
                    never holds your funds directly.
                  </p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5">
                <Button type="button" variant="ghost" onClick={handleBack} disabled={createDeal.isPending}>
                  <ArrowLeft size={16} className="mr-1" />
                  {step === 1 ? 'Cancel' : 'Back'}
                </Button>
                {step < STEPS.length ? (
                  <Button type="button" onClick={handleNext} disabled={continueDisabled} className="rounded-full">
                    Continue
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                ) : (
                  <Button type="button" onClick={requestSubmit} disabled={createDeal.isPending} className="rounded-full">
                    {createDeal.isPending ? (
                      <>
                        <Loader2 size={16} className="mr-1.5 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} className="mr-1.5" />
                        Create safe deal
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
