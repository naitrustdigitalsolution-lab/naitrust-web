import { Building2, Check, ChevronDown, Loader2, Pencil, Plus, Send, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { counterpartyRelationLabel } from '../../../libs/counterparties/counterparty-options';
import type { CounterpartyProfile, CounterpartyRelation, DealWorkflowMode, ExtendedProductTestingDays } from '../../../libs/store/types';
import { formatMinorAmount, parseMajorAmountToMinor } from '../../../libs/utils/safe-deal-presentation';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { SavedCounterpartyPickerDialog } from './SavedCounterpartyPickerDialog';
import { agreementsApi } from '../../../libs/api/agreements.api';
import { useCases } from '../../../libs/use-cases';

export interface DealParticipantForm {
  name: string;
  contact: string;
  allocation: string;
  allocationMode: 'fixed' | 'percentage';
  secondAllocation: string;
  secondAllocationMode: 'fixed' | 'percentage';
  paymentTargets: Array<'first' | 'second'>;
  isManualSaved: boolean;
  profileId?: string;
  relation?: CounterpartyRelation;
}

export interface DealDetailsValues {
  participants: DealParticipantForm[];
  title: string;
  description: string;
  amount: string;
  splitPayment: boolean;
  initialPaymentMode: 'fixed' | 'percentage';
  initialPayment: string;
  nextPaymentReleaseConditions: string;
  deliveryDueDate: string;
  openUntil: string;
  releaseConditions: string;
  extendedProductTestingDays?: ExtendedProductTestingDays;
}

type TextDetailField =
  | 'title'
  | 'description'
  | 'amount'
  | 'initialPayment'
  | 'nextPaymentReleaseConditions'
  | 'deliveryDueDate'
  | 'openUntil'
  | 'releaseConditions';

interface CreateDealDetailsStepProps {
  mobileStage?: 1 | 2 | 3 | 4;
  form: DealDetailsValues & { useCase: string; workflowMode: DealWorkflowMode };
  errors: Record<string, string>;
  isReleaser: boolean;
  canUseSavedContacts: boolean;
  savedCounterparties: CounterpartyProfile[];
  savedCounterpartiesLoading: boolean;
  directoryCounterparties: CounterpartyProfile[];
  customerMode: boolean;
  expectedCounterpartyKind: 'business' | 'individual' | 'any';
  onFieldChange: (field: TextDetailField, value: string) => void;
  onSplitPaymentChange: (split: boolean) => void;
  onInitialPaymentModeChange: (mode: 'fixed' | 'percentage') => void;
  onParticipantChange: (index: number, field: keyof DealParticipantForm, value: string | boolean) => void;
  onAddParticipant: (paymentTarget?: 'first' | 'second') => void;
  onSelectCounterparty: (counterparty: CounterpartyProfile, paymentTarget?: 'first' | 'second' | 'both') => void;
  onDeselectCounterparty: (counterparty: CounterpartyProfile) => void;
  onRemoveParticipant: (index: number) => void;
  onRemoveParticipantFromStage: (index: number, stage: string) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function formatAiDetailTemplate(template: string) {
  const sections = template
    .trim()
    .split(/\.\s+(?=[A-Z])/)
    .map((section) => section.replace(/\.$/, '').trim())
    .filter(Boolean);

  if (sections.length < 2) return template;

  return sections.map((section, index) => {
    const separator = section.indexOf(':');
    if (separator < 0) return `${index + 1}. ${section}`;
    const heading = section.slice(0, separator).trim();
    const detail = section.slice(separator + 1).trim();
    return `${index + 1}. ${heading}\n${detail}`;
  }).join('\n\n');
}

export function CreateDealDetailsStep({
  mobileStage,
  form,
  errors,
  isReleaser,
  canUseSavedContacts,
  savedCounterparties,
  savedCounterpartiesLoading,
  directoryCounterparties,
  customerMode,
  expectedCounterpartyKind,
  onFieldChange,
  onSplitPaymentChange,
  onInitialPaymentModeChange,
  onParticipantChange,
  onAddParticipant,
  onSelectCounterparty,
  onDeselectCounterparty,
  onRemoveParticipant,
  onRemoveParticipantFromStage,
}: CreateDealDetailsStepProps) {
  const [openAllocation, setOpenAllocation] = useState<'first' | 'second' | null>('first');
  const [confirmedAllocations, setConfirmedAllocations] = useState<Set<string>>(() => new Set());
  const [allocationErrors, setAllocationErrors] = useState<Record<string, string>>({});
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [detailSuggestion, setDetailSuggestion] = useState('');
  const [suggestingDetails, setSuggestingDetails] = useState(false);
  const [suggestionRequest, setSuggestionRequest] = useState(0);
  const [detailRequest, setDetailRequest] = useState(0);
  const [refreshingDetail, setRefreshingDetail] = useState(false);
  const [aiDetailError, setAiDetailError] = useState('');
  const [aiDetailSource, setAiDetailSource] = useState('');
  const [showManualRecipient, setShowManualRecipient] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const selectedUseCase = useCases.find((useCase) => useCase.slug === form.useCase);

  useEffect(() => {
    if (!form.useCase || !selectedUseCase) return;
    let active = true;
    setSuggestingDetails(true);
    void agreementsApi.suggestDealDetails({ useCase: form.useCase, useCaseTitle: selectedUseCase.title, requestIndex: suggestionRequest })
      .then((response) => {
        if (!active) return;
        setTitleSuggestions(response.data.titles);
        setDetailSuggestion(response.data.detailDraft);
      })
      .catch(() => {
        if (!active) return;
        setTitleSuggestions([]);
        setDetailSuggestion('');
      })
      .finally(() => active && setSuggestingDetails(false));
    return () => { active = false; };
  }, [form.useCase, selectedUseCase, suggestionRequest]);
  const amountMinor = parseMajorAmountToMinor(form.amount);
  const refreshDescription = async () => {
    if (!selectedUseCase) return;
    setAiDetailError('');
    const sourceDetails = detailRequest > 0 ? aiDetailSource : form.description.trim();
    const nextRequest = detailRequest + 1;
    setRefreshingDetail(true);
    try {
      const response = await agreementsApi.suggestDealDetails({ useCase: form.useCase, useCaseTitle: selectedUseCase.title, currentTitle: form.title, currentDescription: sourceDetails, requestIndex: nextRequest });
      setDetailRequest(nextRequest);
      setAiDetailSource(sourceDetails);
      setDetailSuggestion(response.data.detailDraft);
      onFieldChange('description', formatAiDetailTemplate(response.data.detailDraft));
    } catch {
      // Keep the user's current description when suggestion generation fails.
    } finally {
      setRefreshingDetail(false);
    }
  };
  const initialPaymentMinor = form.initialPaymentMode === 'percentage'
    ? Math.round(amountMinor * Number(form.initialPayment || 0) / 100)
    : parseMajorAmountToMinor(form.initialPayment);
  const remainingPaymentMinor = Math.max(0, amountMinor - initialPaymentMinor);
  const firstPaymentPoolMinor = form.splitPayment ? initialPaymentMinor : amountMinor;
  const hasRecipientIdentity = (participant: DealParticipantForm) => Boolean(participant.name.trim() && participant.contact.trim() && (participant.profileId || participant.isManualSaved));
  const selectedRecipients = form.participants.filter(hasRecipientIdentity);
  const firstStageRecipients = form.participants.filter((participant) => hasRecipientIdentity(participant) && (!form.splitPayment || participant.paymentTargets.includes('first')));
  const secondStageRecipients = form.participants.filter((participant) => hasRecipientIdentity(participant) && participant.paymentTargets.includes('second'));
  const allocatedMinor = firstStageRecipients.length === 1 ? firstPaymentPoolMinor : firstStageRecipients.reduce(
    (sum, participant) => sum + (form.initialPaymentMode === 'percentage'
      ? Math.round(firstPaymentPoolMinor * Number(participant.allocation || 0) / 100)
      : parseMajorAmountToMinor(participant.allocation)),
    0,
  );
  const secondAllocatedMinor = secondStageRecipients.length === 1 ? remainingPaymentMinor : secondStageRecipients.reduce(
    (sum, participant) => sum + (form.initialPaymentMode === 'percentage'
      ? Math.round(remainingPaymentMinor * Number(participant.secondAllocation || 0) / 100)
      : parseMajorAmountToMinor(participant.secondAllocation)), 0);
  const remainderMinor = firstPaymentPoolMinor - allocatedMinor;
  const secondRemainderMinor = remainingPaymentMinor - secondAllocatedMinor;
  const allocationReady = !form.splitPayment || (initialPaymentMinor > 0 && remainingPaymentMinor > 0);
  const recipientSelectionReady = amountMinor > 0 && Boolean(form.deliveryDueDate);
  const participantLabel = isReleaser ? 'Recipient' : 'Payer';
  const pendingManualRecipientIndex = form.participants.findIndex((participant) => !participant.profileId && !participant.isManualSaved);

  return (
    <div className="flex flex-col gap-5 sm:gap-7">
      <section className={mobileStage !== 1 ? 'hidden sm:block' : ''}>
        <div className="mb-4">
          <p className="text-sm font-bold text-foreground">1. Who and what</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Name the deal and add the person or business on the other side.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <Label htmlFor="title">What is this deal for? <span className="text-destructive" aria-hidden="true">*</span></Label>
            <div className="relative mt-1.5">
              <Input id="title" required aria-required="true" className="pr-11" placeholder="e.g. 20 cartons of cooking oil" value={form.title} onChange={(event) => onFieldChange('title', event.target.value)} />
              <button type="button" disabled={suggestingDetails} onClick={() => { if (titleSuggestions.length) { const currentIndex = titleSuggestions.findIndex((suggestion) => suggestion === form.title); onFieldChange('title', titleSuggestions[(currentIndex + 1) % titleSuggestions.length]); } else setSuggestionRequest((current) => current + 1); }} className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10 disabled:opacity-50" aria-label="Generate deal title with AI" title="Generate with AI">
                {suggestingDetails ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              </button>
            </div>
            <FieldError message={errors.title} />
          </div>

          <div className="min-w-0 self-start rounded-xl border sm:mt-[25px]">
            <button type="button" onClick={() => setDetailsOpen((current) => !current)} aria-expanded={detailsOpen} className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left">
              <span><span className="block text-sm font-semibold text-foreground">Add useful details <span className="font-normal text-muted-foreground">(optional)</span></span>{form.description.trim() && !detailsOpen && <span className="mt-0.5 block max-w-xl truncate text-xs text-muted-foreground">Details added</span>}</span>
              <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {detailsOpen && (
            <div className="min-w-0 sm:col-span-2">
              <div className="relative">
                <Textarea id="description" className="h-24 min-h-24 resize-y overflow-y-auto pr-12 text-sm leading-6" placeholder="Quantity, model, colour, size, location, or the exact work agreed." value={form.description} onChange={(event) => { setAiDetailError(''); onFieldChange('description', event.target.value); }} autoFocus />
                <button type="button" disabled={suggestingDetails || refreshingDetail} onClick={() => void refreshDescription()} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10 disabled:opacity-40" aria-label="Generate deal details with AI" title="Generate with AI">{refreshingDetail ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}</button>
              </div>
              <FieldError message={aiDetailError} />
              <FieldError message={errors.description} />
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col sm:border-t sm:pt-6">
        <div className={`relative order-3 min-w-0 max-w-full rounded-2xl border-0 bg-transparent p-0 sm:mt-5 sm:border sm:bg-muted/15 sm:p-5 ${mobileStage !== 3 ? 'hidden sm:block' : ''}`}>
          <div className="mb-5 sm:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Building2 size={20} /></span>
            <h2 className="mt-4 text-lg font-bold tracking-tight">Choose a business</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">This deal requires a business account. Find one on Naitrust or use a saved contact.</p>
          </div>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div className="hidden min-w-0 sm:block">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="text-sm">Payment recipient</Label>
                {expectedCounterpartyKind !== 'any' && (
                  <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-medium">
                    {expectedCounterpartyKind === 'business' ? 'Business accounts only' : 'Individuals only'}
                  </Badge>
                )}
              </div>
              <p className={`mt-1 text-xs ${recipientSelectionReady ? 'text-muted-foreground' : 'font-medium text-amber-700 dark:text-amber-400'}`}>
                {recipientSelectionReady ? 'Choose who will receive this protected payment.' : 'Enter the total amount and expected date first.'}
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
              <SavedCounterpartyPickerDialog counterparties={directoryCounterparties} isLoading={savedCounterpartiesLoading} selectedProfileIds={form.participants.flatMap((participant) => participant.profileId ? [participant.profileId] : [])} selectedIdentifiers={form.participants.flatMap((participant) => [participant.contact, participant.name])} onSelect={onSelectCounterparty} onDeselect={onDeselectCounterparty} customerMode={customerMode} directoryMode showPaymentTarget={form.splitPayment} disabled={!recipientSelectionReady} triggerLabel={firstStageRecipients.length > 0 ? 'Add another' : 'Search Naitrust'} triggerClassName={`h-16 w-full flex-col gap-1.5 rounded-2xl px-2 text-xs sm:h-8 sm:w-auto sm:flex-row sm:justify-center sm:rounded-full sm:px-3 ${canUseSavedContacts ? '' : 'col-span-2'}`} />
              {canUseSavedContacts && (
                <SavedCounterpartyPickerDialog
                  counterparties={savedCounterparties}
                  isLoading={savedCounterpartiesLoading}
                  selectedProfileIds={form.participants.flatMap((participant) => participant.profileId ? [participant.profileId] : [])}
                  selectedIdentifiers={form.participants.flatMap((participant) => [participant.contact, participant.name])}
                  onSelect={onSelectCounterparty}
                  onDeselect={onDeselectCounterparty}
                  customerMode={customerMode}
                  showPaymentTarget={form.splitPayment}
                  disabled={!recipientSelectionReady}
                  triggerLabel={firstStageRecipients.length > 0 ? 'Add saved' : 'Saved contacts'}
                  triggerClassName="h-16 w-full flex-col gap-1.5 rounded-2xl px-2 text-xs sm:h-8 sm:w-auto sm:flex-row sm:justify-center sm:rounded-full sm:px-3"
                />
              )}
              {selectedRecipients.length === 0 && <Button type="button" variant="ghost" size="sm" disabled={!recipientSelectionReady} className="col-span-2 h-10 w-full rounded-xl text-xs sm:h-8 sm:w-auto sm:rounded-full" onClick={() => { if (pendingManualRecipientIndex < 0) onAddParticipant(); setShowManualRecipient(true); }}><Plus size={14} /> Enter recipient manually</Button>}
            </div>
          </div>
          {Object.entries(errors).some(([key, value]) => key.startsWith('participant_') && Boolean(value)) && <p className="mb-3 text-sm text-destructive sm:hidden">Choose a business before continuing.</p>}

          {showManualRecipient && pendingManualRecipientIndex >= 0 && <div className="mb-4 rounded-2xl border bg-background p-4 shadow-sm sm:p-5"><div><p className="text-sm font-semibold">Add recipient manually</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Enter their name and the email address or phone number where they should receive the invitation.</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div><Label htmlFor="manual-recipient-name">Recipient name</Label><Input id="manual-recipient-name" className="mt-1.5 h-11 placeholder:text-xs" value={form.participants[pendingManualRecipientIndex].name} onChange={(event) => onParticipantChange(pendingManualRecipientIndex, 'name', event.target.value)} placeholder="Name or business name" autoFocus /><FieldError message={errors[`participant_${pendingManualRecipientIndex}_name`]} /></div><div><Label htmlFor="manual-recipient-contact">Email or phone number</Label><Input id="manual-recipient-contact" className="mt-1.5 h-11 placeholder:text-xs" value={form.participants[pendingManualRecipientIndex].contact} onChange={(event) => onParticipantChange(pendingManualRecipientIndex, 'contact', event.target.value)} placeholder="Email address or phone number" /><FieldError message={errors[`participant_${pendingManualRecipientIndex}_contact`]} /></div></div><div className="mt-4 flex items-center justify-end gap-2"><Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => { if (form.participants.length > 1 && !form.participants[pendingManualRecipientIndex].name.trim() && !form.participants[pendingManualRecipientIndex].contact.trim()) onRemoveParticipant(pendingManualRecipientIndex); setShowManualRecipient(false); }}>Cancel</Button><Button type="button" size="sm" className="rounded-full" disabled={!form.participants[pendingManualRecipientIndex].name.trim() || !form.participants[pendingManualRecipientIndex].contact.trim()} onClick={() => { onParticipantChange(pendingManualRecipientIndex, 'isManualSaved', true); setShowManualRecipient(false); }}>Add recipient</Button></div></div>}

          <div className="hidden">
            {form.participants.map((participant, index) => (
              <div
                key={index}
                className={`rounded-xl border bg-background p-3.5 ${form.participants.length === 1 ? 'md:col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {participantLabel} {index + 1}
                    </span>
                    {participant.profileId && (
                      <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-normal">
                        {participant.relation ? `Saved ${counterpartyRelationLabel(participant.relation).toLowerCase()}` : 'Saved Naitrust profile'}
                      </Badge>
                    )}
                  </div>
                  {form.participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveParticipant(index)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${participantLabel.toLowerCase()} ${index + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <div className={`mt-2 ${form.participants.length === 1 ? 'grid gap-2 sm:grid-cols-2' : 'space-y-2'}`}>
                  <div>
                    <Input
                      placeholder="Person or business name"
                      value={participant.name}
                      onChange={(event) => onParticipantChange(index, 'name', event.target.value)}
                    />
                    <FieldError message={errors[`participant_${index}_name`]} />
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Naitrust ID, account number, email, or phone"
                      value={participant.contact}
                      onChange={(event) => onParticipantChange(index, 'contact', event.target.value)}
                    />
                    <FieldError message={errors[`participant_${index}_contact`]} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {amountMinor > 0 && selectedRecipients.length > 0 && (
            <div className={`mt-4 min-w-0 max-w-full space-y-3 overflow-hidden transition ${firstStageRecipients.length === 1 ? 'hidden sm:block' : ''} ${allocationReady ? '' : 'pointer-events-none select-none blur-[2px] opacity-45'}`}>
              {([
                { key: 'first', title: form.splitPayment ? 'First payment allocation' : 'Payment allocation', pool: firstPaymentPoolMinor, allocated: allocatedMinor, remaining: remainderMinor, recipientCount: firstStageRecipients.length },
                ...(form.splitPayment ? [{ key: 'second', title: 'Second payment allocation', pool: remainingPaymentMinor, allocated: secondAllocatedMinor, remaining: secondRemainderMinor, recipientCount: secondStageRecipients.length }] : []),
              ] as const).map((stage) => (
                <div key={stage.key} className="min-w-0 max-w-full overflow-hidden rounded-xl border bg-background">
                  <button type="button" onClick={() => setOpenAllocation((current) => current === stage.key ? null : stage.key as 'first' | 'second')} className={`flex w-full items-center gap-3 bg-muted/20 px-4 py-3 text-left transition hover:bg-muted/40 ${openAllocation === stage.key ? 'border-b' : ''}`}>
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{stage.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatMinorAmount(stage.pool, 'NGN')} · {stage.recipientCount} {stage.recipientCount === 1 ? 'recipient' : 'recipients'}</p></div>
                    <span className={`max-w-[42%] shrink-0 truncate rounded-full px-2.5 py-1 text-[11px] font-semibold ${stage.remaining === 0 ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}`}>{stage.remaining === 0 ? 'Ready' : `${formatMinorAmount(Math.abs(stage.remaining), 'NGN')} ${stage.remaining > 0 ? 'to allocate' : 'over'}`}</span>
                    <ChevronDown size={15} className={`shrink-0 text-muted-foreground transition-transform ${openAllocation === stage.key ? 'rotate-180' : ''}`} />
                  </button>
                  {openAllocation === stage.key && <>
                    <div className="divide-y sm:hidden">
                      {form.participants.map((participant, index) => ({ participant, index })).filter(({ participant }) => !form.splitPayment || participant.paymentTargets.includes(stage.key as 'first' | 'second')).map(({ participant, index }) => {
                        const valueField = stage.key === 'first' ? 'allocation' : 'secondAllocation';
                        const value = participant[valueField];
                        return <div key={`mobile-${stage.key}-${index}`} className="p-3.5">
                          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{participant.name || `${participantLabel} ${index + 1}`}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{participant.contact}</p></div><Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive" onClick={() => form.splitPayment ? onRemoveParticipantFromStage(index, stage.key) : onRemoveParticipant(index)} aria-label={`Remove ${participant.name || 'recipient'} from ${stage.title}`}><Trash2 size={14} /></Button></div>
                          <div className="mt-3"><Label htmlFor={`mobile-allocation-${stage.key}-${index}`} className="text-xs">Allocation ({form.initialPaymentMode === 'percentage' ? '%' : 'NGN'})</Label><div className="relative mt-1.5"><Input id={`mobile-allocation-${stage.key}-${index}`} className={`h-11 ${form.initialPaymentMode === 'percentage' ? 'pr-8' : ''}`} type="number" inputMode="decimal" min="0" max={form.initialPaymentMode === 'percentage' ? 100 : undefined} placeholder={form.initialPaymentMode === 'percentage' ? '50' : '0'} value={value} onChange={(event) => onParticipantChange(index, valueField, event.target.value)} />{form.initialPaymentMode === 'percentage' && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">%</span>}</div></div>
                        </div>;
                      })}
                    </div>
                    <div className="hidden max-w-full overflow-x-auto sm:block"><div className="min-w-[680px]">
                    <div className="grid grid-cols-[minmax(0,1fr)_140px_72px] gap-3 border-b bg-muted/10 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><span>Recipient</span><span>Allocation ({form.initialPaymentMode === 'percentage' ? '%' : 'NGN'})</span><span /></div>
                    {form.participants.map((participant, index) => ({ participant, index })).filter(({ participant }) => !form.splitPayment || participant.paymentTargets.includes(stage.key as 'first' | 'second')).map(({ participant, index }) => {
                      const valueField = stage.key === 'first' ? 'allocation' : 'secondAllocation';
                      const mode = form.initialPaymentMode;
                      const value = participant[valueField];
                      const allocationKey = `${stage.key}:${participant.profileId || participant.contact || index}`;
                      const allocationConfirmed = confirmedAllocations.has(allocationKey);
                      const calculatedMinor = stage.recipientCount === 1
                        ? stage.pool
                        : mode === 'percentage'
                          ? Math.round(stage.pool * Number(value || 0) / 100)
                          : parseMajorAmountToMinor(value);
                      const canConfirm = Boolean(participant.name.trim() && participant.contact.trim() && (stage.recipientCount === 1 || Number(value) > 0));
                      return <div key={`${stage.key}-${index}`} className="grid grid-cols-[minmax(0,1fr)_140px_72px] items-center gap-3 border-b px-4 py-3 transition last:border-b-0 hover:bg-muted/15">
                        <div className="min-w-0">
                          {participant.profileId || participant.isManualSaved ? <><p className="truncate text-sm font-semibold">{participant.name || `${participantLabel} ${index + 1}`}</p><p className="truncate text-xs text-muted-foreground">{participant.contact}</p></> : <div className="grid grid-cols-[minmax(140px,1fr)_minmax(210px,1.35fr)] gap-2"><Input className="h-10 min-w-0 text-sm" placeholder="Recipient name" value={participant.name} onChange={(event) => onParticipantChange(index, 'name', event.target.value)} /><Input className="h-10 min-w-0 text-sm" placeholder="Naitrust ID, email, or phone" value={participant.contact} onChange={(event) => onParticipantChange(index, 'contact', event.target.value)} /></div>}
                        </div>
                        {allocationConfirmed || stage.recipientCount === 1 ? <div className="min-w-0">
                          {mode === 'percentage' ? <><p className="text-sm font-semibold">{stage.recipientCount === 1 ? 100 : Number(value || 0)}%</p><p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{formatMinorAmount(calculatedMinor, 'NGN')}</p></> : <p className="text-sm font-semibold">{formatMinorAmount(calculatedMinor, 'NGN')}</p>}
                        </div> : <div className="max-w-[120px]"><div className="relative"><Input className={`h-10 text-sm ${mode === 'percentage' ? 'pr-8' : ''} ${allocationErrors[allocationKey] ? 'border-destructive text-destructive focus-visible:ring-destructive/20' : ''}`} type="number" min="0" max={mode === 'percentage' ? 100 : undefined} placeholder={mode === 'percentage' ? '30' : '0'} value={value} onChange={(event) => {
                          onParticipantChange(index, valueField, event.target.value);
                          const numericValue = Number(event.target.value);
                          setAllocationErrors((current) => {
                            const next = { ...current };
                            if (mode === 'percentage' && event.target.value !== '' && (numericValue < 0 || numericValue > 100)) next[allocationKey] = 'Enter a percentage from 0% to 100%.';
                            else delete next[allocationKey];
                            return next;
                          });
                        }} />{mode === 'percentage' && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">%</span>}</div>{mode === 'percentage' && Number(value) > 0 && <p className="mt-1 text-[11px] font-medium text-muted-foreground">{formatMinorAmount(calculatedMinor, 'NGN')}</p>}</div>}
                        <div className="flex items-center justify-end gap-0.5"><Button type="button" variant="ghost" size="icon" className={`h-9 w-9 rounded-full bg-transparent hover:bg-transparent disabled:text-muted-foreground ${allocationConfirmed ? 'text-primary hover:text-primary' : 'text-emerald-600 hover:text-emerald-700'}`} disabled={!allocationConfirmed && !canConfirm} onClick={() => {
                          if (allocationConfirmed) {
                            setConfirmedAllocations((current) => { const next = new Set(current); next.delete(allocationKey); return next; });
                          } else {
                            if (stage.remaining < 0) {
                              const message = mode === 'percentage'
                                ? `Total allocation is over by ${Number((Math.abs(stage.remaining) / stage.pool * 100).toFixed(2))}%. Reduce it before confirming.`
                                : `Total allocation is over by ${formatMinorAmount(Math.abs(stage.remaining), 'NGN')}. Reduce it before confirming.`;
                              setAllocationErrors((current) => ({ ...current, [allocationKey]: message }));
                              return;
                            }
                            onParticipantChange(index, 'isManualSaved', true);
                            setAllocationErrors((current) => { const next = { ...current }; delete next[allocationKey]; return next; });
                            setConfirmedAllocations((current) => new Set(current).add(allocationKey));
                          }
                        }} aria-label={allocationConfirmed ? 'Edit allocation' : 'Confirm allocation'}>{allocationConfirmed ? <Pencil size={16} /> : <Check size={17} />}</Button><Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-transparent hover:text-destructive" onClick={() => form.splitPayment ? onRemoveParticipantFromStage(index, stage.key) : onRemoveParticipant(index)} aria-label={`Remove ${participant.name || 'recipient'} from ${stage.title}`}><Trash2 size={15} /></Button></div>
                        {allocationErrors[allocationKey] && <p className="col-span-3 -mt-1 text-left text-[11px] font-medium leading-4 text-destructive">{allocationErrors[allocationKey]}</p>}
                      </div>;
                    })}
                  </div></div>
                  <div className="hidden justify-end border-t px-3 py-2 sm:flex"><Button type="button" variant="ghost" size="sm" className="h-8 rounded-full" onClick={() => onAddParticipant(stage.key as 'first' | 'second')}><Plus size={14} />Add recipient</Button></div>
                  </>}
                </div>
              ))}
            </div>
          )}

          {form.splitPayment && amountMinor > 0 && !allocationReady && <div className="pointer-events-none absolute inset-x-5 top-1/2 z-10 -translate-y-1/2 text-center"><span className="inline-flex rounded-full border bg-background px-3 py-1.5 text-xs font-semibold shadow-sm">Enter a valid fixed amount or percentage to allocate payments</span></div>}

          <FieldError message={errors.allocation} />
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-primary/[0.06] p-3 text-xs leading-5 text-muted-foreground"><Send size={15} className="mt-0.5 shrink-0 text-primary" /><p><span className="block font-medium text-foreground">They’ll receive an invitation.</span><span className="block">The deal begins after they review and accept it.</span></p></div>
        </div>

        <div className={`order-1 mb-3 sm:mb-4 ${mobileStage !== 2 ? 'hidden sm:block' : ''}`}>
          <p className="text-sm font-bold text-foreground">2. Money and timing</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Enter the amount and when the order or work is due.</p>
        </div>
        <div className={`order-1 gap-4 sm:grid sm:grid-cols-2 ${mobileStage === 2 ? 'grid' : 'hidden'}`}>
          <div>
            <Label htmlFor="amount">Total amount (NGN)</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              className="mt-1.5"
              placeholder="450000"
              value={form.amount}
              onChange={(event) => {
                const cleaned = event.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
                const [whole = '', ...fractions] = cleaned.split('.');
                onFieldChange('amount', fractions.length ? `${whole}.${fractions.join('').slice(0, 2)}` : whole);
              }}
            />
            {amountMinor > 0 && !errors.amount && (
              <p className="mt-1 text-xs text-muted-foreground">{formatMinorAmount(amountMinor, 'NGN')}</p>
            )}
            <FieldError message={errors.amount} />
          </div>
          <div>
            <Label htmlFor="due">{form.workflowMode === 'delivery' ? 'Delivery date' : form.workflowMode === 'service' ? 'Completion date' : 'Target completion date'}</Label>
            <Input
              id="due"
              type="date"
              className="mt-1.5"
              value={form.deliveryDueDate}
              onChange={(event) => onFieldChange('deliveryDueDate', event.target.value)}
            />
            <FieldError message={errors.deliveryDueDate} />
          </div>
          <div className="sm:col-span-2">
            <Label>Payment plan</Label>
            <div className="mt-1.5 grid grid-cols-2 rounded-xl border bg-muted/30 p-1">
              <button type="button" aria-pressed={!form.splitPayment} onClick={() => onSplitPaymentChange(false)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${!form.splitPayment ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>One-off payment</button>
              <button type="button" aria-pressed={form.splitPayment} onClick={() => onSplitPaymentChange(true)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${form.splitPayment ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Instalments</button>
            </div>
          </div>
          {form.splitPayment && (
            <div className="sm:col-span-2 rounded-xl border bg-muted/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="initial-payment">First payment</Label>
                <div className="flex rounded-lg bg-muted p-0.5 text-[11px] font-semibold">
                  <button type="button" onClick={() => onInitialPaymentModeChange('fixed')} className={`rounded-md px-2 py-1 ${form.initialPaymentMode === 'fixed' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>Amount</button>
                  <button type="button" onClick={() => onInitialPaymentModeChange('percentage')} className={`rounded-md px-2 py-1 ${form.initialPaymentMode === 'percentage' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>Percentage</button>
                </div>
              </div>
              <div className="relative mt-2">
                <Input id="initial-payment" type="number" inputMode="decimal" min="0" max={form.initialPaymentMode === 'percentage' ? 99 : undefined} className="h-10" placeholder={form.initialPaymentMode === 'percentage' ? 'e.g. 40' : 'e.g. 200000'} value={form.initialPayment} onChange={(event) => onFieldChange('initialPayment', event.target.value)} />
                {form.initialPaymentMode === 'percentage' && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">%</span>}
              </div>
              {initialPaymentMinor > 0 && remainingPaymentMinor > 0 && <p className="mt-1.5 text-[11px] text-muted-foreground">First: {formatMinorAmount(initialPaymentMinor, 'NGN')} · Final: {formatMinorAmount(remainingPaymentMinor, 'NGN')}</p>}
              <FieldError message={errors.initialPayment} />
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
