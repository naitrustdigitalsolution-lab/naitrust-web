/**
 * CreateDealPage
 * Create Safe Deal wizard (`/app/deals/new`), contained but space-filling.
 * A liveness check gates entry (once every 30 days, for security). Steps:
 *  1) Basics: use case, then the deal type (structure) that use case allows
 *     (single / milestone tracking / recurring), party mode, and your role
 *     framed as sending vs receiving funds.
 *  2) Terms & parties: the amount and terms first, then the counterparties at
 *     the bottom, each with the amount they pay/receive when there's more than
 *     one. The deal-open window is capped at 30 days.
 *  3) Agreement: prepared from the terms and confirmed by you.
 *  4) Review & send.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Copy,
  ChevronDown,
  Clock3,
  Coins,
  FileCheck2,
  Loader2,
  Pencil,
  RefreshCw,
  Repeat,
  ScanFace,
  ShieldCheck,
  Save,
  Send,
  Truck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { VerticalStepper, type StepMeta } from '../pieces/general/VerticalStepper';
import { AgreementDocument } from '../pieces/agreement/AgreementDocument';
import { LivenessCheckModal } from '../pieces/verification/LivenessCheckModal';
import { PinPromptModal } from '../pieces/security/PinPromptModal';
import {
  CreateDealDetailsStep,
  type DealDetailsValues,
  type DealParticipantForm,
} from '../pieces/transaction/CreateDealDetailsStep';
import { DraftSavedForPinModal } from '../pieces/transaction/DraftSavedForPinModal';
import { VerificationGate } from '../pieces/security/VerificationGate';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { useCreateDeal } from '../../hooks/useTransactions';
import { useCounterparties } from '../../hooks/useCounterparties';
import { useBeneficiaries } from '../../hooks/useBeneficiaries';
import { useBusinessSearch } from '../../hooks/useBusinessDirectory';
import { useSavedBusinesses } from '../../hooks/useSavedBusinesses';
import { useSecurity } from '../../hooks/useSecurity';
import { useAuth } from '../../libs/auth-context';
import { agreementsApi } from '../../libs/api/agreements.api';
import { useCases } from '../../libs/use-cases';
import { dealTypeMeta, featuresForUseCase } from '../../libs/features/use-case-features';
import { supportsDeliveryReview } from '../../libs/protected-deals/delivery-review';
import {
  canReplaceWithSuggestedReleaseConditions,
  DEFAULT_INVITATION_EXPIRY_DAYS,
  shortUseCaseLabel,
  splitCreateDealUseCases,
  suggestedReleaseConditions,
} from '../../libs/protected-deals/create-deal-options';
import { accountTypeOf, partyModeOptionsFor } from '../../libs/utils/account';
import { formatMinorAmount, partyModeLabel, roleLabel } from '../../libs/utils/safe-deal-presentation';
import { clearDealDraft, loadDealDraft, saveDealDraft } from '../../libs/utils/deal-draft';
import {
  MAX_DEAL_OPEN_DAYS,
  type AgreementDraft,
  type CounterpartyProfile,
  type DealRole,
  type DealType,
  type PartyMode,
} from '../../libs/store/types';
import mockAuthUsers from '../../mocks/apis/auth-users.json';

const STEPS: StepMeta[] = [
  { title: 'Start the deal', description: 'Choose what you are protecting and how money moves.' },
  { title: 'Add the details', description: 'Enter the amount, terms, and the other party.' },
  { title: 'Agreement', description: 'Review the agreement prepared from your terms.' },
  { title: 'Review & send', description: 'Confirm everything and invite the counterparty.' },
];

const CREATE_DEAL_USE_CASES = splitCreateDealUseCases(useCases);

const DEAL_TYPE_ICON: Record<DealType, typeof Coins> = {
  single: Coins,
  milestone: Truck,
  recurring: Repeat,
};

interface FormState extends DealDetailsValues {
  useCase: string;
  dealType: DealType | null;
  partyMode: PartyMode | null;
  role: DealRole | null;
}

const emptyParticipant = (): DealParticipantForm => ({ name: '', contact: '', allocation: '' });

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
  extendedProductTestingDays: undefined,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s()-]{8,18}$/;
const NAITRUST_ID_RE = /^(NT|NIT)[-_]?[A-Z0-9]{4,}$/i;
const ACCOUNT_RE = /^\d{10}$/;

function isValidContact(value: string): boolean {
  const contact = value.trim();
  return EMAIL_RE.test(contact) || PHONE_RE.test(contact) || NAITRUST_ID_RE.test(contact) || ACCOUNT_RE.test(contact);
}

function participantContact(value: string): { email?: string; phone?: string; identifier?: string } {
  const contact = value.trim();
  if (EMAIL_RE.test(contact)) return { email: contact };
  if (PHONE_RE.test(contact) && !ACCOUNT_RE.test(contact)) return { phone: contact };
  return { identifier: contact };
}

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
        'group flex flex-1 items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ' +
        (selected
          ? 'border-primary/50 bg-primary/[0.07] shadow-sm ring-1 ring-primary/30'
          : 'border-border/80 bg-background hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md')
      }
    >
      <div
        className={
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ' +
          (selected ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary')
        }
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
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

function AgreementPreparationState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FileCheck2 size={22} className="animate-pulse" />
      </div>
      <p className="text-sm font-semibold text-foreground">Preparing your agreement…</p>
      <p className="max-w-sm text-xs leading-5 text-muted-foreground">
        We are rebuilding the agreement from the details saved with this draft.
      </p>
    </div>
  );
}

export function CreateDealPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const createDeal = useCreateDeal();
  const security = useSecurity();
  const accountType = accountTypeOf(user);
  const { data: savedCounterparties = [], isLoading: savedCounterpartiesLoading } = useCounterparties(true);
  const { data: beneficiaries = [] } = useBeneficiaries();
  const { data: directoryBusinesses = [] } = useBusinessSearch('');
  const { savedBusinessIds } = useSavedBusinesses();
  const businessContacts = useMemo<CounterpartyProfile[]>(() => directoryBusinesses.map((business) => ({ id: business.id, name: business.name, businessName: business.name, email: business.email, phone: business.phone, notes: business.ntId, avatarInitials: business.name.slice(0, 2).toUpperCase(), relation: 'supplier', identityVerified: business.verified, businessVerified: business.verified, memberSince: business.createdAt, completedDealsCount: business.completedProtectedTransactions ?? 0, hasPriorTransactionWithYou: false, resolvedDisputesCount: 0, ratingAverage: business.ratingAverage, isFavourite: savedBusinessIds.includes(business.id), isBlocked: false })), [directoryBusinesses, savedBusinessIds]);
  const beneficiaryContacts = useMemo<CounterpartyProfile[]>(() => beneficiaries.map((beneficiary) => ({ id: beneficiary.id, name: beneficiary.name, businessName: beneficiary.naitrustId?.startsWith('NT-BIZ-') ? beneficiary.name : undefined, email: beneficiary.email, phone: beneficiary.phone, avatarInitials: beneficiary.name.slice(0, 2).toUpperCase(), relation: 'customer', identityVerified: beneficiary.type === 'naitrust_user', businessVerified: beneficiary.naitrustId?.startsWith('NT-BIZ-') ?? false, memberSince: beneficiary.createdAt, completedDealsCount: 0, hasPriorTransactionWithYou: true, resolvedDisputesCount: 0, isFavourite: beneficiary.isFavourite, isBlocked: false, notes: beneficiary.naitrustId ?? beneficiary.naitrustAccountNumber ?? beneficiary.accountNumber })), [beneficiaries]);
  const personalDirectoryContacts = useMemo<CounterpartyProfile[]>(() => mockAuthUsers.users.filter(({ user: account }) => account.role === 'customer' && account.id !== user?.id).map(({ user: account }) => ({ id: account.id, naitrustId: account.naitrustId, name: account.name, email: account.email, phone: account.phone, notes: account.naitrustId, avatarInitials: account.name.slice(0, 2).toUpperCase(), relation: 'customer', identityVerified: account.kycVerified, businessVerified: false, memberSince: new Date().toISOString(), completedDealsCount: 0, hasPriorTransactionWithYou: false, resolvedDisputesCount: 0, isFavourite: false, isBlocked: false })), [user?.id]);
  const customerSavedContacts = useMemo(() => [...businessContacts.filter((business) => savedBusinessIds.includes(business.id)), ...beneficiaryContacts], [beneficiaryContacts, businessContacts, savedBusinessIds]);

  const requestedDraftId = searchParams.get('draft');
  const recoveredDraft = useMemo(
    () => loadDealDraft<FormState>(user?.id, requestedDraftId),
    [user?.id, requestedDraftId],
  );
  const draftId = useMemo(() => recoveredDraft?.id ?? crypto.randomUUID(), [recoveredDraft?.id]);
  const [livenessOk, setLivenessOk] = useState(security.livenessFresh);
  const [showLiveness, setShowLiveness] = useState(!security.livenessFresh);
  const [showPin, setShowPin] = useState(false);
  const [showPinDraftSaved, setShowPinDraftSaved] = useState(false);
  const [step, setStep] = useState(() => Math.min(Math.max(recoveredDraft?.step ?? 1, 1), STEPS.length));
  const [form, setForm] = useState<FormState>(() => {
    if (recoveredDraft?.form) {
      return {
        ...recoveredDraft.form,
        openUntil:
          recoveredDraft.form.openUntil ||
          format(addDays(new Date(), DEFAULT_INVITATION_EXPIRY_DAYS), 'yyyy-MM-dd'),
        participants: recoveredDraft.form.participants.map((participant) => ({
          ...participant,
          contact:
            participant.contact ||
            ((participant as DealParticipantForm & { email?: string }).email ?? ''),
        })),
      };
    }
    const businessName = searchParams.get('name') ?? '';
    const businessEmail = searchParams.get('email') ?? '';
    const businessId = searchParams.get('business') ?? undefined;
    return {
      ...INITIAL,
      openUntil: format(addDays(new Date(), DEFAULT_INVITATION_EXPIRY_DAYS), 'yyyy-MM-dd'),
      partyMode: accountType === 'customer' && businessId ? 'b2c' : null,
      role: accountType === 'customer' ? 'buyer' : null,
      participants: [{ name: businessName, contact: businessEmail, allocation: '', profileId: businessId }],
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreement, setAgreement] = useState<AgreementDraft | null>(null);
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAllUseCases, setShowAllUseCases] = useState(() =>
    CREATE_DEAL_USE_CASES.more.some((useCase) => useCase.slug === recoveredDraft?.form?.useCase),
  );
  const [showDealTypeOptions, setShowDealTypeOptions] = useState(false);
  const [showAdvancedTiming, setShowAdvancedTiming] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<{ dealId: string; title: string; url: string } | null>(null);

  useEffect(() => {
    if (recoveredDraft) toast.info('Deal draft opened.');
    // Only announce the recovery once when the wizard mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hasContent =
      !!form.useCase || !!form.title.trim() || !!form.description.trim() || !!form.amount ||
      form.participants.some((participant) => !!participant.name.trim() || !!participant.contact.trim());
    if (!hasContent) return;
    const timer = window.setTimeout(() => saveDealDraft(user?.id, draftId, form, step), 400);
    return () => window.clearTimeout(timer);
  }, [draftId, form, step, user?.id]);

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
    setForm((prev) => ({
      ...prev,
      useCase: slug,
      dealType: features.defaultDealType,
      releaseConditions: canReplaceWithSuggestedReleaseConditions(prev.releaseConditions)
        ? suggestedReleaseConditions(slug)
        : prev.releaseConditions,
      extendedProductTestingDays: supportsDeliveryReview(slug)
        ? prev.extendedProductTestingDays
        : undefined,
    }));
    setErrors((prev) => ({ ...prev, useCase: '', dealType: '' }));
    setShowDealTypeOptions(false);
    invalidateAgreement();
  };

  const updateParticipant = (index: number, key: keyof DealParticipantForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((participant, participantIndex) => {
        if (participantIndex !== index) return participant;
        const updated = { ...participant, [key]: value };
        if (key === 'name' || key === 'contact') {
          updated.profileId = undefined;
          updated.relation = undefined;
        }
        return updated;
      }),
    }));
    setErrors((prev) => ({ ...prev, [`participant_${index}_${key}`]: '' }));
    invalidateAgreement();
  };

  const addParticipant = () => {
    setForm((prev) => ({ ...prev, participants: [...prev.participants, emptyParticipant()] }));
    invalidateAgreement();
  };

  const selectSavedCounterparty = (counterparty: CounterpartyProfile) => {
    const contact = counterparty.email ?? counterparty.phone ?? counterparty.notes;
    if (!contact) {
      toast.error('Add an email or phone number to this saved contact before inviting them.');
      return;
    }

    const participant: DealParticipantForm = {
      name: counterparty.businessName ?? counterparty.name,
      contact,
      allocation: '',
      profileId: counterparty.id,
      relation: counterparty.relation,
    };

    setForm((current) => {
      if (current.participants.some((item) => item.profileId === counterparty.id)) return current;
      const emptyIndex = current.participants.findIndex(
        (item) => !item.name.trim() && !item.contact.trim(),
      );
      if (emptyIndex < 0) {
        return { ...current, participants: [...current.participants, participant] };
      }
      return {
        ...current,
        participants: current.participants.map((item, index) => index === emptyIndex ? participant : item),
      };
    });
    setErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([key]) => !key.startsWith('participant_') && key !== 'allocation'),
    ));
    invalidateAgreement();
  };

  const removeParticipant = (index: number) => {
    setForm((prev) => ({ ...prev, participants: prev.participants.filter((_, i) => i !== index) }));
    invalidateAgreement();
  };

  const removeSelectedCounterparty = (counterparty: CounterpartyProfile) => {
    const identities = [counterparty.email, counterparty.phone, counterparty.notes].filter(Boolean).map((value) => value!.trim().toLowerCase());
    setForm((prev) => {
      const remaining = prev.participants.filter((participant) => participant.profileId !== counterparty.id && !identities.includes(participant.contact.trim().toLowerCase()));
      return { ...prev, participants: remaining.length > 0 ? remaining : [emptyParticipant()] };
    });
    invalidateAgreement();
  };

  const selectedUseCase = useCases.find((u) => u.slug === form.useCase);
  const features = featuresForUseCase(form.useCase);
  const amountMinor = Math.round(Number(form.amount || 0) * 100);
  const isReleaser = form.role === 'buyer';
  const expectedCounterpartyKind = form.partyMode === 'b2b' ? 'business' : form.partyMode === 'p2p' ? 'individual' : form.partyMode === 'b2c' ? (accountType === 'customer' ? 'business' : 'individual') : 'any';
  const matchesExpectedKind = (contact: CounterpartyProfile) => expectedCounterpartyKind === 'any' || (expectedCounterpartyKind === 'business' ? Boolean(contact.businessName) : !contact.businessName);
  const eligibleSavedCounterparties = (accountType === 'customer' ? customerSavedContacts : savedCounterparties).filter(matchesExpectedKind);
  const eligibleDirectoryCounterparties = [...businessContacts, ...personalDirectoryContacts].filter(matchesExpectedKind);
  const multiParty = form.participants.length > 1;
  const myName = user?.name || 'You';

  const allocatedMinor = useMemo(
    () => form.participants.reduce((sum, p) => sum + Math.round(Number(p.allocation || 0) * 100), 0),
    [form.participants],
  );

  const today = useMemo(() => new Date(), []);
  const minOpen = format(addDays(today, 1), 'yyyy-MM-dd');
  const maxOpen = format(addDays(today, MAX_DEAL_OPEN_DAYS), 'yyyy-MM-dd');

  const participantNames = form.participants.map((p) => p.name.trim()).filter(Boolean);
  const buyerName = isReleaser ? myName : participantNames[0] || 'The buyer';
  const sellerName = isReleaser ? participantNames.join(', ') || 'The seller' : myName;

  // "Who's involved" options depend on the account type (a customer never sees
  // business-to-business). Auto-select when there's only one sensible option.
  const partyModeOptions = useMemo(() => partyModeOptionsFor(accountType), [accountType]);
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
          useCaseTitle: selectedUseCase?.title ?? 'Protected Deal',
          partyModeLabel: form.partyMode ? partyModeLabel(form.partyMode) : 'Protected',
          buyerName,
          sellerName,
          title: form.title,
          description: form.description,
          amountMinor,
          currency: 'NGN',
          deliveryDueDate: form.deliveryDueDate,
          releaseConditions: form.releaseConditions,
          extendedProductTestingDays: form.extendedProductTestingDays,
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
    if (step >= 3 && !agreement && !isGenerating) void generateAgreement(1);
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
      if (!form.deliveryDueDate) next.deliveryDueDate = 'Set the next milestone or completion date.';
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
        if (!isValidContact(p.contact)) next[`participant_${i}_contact`] = 'Enter a valid email or phone number.';
      });
      if (multiParty && amountMinor > 0 && allocatedMinor !== amountMinor) {
        next.allocation = `Amounts must add up to ${formatMinorAmount(amountMinor, 'NGN')}.`;
      }
    }
    setErrors(next);
    if (next.openUntil) setShowAdvancedTiming(true);
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

  const persistCurrentDraft = () => {
    saveDealDraft(user?.id, draftId, form, step);
  };

  const handleSaveDraft = () => {
    if (!form.title.trim()) {
      setErrors((current) => ({ ...current, title: 'Enter a deal title before saving this draft.' }));
      toast.error('Enter a deal title to save this deal to drafts.');
      return;
    }
    persistCurrentDraft();
    toast.success('Deal saved to drafts.');
    navigate('/app/drafts');
  };

  const doSubmit = async () => {
    if (!agreement) return;
    try {
      const expiresInDays = Math.min(
        MAX_DEAL_OPEN_DAYS,
        Math.max(1, differenceInCalendarDays(new Date(form.openUntil), today)),
      );
      const created = await createDeal.mutateAsync({
        useCase: form.useCase,
        dealType: form.dealType!,
        partyMode: form.partyMode!,
        role: form.role!,
        participants: form.participants.map((p) => ({
          name: p.name.trim(),
          ...participantContact(p.contact),
          profileId: p.profileId,
          allocationMinor: multiParty ? Math.round(Number(p.allocation || 0) * 100) : amountMinor,
        })),
        title: form.title.trim(),
        description: form.description.trim(),
        amountMinor,
        currency: 'NGN',
        deliveryDueDate: form.deliveryDueDate,
        releaseConditions: form.releaseConditions.trim(),
        extendedProductTestingDays: form.extendedProductTestingDays,
        expiresInDays,
        agreement,
      });
      clearDealDraft(user?.id, draftId);
      const shareUrl = `${window.location.origin}${created.data.publicInvitePath}`;
      setCreatedInvitation({ dealId: created.data.id, title: created.data.title, url: shareUrl });
      toast.success('Protected Deal created. Your invitation link is ready.');
    } catch {
      toast.error('Could not create the Protected Deal. Please try again.');
    }
  };

  if (createdInvitation) {
    return (
      <DashboardLayout title="Invitation ready">
        <div className="mx-auto w-full max-w-2xl py-8">
          <Card className="rounded-3xl p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700"><Check size={22} /></div>
            <h1 className="mt-5 text-2xl font-bold">Protected Deal created</h1>
            <p className="mt-2 text-sm text-muted-foreground">{createdInvitation.title}</p>
            <div className="mt-6 rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deal invitation link</p>
              <p className="mt-2 break-all text-sm font-medium">{createdInvitation.url}</p>
              <Button className="mt-4 w-full rounded-full" onClick={() => void navigator.clipboard.writeText(createdInvitation.url).then(() => toast.success('Invitation link copied'))}>
                <Copy size={15} /> Copy invitation link
              </Button>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Send this link by email, SMS, or WhatsApp. The recipient will verify their invited contact or Naitrust identity before joining.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => navigate('/app/deals/new')}>Create another deal</Button>
              <Button className="flex-1 rounded-full" onClick={() => navigate(`/app/deals/${createdInvitation.dealId}`)}>Open deal</Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Final submit is guarded by the transaction PIN (money-moving action).
  const requestSubmit = () => {
    if (!agreement) return;
    if (!security.pinSet) {
      persistCurrentDraft();
      setShowPinDraftSaved(true);
      return;
    }
    setShowPin(true);
  };

  const continueDisabled =
    createDeal.isPending || !livenessOk || (step === 3 && (isGenerating || !agreement || !agreementConfirmed));

  // Hard gate: no deal starts until email + KYC are verified.
  const startBlocked = !security.emailVerified || security.kycStatus !== 'verified';
  if (startBlocked) {
    return (
      <DashboardLayout title="New Protected Deal">
        <VerificationGate missing={security.missingForDeal} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="New Protected Deal">
      <LivenessCheckModal
        open={showLiveness}
        onOpenChange={setShowLiveness}
        onVerified={() => {
          setLivenessOk(true);
          setShowLiveness(false);
        }}
        reason="Before creating a deal, confirm it is really you. This is required once every 30 days."
      />
      <PinPromptModal
        open={showPin}
        onOpenChange={setShowPin}
        onVerified={doSubmit}
        title="Confirm with your PIN"
        description="Enter your 4-digit transaction PIN to create this Protected Deal."
      />
      <DraftSavedForPinModal
        open={showPinDraftSaved}
        onOpenChange={setShowPinDraftSaved}
        onViewDrafts={() => {
          setShowPinDraftSaved(false);
          navigate('/app/drafts');
        }}
        onSetPin={() => {
          persistCurrentDraft();
          setShowPinDraftSaved(false);
          navigate('/app/security');
        }}
      />

      <div className="mx-auto w-full max-w-9xl">
        <PageHero
          eyebrow="Protected payments"
          title="Create a Protected Deal"
          description="Turn an agreement into a clear, trackable payment journey for everyone involved."
          icon={ShieldCheck}
          actions={
            <Button variant="outline" className="rounded-full bg-background/80" onClick={() => navigate('/app/deals')}>
              <ArrowLeft size={15} /> Active Deals
            </Button>
          }
        />

        <div className="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* Left rail */}
          <aside className="rounded-3xl border border-primary/10 bg-card p-5 shadow-sm xl:sticky xl:top-20 xl:self-start">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Deal setup</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{Math.round((step / STEPS.length) * 100)}% complete</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={18} />
              </span>
            </div>
            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400 transition-all duration-500" style={{ width: `${(step / STEPS.length) * 100}%` }} />
            </div>
            <div>
              <VerticalStepper steps={STEPS} currentStep={step} />
            </div>
            <div className="mt-7 hidden gap-3 rounded-2xl bg-gradient-to-br from-[#071b31] to-[#0b4d91] p-4 text-white xl:flex">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-sky-300" />
              <p className="text-xs leading-5 text-muted-foreground">
                <span className="text-white/80">Funds move through a partner-issued account with a regulated provider. Naitrust never holds them directly.</span>
              </p>
            </div>
          </aside>

          {/* Right: step card (fills the column) */}
          <main className="w-full">
            <Card className="gap-0 overflow-hidden rounded-3xl border-border/80 p-0 shadow-[0_16px_45px_rgba(7,27,49,.08)]">
              <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.09] via-background to-background px-5 py-5 sm:px-7">
                <div className="pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20">
                    {step}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                      Step {step} of {STEPS.length}
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">{STEPS[step - 1].title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{STEPS[step - 1].description}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7">
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <Label className="block text-base">What are you protecting?</Label>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Choose the closest match. If none fits, select “Something else.”
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {(showAllUseCases
                        ? [...CREATE_DEAL_USE_CASES.quick, ...CREATE_DEAL_USE_CASES.more]
                        : CREATE_DEAL_USE_CASES.quick
                      ).map((useCase) => {
                        const Icon = useCase.icon;
                        const selected = form.useCase === useCase.slug;
                        return (
                          <button
                            key={useCase.slug}
                            type="button"
                            onClick={() => selectUseCase(useCase.slug)}
                            aria-pressed={selected}
                            className={'group flex min-h-16 flex-row items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 ' +
                              (selected ? 'border-primary/50 bg-primary/[0.07] shadow-sm ring-1 ring-primary/30' : 'border-border/80 bg-background hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md')}
                          >
                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                              <Icon size={17} />
                            </span>
                            <span className="text-xs font-semibold leading-4 text-foreground">
                              {shortUseCaseLabel(useCase)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAllUseCases((current) => !current)}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      {showAllUseCases ? 'Show common choices only' : 'See all deal types'}
                      <ChevronDown
                        size={15}
                        className={`transition-transform ${showAllUseCases ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <FieldError message={errors.useCase} />
                  </div>

                  {form.useCase && features.dealTypes.length > 1 && (
                    <div>
                      <Label className="mb-2 block">How should it run?</Label>
                      {!showDealTypeOptions ? (
                        <div className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Recommended: {form.dealType ? dealTypeMeta(form.dealType).label : 'Standard setup'}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {form.dealType ? dealTypeMeta(form.dealType).description : 'We selected the simplest setup for this deal.'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-fit rounded-full"
                            onClick={() => setShowDealTypeOptions(true)}
                          >
                            Change setup
                          </Button>
                        </div>
                      ) : (
                        <>
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
                          <button
                            type="button"
                            className="mt-3 text-sm font-semibold text-primary"
                            onClick={() => setShowDealTypeOptions(false)}
                          >
                            Use selected setup
                          </button>
                        </>
                      )}
                      {features.note && showDealTypeOptions && (
                        <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">{features.note}</p>
                      )}
                      <FieldError message={errors.dealType} />
                    </div>
                  )}

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <Label className="mb-2 block">Who are you dealing with?</Label>
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
                      <Label className="mb-2 block">Will you pay or receive?</Label>
                      <div className="flex flex-col gap-3">
                        <ChoiceCard
                          selected={form.role === 'buyer'}
                          onClick={() => set('role', 'buyer')}
                          icon={ArrowUpRight}
                          title="I will pay"
                          description="You fund the deal and confirm the product, service, or agreed milestone."
                        />
                        <ChoiceCard
                          selected={form.role === 'seller'}
                          onClick={() => set('role', 'seller')}
                          icon={ArrowDownLeft}
                          title="I will receive"
                          description="You provide the product or service, then receive payment after the agreed checks."
                        />
                      </div>
                      <FieldError message={errors.role} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <CreateDealDetailsStep
                  form={form}
                  errors={errors}
                  isReleaser={isReleaser}
                  minOpen={minOpen}
                  maxOpen={maxOpen}
                  maxOpenDays={MAX_DEAL_OPEN_DAYS}
                  showAdvancedTiming={showAdvancedTiming}
                  canUseSavedContacts
                  savedCounterparties={eligibleSavedCounterparties}
                  savedCounterpartiesLoading={savedCounterpartiesLoading}
                  directoryCounterparties={eligibleDirectoryCounterparties}
                  expectedCounterpartyKind={expectedCounterpartyKind}
                  customerMode={accountType === 'customer'}
                  onAdvancedTimingChange={setShowAdvancedTiming}
                  onFieldChange={(field, value) => set(field, value)}
                  onTestingPeriodChange={(value) => set('extendedProductTestingDays', value)}
                  onParticipantChange={updateParticipant}
                  onAddParticipant={addParticipant}
                  onSelectCounterparty={selectSavedCounterparty}
                  onDeselectCounterparty={removeSelectedCounterparty}
                  onRemoveParticipant={removeParticipant}
                />
              )}

              {step === 3 && (
                <div className="flex flex-col gap-4">
                  {isGenerating || !agreement ? (
                    <AgreementPreparationState />
                  ) : (
                    <>
                      <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
                        <p className="text-sm font-semibold text-foreground">Check the important details</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Check the amount, delivery terms, and payment-release condition. The other party must also accept before funding begins.
                        </p>
                      </div>
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
                          Need a correction? Edit the agreement or reset it from the details you entered.
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            type="button"
                            variant={editingAgreement ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-md"
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
                            className="rounded-md"
                            onClick={() => {
                              setEditingAgreement(false);
                              void generateAgreement(agreement.version + 1);
                            }}
                          >
                            <RefreshCw size={14} className="mr-1.5" />
                            Reset from details
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
                          I have checked the amount, delivery terms, and release condition. Send this agreement for the other party to accept.
                        </span>
                      </label>
                    </>
                  )}
                </div>
              )}

              {step === 4 && (
                !agreement || isGenerating ? (
                  <AgreementPreparationState />
                ) : (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-foreground">{form.title}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                      {formatMinorAmount(amountMinor, 'NGN')}
                    </p>
                  </div>

                  <dl className="divide-y divide-border rounded-xl border">
                    <ReviewRow label="What you're protecting" value={selectedUseCase?.title ?? 'Not available'} />
                    <ReviewRow label="Deal setup" value={form.dealType ? dealTypeMeta(form.dealType).label : 'Not available'} />
                    <ReviewRow label="Who's involved" value={form.partyMode ? partyModeLabel(form.partyMode) : 'Not available'} />
                    <ReviewRow
                      label="Your role"
                      value={form.role ? `${roleLabel(form.role)} · ${isReleaser ? 'sending funds' : 'receiving funds'}` : 'Not available'}
                    />
                    <ReviewRow
                      label={multiParty ? (isReleaser ? 'Recipients' : 'Payers') : 'Counterparty'}
                      value={form.participants
                        .map((p) => (multiParty && p.allocation ? `${p.name} (${formatMinorAmount(Math.round(Number(p.allocation) * 100), 'NGN')})` : p.name))
                        .join(', ')}
                    />
                    <ReviewRow label="Delivery or completion" value={form.deliveryDueDate || 'Not available'} />
                    <ReviewRow
                      label="Invitation expires"
                      value={form.openUntil ? format(new Date(form.openUntil), 'MMM d, yyyy') : 'Not available'}
                    />
                    {supportsDeliveryReview(form.useCase) && (
                      <ReviewRow
                        label="Product testing"
                        value={
                          form.extendedProductTestingDays
                            ? `${form.extendedProductTestingDays} days · replaces the standard 24-hour funding review`
                            : 'Standard 24-hour funding review'
                        }
                      />
                    )}
                    <ReviewRow
                      label="Agreement"
                      value={`v${agreement.version} · ${agreement.sections.length} clauses · confirmed by you`}
                    />
                  </dl>

                  {form.dealType === 'recurring' && (
                    <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
                      <Repeat size={14} className="mt-0.5 shrink-0 text-primary" />
                      This is a recurring deal: when it completes, a new linked deal is created
                      automatically, carrying this deal's history forward.
                    </div>
                  )}

                  <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
                    <p className="text-sm font-bold text-foreground">What happens next</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Send size={15} />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">1. Share the invitation</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">We copy a secure link for you to send.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileCheck2 size={15} />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">2. They review and accept</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">The agreement stays open until the invitation expires.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Clock3 size={15} />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">3. Funding begins</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">Both parties can follow the deal from the Transaction Room.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs leading-5 text-muted-foreground">
                    Protected funds move through a partner-issued account with a regulated provider. Naitrust does not hold them directly.
                  </p>
                </div>
                )
              )}

              {!livenessOk && (
                <button
                  type="button"
                  onClick={() => setShowLiveness(true)}
                  className="mt-6 flex w-full items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left"
                >
                  <ScanFace size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm leading-5 text-foreground">
                    Complete a quick liveness check to create this Protected Deal.
                    <span className="ml-1 font-semibold text-primary underline">Start check</span>
                  </span>
                </button>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t bg-muted/20 -mx-5 -mb-5 px-5 py-5 sm:-mx-7 sm:-mb-7 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <Button type="button" variant="ghost" onClick={handleBack} disabled={createDeal.isPending}>
                  <ArrowLeft size={16} className="mr-1" />
                  {step === 1 ? 'Cancel' : 'Back'}
                </Button>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={createDeal.isPending} className="rounded-md">
                      <Save size={16} className="mr-1.5" />
                      Save to drafts
                    </Button>
                  )}
                  {step < STEPS.length ? (
                    <Button type="button" onClick={handleNext} disabled={continueDisabled} className="rounded-md">
                      Continue
                      <ArrowRight size={16} className="ml-1" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={requestSubmit} disabled={createDeal.isPending || !livenessOk} className="rounded-md">
                      {createDeal.isPending ? (
                        <>
                          <Loader2 size={16} className="mr-1.5 animate-spin" />
                          Creating…
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} className="mr-1.5" />
                          Create Protected Deal
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
