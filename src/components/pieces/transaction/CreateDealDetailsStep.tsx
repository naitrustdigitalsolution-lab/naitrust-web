import { ChevronDown, Clock3, Plus, Trash2 } from 'lucide-react';
import type { ExtendedProductTestingDays } from '../../../libs/store/types';
import { supportsDeliveryReview } from '../../../libs/protected-deals/delivery-review';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import { Button } from '../../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { ProductTestingPeriodField } from './ProductTestingPeriodField';

export interface DealParticipantForm {
  name: string;
  contact: string;
  allocation: string;
  profileId?: string;
}

export interface DealDetailsValues {
  participants: DealParticipantForm[];
  title: string;
  description: string;
  amount: string;
  deliveryDueDate: string;
  openUntil: string;
  releaseConditions: string;
  extendedProductTestingDays?: ExtendedProductTestingDays;
}

type TextDetailField =
  | 'title'
  | 'description'
  | 'amount'
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
  onAdvancedTimingChange: (open: boolean) => void;
  onFieldChange: (field: TextDetailField, value: string) => void;
  onTestingPeriodChange: (value?: ExtendedProductTestingDays) => void;
  onParticipantChange: (index: number, field: keyof DealParticipantForm, value: string) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (index: number) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function CreateDealDetailsStep({
  form,
  errors,
  isReleaser,
  minOpen,
  maxOpen,
  maxOpenDays,
  showAdvancedTiming,
  onAdvancedTimingChange,
  onFieldChange,
  onTestingPeriodChange,
  onParticipantChange,
  onAddParticipant,
  onRemoveParticipant,
}: CreateDealDetailsStepProps) {
  const amountMinor = Math.round(Number(form.amount || 0) * 100);
  const multiParty = form.participants.length > 1;
  const allocatedMinor = form.participants.reduce(
    (sum, participant) => sum + Math.round(Number(participant.allocation || 0) * 100),
    0,
  );
  const remainderMinor = amountMinor - allocatedMinor;
  const partiesHeading = isReleaser ? 'Who are you paying?' : 'Who is paying you?';
  const participantLabel = isReleaser ? 'Recipient' : 'Payer';
  const perPartyLabel = isReleaser ? 'Amount they receive (NGN)' : 'Amount they pay (NGN)';

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
            <FieldError message={errors.title} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Add useful details (optional)</Label>
            <Textarea
              id="description"
              className="mt-1.5"
              rows={2}
              placeholder="Quantity, model, colour, size, or the exact work agreed."
              value={form.description}
              onChange={(event) => onFieldChange('description', event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border bg-muted/15 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <Label className="text-sm">{partiesHeading}</Label>
              <p className="mt-1 text-xs text-muted-foreground">We will send the deal invitation to this contact.</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                They can receive it by email, SMS, or WhatsApp and join this deal on Naitrust.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" className="h-8 rounded-md" onClick={onAddParticipant}>
              <Plus size={14} className="mr-1" />
              Add another
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {form.participants.map((participant, index) => (
              <div
                key={index}
                className={`rounded-xl border bg-background p-3.5 ${form.participants.length === 1 ? 'md:col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {participantLabel} {index + 1}
                  </span>
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
                      placeholder="Email or phone number"
                      value={participant.contact}
                      onChange={(event) => onParticipantChange(index, 'contact', event.target.value)}
                    />
                    <FieldError message={errors[`participant_${index}_contact`]} />
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
                        value={participant.allocation}
                        onChange={(event) => onParticipantChange(index, 'allocation', event.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {multiParty && amountMinor > 0 && (
            <p className={`mt-2 text-xs ${remainderMinor === 0 ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'}`}>
              {isReleaser ? 'Allocated' : 'Assigned'} {formatMinorAmount(allocatedMinor, 'NGN')} of{' '}
              {formatMinorAmount(amountMinor, 'NGN')}
              {remainderMinor !== 0 &&
                ` · ${formatMinorAmount(Math.abs(remainderMinor), 'NGN')} ${remainderMinor > 0 ? 'left' : 'over'}`}
            </p>
          )}
          <FieldError message={errors.allocation} />
        </div>
      </section>

      <section className="border-t pt-6">
        <div className="mb-4">
          <p className="text-sm font-bold text-foreground">2. Money and timing</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Enter the amount and when the order or work is due.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
              onChange={(event) => onFieldChange('amount', event.target.value)}
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
      </section>

      <section className="border-t pt-6">
        <div className="mb-4">
          <p className="text-sm font-bold text-foreground">3. When can payment be released?</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            We suggested a simple condition for this deal. Edit it only if your agreement is different.
          </p>
        </div>
        <Label htmlFor="release">Release condition</Label>
        <Textarea
          id="release"
          className="mt-1.5"
          rows={3}
          value={form.releaseConditions}
          onChange={(event) => onFieldChange('releaseConditions', event.target.value)}
        />
        <FieldError message={errors.releaseConditions} />

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
