/**
 * CreateDealPage
 * Create Safe Deal wizard (`/app/deals/new`), contained but space-filling.
 * A fresh action-specific liveness check gates every deal creation. Steps:
 *  1) Deal setup: use case, party mode, and the creator's role.
 *  2) Deal terms: money, recipients, release condition, and invitation timing.
 *  3) Review agreement and send.
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
  Download,
  Eye,
  FileCheck2,
  Loader2,
  Pencil,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  Save,
  Send,
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
import { PaymentConditionsStep } from '../pieces/transaction/PaymentConditionsStep';
import { VerificationGate } from '../pieces/security/VerificationGate';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { useCreateDeal, useUpdateDeal } from '../../hooks/useTransactions';
import { useCounterparties } from '../../hooks/useCounterparties';
import { useBeneficiaries } from '../../hooks/useBeneficiaries';
import { useBusinessSearch } from '../../hooks/useBusinessDirectory';
import { useSavedBusinesses } from '../../hooks/useSavedBusinesses';
import { useSecurity } from '../../hooks/useSecurity';
import { useAuth } from '../../libs/auth-context';
import { agreementsApi, containsAiDealDetailPlaceholder } from '../../libs/api/agreements.api';
import { bindMockDealIdentityCapture, registerMockDealIdentityCapture } from '../../libs/api/deal-identity-captures.mock';
import { useCases } from '../../libs/use-cases';
import { featuresForUseCase } from '../../libs/features/use-case-features';
import { supportsDeliveryReview } from '../../libs/protected-deals/delivery-review';
import {
  canReplaceWithSuggestedReleaseConditions,
  DEFAULT_INVITATION_EXPIRY_DAYS,
  shortUseCaseLabel,
  splitCreateDealUseCases,
  suggestedReleaseConditions,
} from '../../libs/protected-deals/create-deal-options';
import { accountTypeOf, partyModeOptionsFor } from '../../libs/utils/account';
import { formatMinorAmount, parseMajorAmountToMinor, partyModeLabel, roleLabel } from '../../libs/utils/safe-deal-presentation';
import { clearDealDraft, isDealDraftLivenessFresh, loadDealDraft, saveDealDraft, type DealDraftLiveness } from '../../libs/utils/deal-draft';
import { downloadAgreementDraft } from '../../libs/utils/deal-documents';
import {
  MAX_DEAL_OPEN_DAYS,
  type AgreementDraft,
  type CreateSafeDealInput,
  type CounterpartyProfile,
  type DealRole,
  type DealType,
  type PartyMode,
} from '../../libs/store/types';
import { findMockCreatedDeal } from '../../libs/api/mock-protected-deal-store';
import mockAuthUsers from '../../mocks/apis/auth-users.json';

const STEPS: StepMeta[] = [
  { title: 'Deal setup', description: 'Choose what you are protecting and who is involved.' },
  { title: 'Deal terms', description: 'Enter the money, recipients, timing, and release condition.' },
  { title: 'Review agreement & send', description: 'Check the agreement and invite the other party.' },
];

const CREATE_DEAL_USE_CASES = splitCreateDealUseCases(useCases);

interface FormState extends DealDetailsValues {
  useCase: string;
  dealType: DealType | null;
  partyMode: PartyMode | null;
  role: DealRole | null;
}

const emptyParticipant = (paymentTargets: Array<'first' | 'second'> = ['first', 'second']): DealParticipantForm => ({ name: '', contact: '', allocation: '', allocationMode: 'fixed', secondAllocation: '', secondAllocationMode: 'fixed', paymentTargets, isManualSaved: false });

const INITIAL: FormState = {
  useCase: '',
  dealType: 'single',
  partyMode: null,
  role: null,
  participants: [emptyParticipant()],
  title: '',
  description: '',
  amount: '',
  splitPayment: false,
  initialPaymentMode: 'fixed',
  initialPayment: '',
  nextPaymentReleaseConditions: '',
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
  disabled = false,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Building2;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={
        'group flex flex-1 items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 ' +
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
  const editDealId = searchParams.get('edit') ?? undefined;
  const updateDeal = useUpdateDeal(editDealId);
  const editingDeal = useMemo(() => editDealId ? findMockCreatedDeal(editDealId) : undefined, [editDealId]);
  const security = useSecurity();
  const accountType = accountTypeOf(user);
  const { data: savedCounterparties = [], isLoading: savedCounterpartiesLoading } = useCounterparties(true);
  const { data: beneficiaries = [] } = useBeneficiaries();
  const { data: directoryBusinesses = [] } = useBusinessSearch('');
  const { savedBusinessIds } = useSavedBusinesses();
  const businessContacts = useMemo<CounterpartyProfile[]>(() => directoryBusinesses.filter((business) => business.ownerUserId !== user?.id).map((business) => ({ id: business.id, name: business.name, businessName: business.name, email: business.email, phone: business.phone, notes: business.ntId, avatarInitials: business.name.slice(0, 2).toUpperCase(), relation: 'supplier', identityVerified: business.verified, businessVerified: business.verified, memberSince: business.createdAt, completedDealsCount: business.completedProtectedTransactions ?? 0, hasPriorTransactionWithYou: false, resolvedDisputesCount: 0, ratingAverage: business.ratingAverage, isFavourite: savedBusinessIds.includes(business.id), isBlocked: false })), [directoryBusinesses, savedBusinessIds, user?.id]);
  const beneficiaryContacts = useMemo<CounterpartyProfile[]>(() => beneficiaries.map((beneficiary) => ({ id: beneficiary.id, name: beneficiary.name, businessName: beneficiary.naitrustId?.startsWith('NT-BIZ-') ? beneficiary.name : undefined, email: beneficiary.email, phone: beneficiary.phone, avatarInitials: beneficiary.name.slice(0, 2).toUpperCase(), relation: 'customer', identityVerified: beneficiary.type === 'naitrust_user', businessVerified: beneficiary.naitrustId?.startsWith('NT-BIZ-') ?? false, memberSince: beneficiary.createdAt, completedDealsCount: 0, hasPriorTransactionWithYou: true, resolvedDisputesCount: 0, isFavourite: beneficiary.isFavourite, isBlocked: false, notes: beneficiary.naitrustId ?? beneficiary.naitrustAccountNumber ?? beneficiary.accountNumber })), [beneficiaries]);
  const personalDirectoryContacts = useMemo<CounterpartyProfile[]>(() => mockAuthUsers.users.filter(({ user: account }) => account.role === 'customer' && account.id !== user?.id).map(({ user: account }) => ({ id: account.id, naitrustId: account.naitrustId, name: account.name, email: account.email, phone: account.phone, notes: account.naitrustId, avatarInitials: account.name.slice(0, 2).toUpperCase(), relation: 'customer', identityVerified: account.kycVerified, businessVerified: false, memberSince: new Date().toISOString(), completedDealsCount: 0, hasPriorTransactionWithYou: false, resolvedDisputesCount: 0, isFavourite: false, isBlocked: false })), [user?.id]);
  const customerSavedContacts = useMemo(() => [...businessContacts.filter((business) => savedBusinessIds.includes(business.id)), ...beneficiaryContacts], [beneficiaryContacts, businessContacts, savedBusinessIds]);

  const requestedDraftId = editDealId ? null : searchParams.get('draft');
  const recoveredDraft = useMemo(
    () => loadDealDraft<FormState>(user?.id, requestedDraftId),
    [user?.id, requestedDraftId],
  );
  const draftId = useMemo(() => recoveredDraft?.id ?? crypto.randomUUID(), [recoveredDraft?.id]);
  const recoveredLiveness = recoveredDraft?.actionLiveness;
  const [actionLiveness, setActionLiveness] = useState<DealDraftLiveness | undefined>(() =>
    isDealDraftLivenessFresh(recoveredLiveness) ? recoveredLiveness : undefined,
  );
  const [showLiveness, setShowLiveness] = useState(() => !isDealDraftLivenessFresh(recoveredLiveness));
  const [showPin, setShowPin] = useState(false);
  const [showPinDraftSaved, setShowPinDraftSaved] = useState(false);
  const profileBusinessName = searchParams.get('name')?.trim() ?? '';
  const openedFromTrustProfile = searchParams.get('from') === 'trust-profile' && Boolean(searchParams.get('business'));
  const [showProfileConfirmation, setShowProfileConfirmation] = useState(openedFromTrustProfile);
  const [step, setStep] = useState(() => {
    const legacyStep = recoveredDraft?.step ?? 1;
    if (recoveredDraft?.wizardVersion === 2) return Math.min(Math.max(legacyStep, 1), STEPS.length);
    if (legacyStep <= 1) return 1;
    if (legacyStep <= 3) return 2;
    return 3;
  });
  const [form, setForm] = useState<FormState>(() => {
    if (recoveredDraft?.form) {
      return {
        ...recoveredDraft.form,
        dealType: 'single',
        // Split payments are paused for the pilot. Recovered drafts resume as
        // the supported single-release flow.
        splitPayment: false,
        initialPayment: '',
        nextPaymentReleaseConditions: '',
        openUntil:
          recoveredDraft.form.openUntil ||
          format(addDays(new Date(), DEFAULT_INVITATION_EXPIRY_DAYS), 'yyyy-MM-dd'),
        participants: recoveredDraft.form.participants.map((participant) => ({
          ...participant,
          allocationMode: participant.allocationMode ?? 'fixed',
          secondAllocation: participant.secondAllocation ?? '',
          secondAllocationMode: participant.secondAllocationMode ?? 'fixed',
          paymentTargets: participant.paymentTargets ?? ['first', 'second'],
          isManualSaved: participant.isManualSaved ?? Boolean(participant.profileId),
          contact:
            participant.contact ||
            ((participant as DealParticipantForm & { email?: string }).email ?? ''),
        })),
      };
    }
    if (editingDeal) {
      const input = editingDeal.input;
      const firstPool = input.initialPaymentMinor ?? input.amountMinor;
      const secondPool = input.remainingPaymentMinor ?? 0;
      return {
        useCase: input.useCase,
        dealType: 'single',
        partyMode: input.partyMode,
        role: input.role,
        title: input.title,
        description: input.description,
        amount: String(input.amountMinor / 100),
        splitPayment: false,
        initialPaymentMode: 'fixed',
        initialPayment: '',
        nextPaymentReleaseConditions: '',
        deliveryDueDate: input.deliveryDueDate,
        openUntil: format(addDays(new Date(), input.expiresInDays), 'yyyy-MM-dd'),
        releaseConditions: input.releaseConditions,
        extendedProductTestingDays: input.extendedProductTestingDays,
        participants: input.participants.map((participant) => {
          const stageOne = participant.paymentAllocations?.find((allocation) => allocation.stage === 1)?.amountMinor ?? participant.allocationMinor ?? 0;
          const stageTwo = participant.paymentAllocations?.find((allocation) => allocation.stage === 2)?.amountMinor ?? 0;
          return {
            name: participant.name,
            contact: participant.email ?? participant.phone ?? participant.identifier ?? '',
            profileId: participant.profileId,
            allocation: String(stageOne / 100),
            allocationMode: 'fixed' as const,
            secondAllocation: String(stageTwo / 100),
            secondAllocationMode: 'fixed' as const,
            paymentTargets: ([stageOne > 0 && 'first', stageTwo > 0 && 'second'].filter(Boolean) as Array<'first' | 'second'>).length
              ? [stageOne > 0 && 'first', stageTwo > 0 && 'second'].filter(Boolean) as Array<'first' | 'second'>
              : ['first', 'second'],
            isManualSaved: true,
          };
        }),
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
      participants: [{ name: businessName, contact: businessEmail, allocation: '', allocationMode: 'fixed', secondAllocation: '', secondAllocationMode: 'fixed', paymentTargets: ['first', 'second'], isManualSaved: Boolean(businessId), profileId: businessId }],
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreement, setAgreement] = useState<AgreementDraft | null>(() => editingDeal?.input.agreement ?? null);
  const [agreementConfirmed, setAgreementConfirmed] = useState(Boolean(editingDeal));
  const [editingAgreement, setEditingAgreement] = useState(false);
  const [agreementPreviewOpen, setAgreementPreviewOpen] = useState(false);
  const [dealTermsPreviewOpen, setDealTermsPreviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPaymentConditions, setIsGeneratingPaymentConditions] = useState(false);
  const [paymentConditionsGeneratedByAi, setPaymentConditionsGeneratedByAi] = useState(false);
  const [paymentConditionsRequest, setPaymentConditionsRequest] = useState(0);
  const [showAllUseCases, setShowAllUseCases] = useState(() =>
    CREATE_DEAL_USE_CASES.more.some((useCase) => useCase.slug === recoveredDraft?.form?.useCase),
  );
  const [showAdvancedTiming, setShowAdvancedTiming] = useState(true);
  const [createdInvitation, setCreatedInvitation] = useState<{ dealId: string; title: string; url: string } | null>(null);

  useEffect(() => {
    if (editingDeal) toast.info('Editing this deal. Saving will update the existing invitation.');
    else if (recoveredDraft) toast.info('Deal draft opened.');
    // Only announce the recovery once when the wizard mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hasContent =
      !!form.useCase || !!form.title.trim() || !!form.description.trim() || !!form.amount ||
      form.participants.some((participant) => !!participant.name.trim() || !!participant.contact.trim());
    if (!hasContent) return;
    const timer = window.setTimeout(() => saveDealDraft(user?.id, draftId, form, step, actionLiveness, 2), 400);
    return () => window.clearTimeout(timer);
  }, [actionLiveness, draftId, form, step, user?.id]);

  useEffect(() => {
    if (!actionLiveness) return;
    const expiresAt = Date.parse(actionLiveness.verifiedAt) + 24 * 60 * 60 * 1000;
    const expire = () => {
      if (Date.now() < expiresAt) return;
      setActionLiveness(undefined);
      setShowLiveness(true);
      toast.info('Your liveness check for this deal expired. Take a new check to continue this draft.');
    };
    const timer = window.setTimeout(expire, Math.max(0, expiresAt - Date.now()));
    window.addEventListener('focus', expire);
    document.addEventListener('visibilitychange', expire);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', expire);
      document.removeEventListener('visibilitychange', expire);
    };
  }, [actionLiveness]);

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
    setForm((prev) => ({
      ...prev,
      useCase: slug,
      dealType: 'single',
      releaseConditions: canReplaceWithSuggestedReleaseConditions(prev.releaseConditions)
        ? suggestedReleaseConditions(slug)
        : prev.releaseConditions,
      extendedProductTestingDays: supportsDeliveryReview(slug)
        ? prev.extendedProductTestingDays
        : undefined,
    }));
    setErrors((prev) => ({ ...prev, useCase: '', dealType: '' }));
    invalidateAgreement();
  };

  const updateParticipant = (index: number, key: keyof DealParticipantForm, value: string | boolean) => {
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

  const addParticipant = (paymentTarget?: 'first' | 'second') => {
    setForm((prev) => ({ ...prev, participants: [...prev.participants, emptyParticipant(paymentTarget ? [paymentTarget] : ['first', 'second'])] }));
    invalidateAgreement();
  };

  const selectSavedCounterparty = (counterparty: CounterpartyProfile, paymentTarget: 'first' | 'second' | 'both' = 'both') => {
    const contact = counterparty.email ?? counterparty.phone ?? counterparty.notes;
    if (!contact) {
      toast.error('Add an email or phone number to this saved contact before inviting them.');
      return;
    }

    const participant: DealParticipantForm = {
      name: counterparty.businessName ?? counterparty.name,
      contact,
      allocation: '',
      allocationMode: 'fixed',
      secondAllocation: '',
      secondAllocationMode: 'fixed',
      paymentTargets: paymentTarget === 'both' ? ['first', 'second'] : [paymentTarget],
      isManualSaved: true,
      profileId: counterparty.id,
      relation: counterparty.relation,
    };

    setForm((current) => {
      const existingIndex = current.participants.findIndex((item) => item.profileId === counterparty.id);
      if (existingIndex >= 0) {
        const targets = paymentTarget === 'both' ? ['first', 'second'] as const : [paymentTarget];
        return { ...current, participants: current.participants.map((item, index) => index === existingIndex ? { ...item, paymentTargets: Array.from(new Set([...item.paymentTargets, ...targets])) } : item) };
      }
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
    setForm((prev) => {
      const remaining = prev.participants.filter((_, i) => i !== index);
      return { ...prev, participants: remaining.length > 0 ? remaining : [emptyParticipant()] };
    });
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
  const amountMinor = parseMajorAmountToMinor(form.amount);
  const initialPaymentMinor = form.splitPayment
    ? form.initialPaymentMode === 'percentage'
      ? Math.round(amountMinor * Number(form.initialPayment || 0) / 100)
      : parseMajorAmountToMinor(form.initialPayment)
    : amountMinor;
  const remainingPaymentMinor = form.splitPayment ? Math.max(0, amountMinor - initialPaymentMinor) : 0;
  const firstPaymentPoolMinor = form.splitPayment ? initialPaymentMinor : amountMinor;
  const isReleaser = form.role === 'buyer';
  const expectedCounterpartyKind = form.partyMode === 'b2b' ? 'business' : form.partyMode === 'p2p' ? 'individual' : form.partyMode === 'b2c' ? (accountType === 'customer' ? 'business' : 'individual') : 'any';
  const matchesExpectedKind = (contact: CounterpartyProfile) => expectedCounterpartyKind === 'any' || (expectedCounterpartyKind === 'business' ? Boolean(contact.businessName) : !contact.businessName);
  const eligibleSavedCounterparties = (accountType === 'customer' ? customerSavedContacts : savedCounterparties).filter(matchesExpectedKind);
  const eligibleDirectoryCounterparties = [...businessContacts, ...personalDirectoryContacts].filter(matchesExpectedKind);
  const multiParty = form.participants.length > 1;
  const firstStageParticipants = form.participants.filter((participant) => participant.name.trim() && participant.contact.trim() && (participant.profileId || participant.isManualSaved) && (!form.splitPayment || participant.paymentTargets.includes('first')));
  const secondStageParticipants = form.participants.filter((participant) => participant.name.trim() && participant.contact.trim() && (participant.profileId || participant.isManualSaved) && participant.paymentTargets.includes('second'));
  const myName = user?.name || 'You';

  const allocatedMinor = useMemo(
    () => firstStageParticipants.length === 1 ? firstPaymentPoolMinor : firstStageParticipants.reduce((sum, p) => sum + (form.initialPaymentMode === 'percentage'
      ? Math.round(firstPaymentPoolMinor * Number(p.allocation || 0) / 100)
      : parseMajorAmountToMinor(p.allocation)), 0),
    [firstPaymentPoolMinor, firstStageParticipants, form.initialPaymentMode],
  );
  const secondAllocatedMinor = useMemo(() => secondStageParticipants.length === 1 ? remainingPaymentMinor : secondStageParticipants.reduce((sum, participant) => sum + (form.initialPaymentMode === 'percentage' ? Math.round(remainingPaymentMinor * Number(participant.secondAllocation || 0) / 100) : parseMajorAmountToMinor(participant.secondAllocation)), 0), [form.initialPaymentMode, remainingPaymentMinor, secondStageParticipants]);

  const generatePaymentConditions = async () => {
    if (!form.title.trim() || !form.deliveryDueDate) {
      toast.error('Add the deal title and delivery date before generating payment conditions.');
      return;
    }
    setIsGeneratingPaymentConditions(true);
    try {
      const nextRequest = paymentConditionsGeneratedByAi ? paymentConditionsRequest + 1 : paymentConditionsRequest;
      const response = await agreementsApi.draftPaymentConditions({
        useCaseTitle: selectedUseCase?.title ?? 'Protected Deal',
        title: form.title,
        description: form.description,
        deliveryDueDate: form.deliveryDueDate,
        buyerName,
        sellerName,
        requestIndex: nextRequest,
      });
      setForm((current) => ({ ...current, releaseConditions: response.data.text }));
      setPaymentConditionsRequest(nextRequest);
      setPaymentConditionsGeneratedByAi(true);
      setAgreement(null);
      setAgreementConfirmed(false);
    } catch {
      toast.error('Could not generate payment conditions. You can still write or edit them yourself.');
    } finally {
      setIsGeneratingPaymentConditions(false);
    }
  };

  const today = useMemo(() => new Date(), []);
  const minOpen = format(addDays(today, 1), 'yyyy-MM-dd');
  const maxOpen = format(addDays(today, MAX_DEAL_OPEN_DAYS), 'yyyy-MM-dd');

  const ownedBusinessIds = new Set(directoryBusinesses.filter((business) => business.ownerUserId === user?.id).map((business) => business.id));
  const ownedBusinessNames = new Set(directoryBusinesses.filter((business) => business.ownerUserId === user?.id).map((business) => business.name.trim().toLowerCase()));
  const participantNames = form.participants
    .filter((participant) => participant.profileId !== user?.id)
    .filter((participant) => !participant.profileId || !ownedBusinessIds.has(participant.profileId))
    .map((participant) => participant.name.trim())
    .filter((name) => Boolean(name) && !ownedBusinessNames.has(name.toLowerCase()))
    .filter((name, index, names) => names.indexOf(name) === index);
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
          initialPaymentMinor,
          nextPaymentReleaseConditions: form.splitPayment ? form.nextPaymentReleaseConditions : undefined,
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
      if (!form.partyMode) next.partyMode = 'Choose the parties.';
      if (!form.role) next.role = 'Select your role.';
    }
    if (step === 2) {
      if (!form.title.trim()) next.title = 'Give the deal a short title.';
      if (containsAiDealDetailPlaceholder(form.description))
        next.description = 'Clear the AI template, or replace each remaining AI placeholder with your deal details before continuing.';
      const amount = Number(form.amount);
      if (!form.amount || Number.isNaN(amount) || amount <= 0)
        next.amount = 'Enter an amount greater than zero.';
      if (form.splitPayment) {
        const firstPayment = Number(form.initialPayment);
        if (!form.initialPayment || Number.isNaN(firstPayment) || firstPayment <= 0)
          next.initialPayment = 'Enter the amount to send first.';
        else if (form.initialPaymentMode === 'percentage' && firstPayment >= 100)
          next.initialPayment = 'Enter a percentage below 100.';
        else if (form.initialPaymentMode === 'fixed' && firstPayment >= amount)
          next.initialPayment = 'The first payment must be less than the total deal amount.';
      }
      if (!form.deliveryDueDate) next.deliveryDueDate = 'Set the next milestone or completion date.';
      form.participants.forEach((participant, index) => {
        if (!participant.name.trim()) next[`participant_${index}_name`] = 'Enter a name.';
        if (!isValidContact(participant.contact)) next[`participant_${index}_contact`] = 'Enter a valid Naitrust ID, account number, email, or phone.';
      });
      if (firstPaymentPoolMinor > 0 && allocatedMinor !== firstPaymentPoolMinor)
        next.allocation = `First payment allocations must add up to ${formatMinorAmount(firstPaymentPoolMinor, 'NGN')}.`;
      else if (form.splitPayment && secondAllocatedMinor !== remainingPaymentMinor)
        next.allocation = `Second payment allocations must add up to ${formatMinorAmount(remainingPaymentMinor, 'NGN')}.`;
      if (!form.openUntil) {
        next.openUntil = 'Set how long the deal stays open.';
      } else {
        const days = differenceInCalendarDays(new Date(form.openUntil), today);
        if (days < 1) next.openUntil = 'Pick a future date.';
        else if (days > MAX_DEAL_OPEN_DAYS) next.openUntil = `At most ${MAX_DEAL_OPEN_DAYS} days.`;
      }
      if (!form.releaseConditions.trim())
        next.releaseConditions = 'Describe what must happen before funds release.';
      if (form.splitPayment && !form.nextPaymentReleaseConditions.trim())
        next.nextPaymentReleaseConditions = 'Describe what must be completed before the next payment.';
    }
    setErrors(next);
    if (next.openUntil) setShowAdvancedTiming(true);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
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
    saveDealDraft(user?.id, draftId, form, step, actionLiveness, 2);
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
    if (!agreement || !actionLiveness || !isDealDraftLivenessFresh(actionLiveness) || !user?.id) {
      setActionLiveness(undefined);
      setShowLiveness(true);
      toast.error('Take a fresh liveness check for this deal before creating it.');
      return;
    }
    try {
      const expiresInDays = Math.min(
        MAX_DEAL_OPEN_DAYS,
        Math.max(1, differenceInCalendarDays(new Date(form.openUntil), today)),
      );
      const dealInput: CreateSafeDealInput = {
        useCase: form.useCase,
        dealType: 'single',
        partyMode: form.partyMode!,
        role: form.role!,
        participants: form.participants.map((p) => ({
          name: p.name.trim(),
          ...participantContact(p.contact),
          profileId: p.profileId,
          allocationMinor: (p.paymentTargets.includes('first') ? (firstStageParticipants.length === 1 ? firstPaymentPoolMinor : form.initialPaymentMode === 'percentage' ? Math.round(firstPaymentPoolMinor * Number(p.allocation || 0) / 100) : parseMajorAmountToMinor(p.allocation)) : 0)
            + (form.splitPayment && p.paymentTargets.includes('second') ? (secondStageParticipants.length === 1 ? remainingPaymentMinor : form.initialPaymentMode === 'percentage' ? Math.round(remainingPaymentMinor * Number(p.secondAllocation || 0) / 100) : parseMajorAmountToMinor(p.secondAllocation)) : 0),
          paymentAllocations: form.splitPayment ? [
            { stage: 1 as const, amountMinor: p.paymentTargets.includes('first') ? (firstStageParticipants.length === 1 ? firstPaymentPoolMinor : form.initialPaymentMode === 'percentage' ? Math.round(firstPaymentPoolMinor * Number(p.allocation || 0) / 100) : parseMajorAmountToMinor(p.allocation)) : 0 },
            { stage: 2 as const, amountMinor: p.paymentTargets.includes('second') ? (secondStageParticipants.length === 1 ? remainingPaymentMinor : form.initialPaymentMode === 'percentage' ? Math.round(remainingPaymentMinor * Number(p.secondAllocation || 0) / 100) : parseMajorAmountToMinor(p.secondAllocation)) : 0 },
          ] : undefined,
        })),
        title: form.title.trim(),
        description: form.description.trim(),
        amountMinor,
        initialPaymentMinor,
        initialPaymentMode: form.splitPayment ? form.initialPaymentMode : undefined,
        initialPaymentPercentage: form.splitPayment && form.initialPaymentMode === 'percentage' ? Number(form.initialPayment) : undefined,
        remainingPaymentMinor,
        nextPaymentReleaseConditions: form.splitPayment ? form.nextPaymentReleaseConditions.trim() : undefined,
        currency: 'NGN',
        deliveryDueDate: form.deliveryDueDate,
        releaseConditions: form.releaseConditions.trim(),
        extendedProductTestingDays: undefined,
        expiresInDays,
        agreement,
        actionLiveness: { actorUserId: user.id, verifiedAt: actionLiveness.verifiedAt, captureId: actionLiveness.captureId },
      };
      if (editDealId) {
        await updateDeal.mutateAsync(dealInput);
        clearDealDraft(user?.id, draftId);
        toast.success('Deal updated. The revised invitation was sent for review.');
        navigate(`/app/deals/${editDealId}`, { replace: true });
        return;
      }
      const created = await createDeal.mutateAsync(dealInput);
      bindMockDealIdentityCapture(actionLiveness.captureId, created.data.id);
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

  const submittingDeal = createDeal.isPending || updateDeal.isPending;
  const continueDisabled =
    submittingDeal || !isDealDraftLivenessFresh(actionLiveness);

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
    <DashboardLayout title={editDealId ? "Edit Protected Deal" : "New Protected Deal"}>
      <LivenessCheckModal
        open={showLiveness && !showProfileConfirmation}
        onOpenChange={setShowLiveness}
        onVerified={(capture) => {
          if (user?.id) registerMockDealIdentityCapture({
            captureId: capture.captureId,
            scopeId: draftId,
            subjectUserId: user.id,
            representativeName: user.name ?? 'Deal representative',
            action: 'deal_created',
            capturedAt: capture.capturedAt,
            photoDataUrl: capture.photoDataUrl,
          });
          setActionLiveness({ captureId: capture.captureId, verifiedAt: capture.capturedAt, photoDataUrl: capture.photoDataUrl });
          setShowLiveness(false);
        }}
        reason="This live photo will be linked only to this Protected Deal. The other verified participant can view it to confirm who actively created the deal."
        shareNotice="I understand that the other verified participant can view this live photo for the deal."
        footerText="Continuing confirms this photo for the deal may be viewed by the other verified participant. It remains valid for this draft for 24 hours."
      />
      <Dialog
        open={showProfileConfirmation}
        onOpenChange={(open) => {
          if (!open && showProfileConfirmation) navigate(-1);
        }}
      >
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={(event) => event.preventDefault()} onPointerDownOutside={(event) => event.preventDefault()}>
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>
            <DialogTitle>Start a Protected Deal?</DialogTitle>
            <DialogDescription className="leading-6">
              You are about to start a Protected Deal with <strong className="font-semibold text-foreground">{profileBusinessName || 'this business'}</strong>. Their verified profile has been added as the other party.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="button" onClick={() => setShowProfileConfirmation(false)}><ShieldCheck size={15} /> Start transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PinPromptModal
        open={showPin}
        onOpenChange={setShowPin}
        onVerified={doSubmit}
        title="Confirm with your PIN"
        description={`Enter your 4-digit transaction PIN to ${editDealId ? 'update this invitation' : 'create this Protected Deal'}.`}
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
          eyebrow={editDealId ? "Editing existing invitation" : "Protected Deals"}
          title={editDealId ? "Edit Protected Deal" : "Create a Protected Deal"}
          description={editDealId ? "Update the original deal details. The same invitation will be returned to the other party for review." : "Turn an agreement into a clear, trackable payment journey for everyone involved."}
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
                <span className="text-white/80">Funds move through an account issued by a regulated payment partner. Naitrust never holds them directly.</span>
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
                        : [...CREATE_DEAL_USE_CASES.quick]
                      ).sort((left, right) => Number(left.slug === 'custom-business-deal') - Number(right.slug === 'custom-business-deal')).map((useCase) => {
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
                <div className="flex flex-col gap-6">
                  <CreateDealDetailsStep
                  form={form}
                  errors={errors}
                  isReleaser={isReleaser}
                  canUseSavedContacts
                  savedCounterparties={eligibleSavedCounterparties}
                  savedCounterpartiesLoading={savedCounterpartiesLoading}
                  directoryCounterparties={eligibleDirectoryCounterparties}
                  expectedCounterpartyKind={expectedCounterpartyKind}
                  customerMode={accountType === 'customer'}
                  onFieldChange={(field, value) => set(field, value)}
                  onParticipantChange={updateParticipant}
                  onAddParticipant={addParticipant}
                  onSelectCounterparty={selectSavedCounterparty}
                  onDeselectCounterparty={removeSelectedCounterparty}
                  onRemoveParticipant={removeParticipant}
                  />
                  <PaymentConditionsStep splitPayment={form.splitPayment} useCase={form.useCase} releaseConditions={form.releaseConditions} nextPaymentReleaseConditions={form.nextPaymentReleaseConditions} extendedProductTestingDays={form.extendedProductTestingDays} openUntil={form.openUntil} minOpen={minOpen} maxOpen={maxOpen} maxOpenDays={MAX_DEAL_OPEN_DAYS} showAdvancedTiming={showAdvancedTiming} errors={errors} generatedByAi={paymentConditionsGeneratedByAi} generating={isGeneratingPaymentConditions} onGenerate={() => void generatePaymentConditions()} onFieldChange={(field, value) => set(field, value)} onTestingPeriodChange={(value) => set('extendedProductTestingDays', value)} onAdvancedTimingChange={setShowAdvancedTiming} />
                </div>
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
                          This agreement was generated by AI from your deal details. Read and edit it to make sure it meets your expectations. The other party must review and accept it before funding begins.
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

              {step === 3 && (
                !agreement || isGenerating ? (
                  null
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
                    <ReviewRow label="Payment release" value="Single release" />
                    <ReviewRow label="Who's involved" value={form.partyMode ? partyModeLabel(form.partyMode) : 'Not available'} />
                    <ReviewRow
                      label="Your role"
                      value={form.role ? `${roleLabel(form.role)} · ${isReleaser ? 'sending funds' : 'receiving funds'}` : 'Not available'}
                    />
                    <ReviewRow
                      label={multiParty ? (isReleaser ? 'Recipients' : 'Payers') : 'Other party'}
                      value={form.participants
                        .map((p) => (multiParty && p.allocation ? `${p.name} (${p.allocationMode === 'percentage' ? `${p.allocation}% = ` : ''}${formatMinorAmount(p.allocationMode === 'percentage' ? Math.round(amountMinor * Number(p.allocation) / 100) : parseMajorAmountToMinor(p.allocation), 'NGN')})` : p.name))
                        .join(', ')}
                    />
                    <ReviewRow label="Delivery or completion" value={form.deliveryDueDate || 'Not available'} />
                    {form.description.trim() && <ReviewRow label="Deal description" value={form.description} />}
                    <div className="flex items-center gap-4 px-4 py-3">
                      <dt className="w-40 shrink-0 text-sm text-muted-foreground">Payment release condition</dt>
                      <dd className="flex min-w-0 flex-1 items-center justify-between gap-3 text-sm font-medium text-foreground">
                        <span className="line-clamp-2">{form.releaseConditions || 'Not available'}</span>
                        <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 rounded-full text-primary" onClick={() => setDealTermsPreviewOpen(true)}><Eye size={14} />Preview</Button>
                      </dd>
                    </div>
                    {form.splitPayment && (
                      <>
                        <ReviewRow label="First payment" value={`${formatMinorAmount(initialPaymentMinor, 'NGN')}${form.initialPaymentMode === 'percentage' ? ` (${form.initialPayment}% of total)` : ''}`} />
                        <ReviewRow label="Remaining payment" value={formatMinorAmount(remainingPaymentMinor, 'NGN')} />
                        <ReviewRow label="Condition for next payment" value={form.nextPaymentReleaseConditions} />
                      </>
                    )}
                    <ReviewRow
                      label="Invitation expires"
                      value={form.openUntil ? format(new Date(form.openUntil), 'MMM d, yyyy') : 'Not available'}
                    />
                    {supportsDeliveryReview(form.useCase) && <ReviewRow label="Payment review" value="1 hour after the handover check" />}
                    <div className="flex items-center gap-4 px-4 py-3">
                      <dt className="w-40 shrink-0 text-sm text-muted-foreground">Agreement</dt>
                      <dd className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 text-sm font-medium text-foreground">
                        <span>{`v${agreement.version} · ${agreement.sections.length} clauses · ${agreementConfirmed ? 'confirmed by you' : 'awaiting your confirmation'}`}</span>
                        <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full text-primary" onClick={() => setAgreementPreviewOpen(true)}><Eye size={14} />Preview agreement</Button>
                      </dd>
                    </div>
                  </dl>

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
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">Both parties can follow the deal from the Deal Room.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs leading-5 text-muted-foreground">
                    Money placed in a Protected Deal moves through an account issued by a regulated payment partner. Naitrust does not hold it directly.
                  </p>
                </div>
                )
              )}

              {!isDealDraftLivenessFresh(actionLiveness) && (
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
                <Button type="button" variant="ghost" onClick={handleBack} disabled={submittingDeal}>
                  <ArrowLeft size={16} className="mr-1" />
                  {step === 1 ? 'Cancel' : 'Back'}
                </Button>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {step > 1 && !editDealId && (
                    <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={submittingDeal} className="rounded-md">
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
                    <Button type="button" onClick={requestSubmit} disabled={submittingDeal || isGenerating || !agreement || !agreementConfirmed || !isDealDraftLivenessFresh(actionLiveness)} className="rounded-md">
                      {submittingDeal ? (
                        <>
                          <Loader2 size={16} className="mr-1.5 animate-spin" />
                          {editDealId ? 'Updating…' : 'Creating…'}
                        </>
                      ) : (
                        <>
                          {editDealId ? <Pencil size={16} className="mr-1.5" /> : <ShieldCheck size={16} className="mr-1.5" />}
                          {editDealId ? 'Update invitation' : 'Create Protected Deal'}
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
      <Sheet open={agreementPreviewOpen} onOpenChange={setAgreementPreviewOpen}>
        <SheetContent className="w-[96vw] gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl">
          <SheetHeader className="border-b px-5 pb-4 pt-5 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
              <div><SheetTitle>Agreement preview</SheetTitle><SheetDescription className="mt-1">Review the complete agreement before creating this deal.</SheetDescription></div>
              {agreement && <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => toast.promise(downloadAgreementDraft({ agreement, title: form.title, amountMinor, currency: 'NGN' }), { loading: 'Preparing agreement PDF...', success: 'Agreement downloaded.', error: 'Could not download the agreement.' })}><Download size={14} />Download agreement</Button>}
            </div>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {agreement && <AgreementDocument agreement={agreement} hideAiNote />}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={dealTermsPreviewOpen} onOpenChange={setDealTermsPreviewOpen}>
        <SheetContent className="w-[96vw] gap-0 overflow-hidden p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-5 pb-4 pt-5 sm:px-6">
            <SheetTitle>Deal description and payment conditions</SheetTitle>
            <SheetDescription>Review the deal summary and the condition that controls payment release.</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {form.description.trim() && <section><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deal description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{form.description}</p></section>}
            <section><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment release condition</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{form.releaseConditions || 'Not provided'}</p></section>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
