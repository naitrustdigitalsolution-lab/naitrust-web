import { Check, ChevronDown, Clock3, Loader2, Pencil, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { counterpartyRelationLabel } from '../../../libs/counterparties/counterparty-options';
import type { CounterpartyProfile, CounterpartyRelation, ExtendedProductTestingDays } from '../../../libs/store/types';
import { supportsDeliveryReview } from '../../../libs/protected-deals/delivery-review';
import { formatMinorAmount, parseMajorAmountToMinor } from '../../../libs/utils/safe-deal-presentation';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { ProductTestingPeriodField } from './ProductTestingPeriodField';
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
  form: DealDetailsValues & { useCase: string };
  errors: Record<string, string>;
  isReleaser: boolean;
  minOpen: string;
  maxOpen: string;
  maxOpenDays: number;
  showAdvancedTiming: boolean;
  canUseSavedContacts: boolean;
  savedCounterparties: CounterpartyProfile[];
  savedCounterpartiesLoading: boolean;
  directoryCounterparties: CounterpartyProfile[];
  customerMode: boolean;
  expectedCounterpartyKind: 'business' | 'individual' | 'any';
  onAdvancedTimingChange: (open: boolean) => void;
  onFieldChange: (field: TextDetailField, value: string) => void;
  onTestingPeriodChange: (value?: ExtendedProductTestingDays) => void;
  onSplitPaymentChange: (value: boolean) => void;
  onInitialPaymentModeChange: (value: 'fixed' | 'percentage') => void;
  onParticipantChange: (index: number, field: keyof DealParticipantForm, value: string | boolean) => void;
  onAddParticipant: (paymentTarget?: 'first' | 'second') => void;
  onSelectCounterparty: (counterparty: CounterpartyProfile, paymentTarget?: 'first' | 'second' | 'both') => void;
  onDeselectCounterparty: (counterparty: CounterpartyProfile) => void;
  onRemoveParticipant: (index: number) => void;
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
  form,
  errors,
  isReleaser,
  minOpen,
  maxOpen,
  maxOpenDays,
  showAdvancedTiming,
  canUseSavedContacts,
  savedCounterparties,
  savedCounterpartiesLoading,
  directoryCounterparties,
  customerMode,
  expectedCounterpartyKind,
  onAdvancedTimingChange,
  onFieldChange,
  onTestingPeriodChange,
  onSplitPaymentChange,
  onInitialPaymentModeChange,
  onParticipantChange,
  onAddParticipant,
  onSelectCounterparty,
  onDeselectCounterparty,
  onRemoveParticipant,
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
    const normalizedTitle = form.title.trim().toLowerCase();
    const titleIsGeneric = !normalizedTitle || titleSuggestions.some((suggestion) => suggestion.trim().toLowerCase() === normalizedTitle);
    if (!form.description.trim() && titleIsGeneric) {
      setAiDetailError('Add a few rough facts first, such as the exact item or service, quantity, specification, and location, then AI can organise them for you.');
      return;
    }
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
  const splitPercentageError = form.initialPaymentMode === 'percentage' && form.initialPayment !== '' && (Number(form.initialPayment) < 0 || Number(form.initialPayment) > 100)
    ? 'Percentage must be between 0% and 100%.'
    : '';

  return (
    <div className="flex flex-col gap-7">
      <section>
        <div className="mb-4">
          <p className="text-sm font-bold text-foreground">1. Who and what</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Name the deal and add the person or business on the other side.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">What is this deal for?</Label>
            <Input
              id="title"
              className="mt-1.5"
              placeholder="e.g. 20 cartons of cooking oil"
              value={form.title}
              onChange={(event) => onFieldChange('title', event.target.value)}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"><Sparkles size={12} />AI suggestions</span>
              {suggestingDetails ? <Loader2 size={13} className="animate-spin text-muted-foreground" /> : titleSuggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => onFieldChange('title', suggestion)} className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary">{suggestion}</button>
              ))}
              <button type="button" disabled={suggestingDetails} onClick={() => setSuggestionRequest((current) => current + 1)} className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-muted-foreground transition hover:border-primary/30 hover:text-primary disabled:opacity-50" aria-label="Get more AI title suggestions"><RefreshCw size={12} /></button>
            </div>
            <FieldError message={errors.title} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Add useful details (optional)</Label>
            <Textarea
              id="description"
              className="mt-1.5"
              rows={form.description.includes('\n') ? 12 : 3}
              placeholder="Quantity, model, colour, size, or the exact work agreed."
              value={form.description}
              onChange={(event) => {
                setAiDetailError('');
                onFieldChange('description', event.target.value);
              }}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] leading-4 text-muted-foreground">{detailRequest > 0 ? 'AI turned your rough details into a short deal summary. Review and update anything incomplete or inaccurate.' : 'Add rough deal facts and AI can turn them into a concise summary.'}</p>
              <Button type="button" variant="outline" size="sm" className="h-8 rounded-full" disabled={!detailSuggestion || suggestingDetails || refreshingDetail} onClick={() => void refreshDescription()}>{refreshingDetail ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}{form.description.trim() ? 'Get another summary' : 'Get AI summary'}</Button>
            </div>
            <FieldError message={aiDetailError} />
            <FieldError message={errors.description} />
          </div>
        </div>
      </section>

      <section className="flex flex-col border-t pt-6">
        <div className="relative order-3 mt-5 rounded-2xl border bg-muted/15 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
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
            <div className="flex flex-wrap items-center gap-2">
              <SavedCounterpartyPickerDialog counterparties={directoryCounterparties} isLoading={savedCounterpartiesLoading} selectedProfileIds={form.participants.flatMap((participant) => participant.profileId ? [participant.profileId] : [])} selectedIdentifiers={form.participants.flatMap((participant) => [participant.contact, participant.name])} onSelect={onSelectCounterparty} onDeselect={onDeselectCounterparty} customerMode={customerMode} directoryMode showPaymentTarget={form.splitPayment} disabled={!recipientSelectionReady} />
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
                />
              )}
            </div>
          </div>

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

          {amountMinor > 0 && (
            <div className={`mt-4 space-y-3 transition ${allocationReady ? '' : 'pointer-events-none select-none blur-[2px] opacity-45'}`}>
              {([
                { key: 'first', title: form.splitPayment ? 'First payment allocation' : 'Payment allocation', pool: firstPaymentPoolMinor, allocated: allocatedMinor, remaining: remainderMinor, recipientCount: firstStageRecipients.length },
                ...(form.splitPayment ? [{ key: 'second', title: 'Second payment allocation', pool: remainingPaymentMinor, allocated: secondAllocatedMinor, remaining: secondRemainderMinor, recipientCount: secondStageRecipients.length }] : []),
              ] as const).map((stage) => (
                <div key={stage.key} className="overflow-hidden rounded-xl border bg-background">
                  <button type="button" onClick={() => setOpenAllocation((current) => current === stage.key ? null : stage.key as 'first' | 'second')} className={`flex w-full items-center gap-3 bg-muted/20 px-4 py-3 text-left transition hover:bg-muted/40 ${openAllocation === stage.key ? 'border-b' : ''}`}>
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{stage.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatMinorAmount(stage.pool, 'NGN')} · {stage.recipientCount} {stage.recipientCount === 1 ? 'recipient' : 'recipients'}</p></div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${stage.remaining === 0 ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}`}>{stage.remaining === 0 ? 'Ready' : `${formatMinorAmount(Math.abs(stage.remaining), 'NGN')} ${stage.remaining > 0 ? 'to allocate' : 'over'}`}</span>
                    <ChevronDown size={15} className={`shrink-0 text-muted-foreground transition-transform ${openAllocation === stage.key ? 'rotate-180' : ''}`} />
                  </button>
                  {openAllocation === stage.key && <><div className="overflow-x-auto"><div className="min-w-[680px]">
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
                        }} aria-label={allocationConfirmed ? 'Edit allocation' : 'Confirm allocation'}>{allocationConfirmed ? <Pencil size={16} /> : <Check size={17} />}</Button><Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-transparent hover:text-destructive" onClick={() => onRemoveParticipant(index)} aria-label={`Delete ${participant.name || 'recipient'}`}><Trash2 size={15} /></Button></div>
                        {allocationErrors[allocationKey] && <p className="col-span-3 -mt-1 text-left text-[11px] font-medium leading-4 text-destructive">{allocationErrors[allocationKey]}</p>}
                      </div>;
                    })}
                  </div></div>
                  <div className="flex justify-end border-t px-3 py-2"><Button type="button" variant="ghost" size="sm" className="h-8 rounded-full" onClick={() => onAddParticipant(stage.key as 'first' | 'second')}><Plus size={14} />Add recipient</Button></div>
                  </>}
                </div>
              ))}
            </div>
          )}

          {form.splitPayment && amountMinor > 0 && !allocationReady && <div className="pointer-events-none absolute inset-x-5 top-1/2 z-10 -translate-y-1/2 text-center"><span className="inline-flex rounded-full border bg-background px-3 py-1.5 text-xs font-semibold shadow-sm">Enter a valid fixed amount or percentage to allocate payments</span></div>}

          <FieldError message={errors.allocation} />
        </div>

        <div className="order-1 mb-4">
          <p className="text-sm font-bold text-foreground">2. Money and timing</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Enter the amount and when the order or work is due.</p>
        </div>
        <div className="order-1 grid gap-4 sm:grid-cols-2">
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
            <Label htmlFor="due">When should it be delivered or completed?</Label>
            <Input
              id="due"
              type="date"
              className="mt-1.5"
              value={form.deliveryDueDate}
              onChange={(event) => onFieldChange('deliveryDueDate', event.target.value)}
            />
            <FieldError message={errors.deliveryDueDate} />
          </div>
        </div>

        {/* Split-payment setup is intentionally hidden during the pilot.
        <div className="order-2 mt-4 rounded-2xl border bg-muted/15 p-4">
          <p className="text-xs font-semibold text-foreground">Payment release setup</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => onSplitPaymentChange(false)} className={`rounded-xl border p-3 text-left transition-colors ${!form.splitPayment ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'bg-background hover:bg-muted/40'}`}>
              <span className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">Single release</span><Badge variant="success" className="text-[10px]">Recommended</Badge></span>
              <span className="mt-1 block text-xs leading-4 text-muted-foreground">One payment held safely, released once on delivery.</span>
            </button>
            <button type="button" onClick={() => onSplitPaymentChange(true)} className={`rounded-xl border p-3 text-left transition-colors ${form.splitPayment ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'bg-background hover:bg-muted/40'}`}>
              <span className="text-sm font-semibold">Split release</span>
              <span className="mt-1 block text-xs leading-4 text-muted-foreground">Release a first portion, then the remaining payment after the next condition.</span>
            </button>
          </div>

          {form.splitPayment && (
            <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="initial-payment">First payment</Label>
                <div className="mt-1.5 grid grid-cols-[130px_minmax(0,1fr)] gap-2">
                  <Select value={form.initialPaymentMode} onValueChange={(value) => onInitialPaymentModeChange(value as 'fixed' | 'percentage')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed" title="Enter a fixed naira amount">Fixed</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative max-w-[150px]"><Input id="initial-payment" type="number" min="0" max={form.initialPaymentMode === 'percentage' ? 100 : undefined} inputMode="decimal" className={`${form.initialPaymentMode === 'percentage' ? 'pr-8' : ''} ${splitPercentageError ? 'border-destructive text-destructive focus-visible:ring-destructive/20' : ''}`} placeholder={form.initialPaymentMode === 'percentage' ? '30' : '150000'} value={form.initialPayment} onChange={(event) => onFieldChange('initialPayment', event.target.value)} />{form.initialPaymentMode === 'percentage' && <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${splitPercentageError ? 'text-destructive' : 'text-muted-foreground'}`}>%</span>}</div>
                </div>
                {splitPercentageError ? <p className="mt-1 text-xs font-medium text-destructive">{splitPercentageError}</p> : initialPaymentMinor > 0 && !errors.initialPayment && <p className="mt-1 text-xs text-muted-foreground">{form.initialPaymentMode === 'percentage' ? `${form.initialPayment}% = ` : ''}{formatMinorAmount(initialPaymentMinor, 'NGN')}</p>}
                <FieldError message={errors.initialPayment} />
              </div>
              <div className="rounded-xl border bg-background px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">Remaining after first payment</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{formatMinorAmount(remainingPaymentMinor, 'NGN')}</p>
                <p className="mt-1 text-xs text-muted-foreground">Naitrust will track this balance on the deal.</p>
              </div>
            </div>
          )}
        </div>
        */}
      </section>

      <section className="hidden">
        <div className="mb-4">
          <p className="text-sm font-bold text-foreground">3. {form.splitPayment ? 'Payment conditions' : 'When can payment be released?'}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {form.splitPayment ? 'Set what releases the first payment and what must happen before the remaining payment is available.' : 'We suggested a simple condition for this deal. Edit it only if your agreement is different.'}
          </p>
        </div>
        <Label htmlFor="release">{form.splitPayment ? 'First payment release condition' : 'Release condition'}</Label>
        <Textarea
          id="release"
          className="mt-1.5"
          rows={3}
          value={form.releaseConditions}
          onChange={(event) => onFieldChange('releaseConditions', event.target.value)}
        />
        <FieldError message={errors.releaseConditions} />

        {form.splitPayment && (
          <div className="mt-4">
            <Label htmlFor="next-payment-condition">Condition to unlock the next payment</Label>
            <Textarea id="next-payment-condition" className="mt-1.5" rows={3} placeholder="For example: Make the remaining payment available after the first delivery is inspected and accepted." value={form.nextPaymentReleaseConditions} onChange={(event) => onFieldChange('nextPaymentReleaseConditions', event.target.value)} />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">This condition must be completed and confirmed before the remaining balance can be funded.</p>
            <FieldError message={errors.nextPaymentReleaseConditions} />
          </div>
        )}

        {supportsDeliveryReview(form.useCase) && (
          <div className="mt-4">
            <ProductTestingPeriodField value={form.extendedProductTestingDays} onChange={onTestingPeriodChange} />
          </div>
        )}

        <Collapsible open={showAdvancedTiming} onOpenChange={onAdvancedTimingChange} className="mt-4 rounded-2xl border">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock3 size={15} className="text-primary" />
              Invitation timing
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              Expires after 7 days by default
              <ChevronDown size={15} className={`transition-transform ${showAdvancedTiming ? 'rotate-180' : ''}`} />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t px-4 py-4">
            <Label htmlFor="open">Invitation expires</Label>
            <Input
              id="open"
              type="date"
              min={minOpen}
              max={maxOpen}
              className="mt-1.5 max-w-sm"
              value={form.openUntil}
              onChange={(event) => onFieldChange('openUntil', event.target.value)}
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              The other party must accept before this date. You can choose up to {maxOpenDays} days.
            </p>
            <FieldError message={errors.openUntil} />
          </CollapsibleContent>
        </Collapsible>
      </section>
    </div>
  );
}
