import { ChevronDown, Clock3, Expand, Loader2, Pencil, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { DealWorkflowMode, ExtendedProductTestingDays } from '../../../libs/store/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';

interface PaymentConditionsStepProps {
  workflowMode: DealWorkflowMode;
  splitPayment: boolean;
  useCase: string;
  releaseConditions: string;
  nextPaymentReleaseConditions: string;
  extendedProductTestingDays?: ExtendedProductTestingDays;
  openUntil: string;
  minOpen: string;
  maxOpen: string;
  maxOpenDays: number;
  showAdvancedTiming: boolean;
  errors: Record<string, string>;
  generatedByAi: boolean;
  generating: boolean;
  onGenerate: (stage: 'first' | 'final') => void;
  onFieldChange: (field: 'releaseConditions' | 'nextPaymentReleaseConditions' | 'openUntil', value: string) => void;
  onTestingPeriodChange: (value?: ExtendedProductTestingDays) => void;
  onAdvancedTimingChange: (open: boolean) => void;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;
}

export function PaymentConditionsStep(props: PaymentConditionsStepProps) {
  const [editingConditions, setEditingConditions] = useState(!props.releaseConditions);
  const [expandedCondition, setExpandedCondition] = useState<'first' | 'final' | null>(null);

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-foreground">Payment conditions</p>
          <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
            {props.splitPayment ? 'Set what releases the first payment and what must happen before the remaining payment is available.' : 'Set what must happen before this payment can be released.'}
          </p>
        </div>
      </div>
      <div className={`grid gap-3 ${props.splitPayment ? 'lg:grid-cols-2' : ''} sm:items-start`}>
      <div className="min-w-0">
        <Label htmlFor="release">{props.splitPayment ? 'First payment release condition' : 'Release condition'}</Label>
        {!editingConditions && props.releaseConditions && <div className="mt-2 rounded-2xl border bg-muted/20 p-3 sm:hidden"><p className="line-clamp-3 text-xs leading-5 text-foreground">{props.releaseConditions}</p><Button type="button" variant="ghost" size="sm" className="mt-1 h-8 rounded-full px-2 text-xs" onClick={() => setEditingConditions(true)}><Pencil size={12} /> Edit conditions</Button></div>}
        <div className={`relative mt-2 ${editingConditions || !props.releaseConditions ? '' : 'hidden sm:block'}`}>
          <Textarea id="release" className="h-24 resize-none overflow-y-auto pr-20 text-sm leading-5" rows={3} value={props.releaseConditions} onChange={(event) => props.onFieldChange('releaseConditions', event.target.value)} />
          <button type="button" onClick={() => setExpandedCondition('first')} className="absolute right-10 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Expand payment release condition" title="Expand"><Expand size={15} /></button>
          <button type="button" disabled={props.generating} onClick={() => { setEditingConditions(true); props.onGenerate('first'); }} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10 disabled:opacity-50" aria-label="Generate payment conditions with AI" title="Generate with AI">{props.generating ? <Loader2 size={15} className="animate-spin" /> : props.generatedByAi ? <RefreshCw size={15} /> : <Sparkles size={15} />}</button>
        </div>
        {editingConditions && props.releaseConditions && <div className="mt-2 flex justify-end sm:hidden"><Button type="button" variant="ghost" size="sm" className="h-8 rounded-full text-xs" onClick={() => setEditingConditions(false)}>Done editing</Button></div>}
        <FieldError message={props.errors.releaseConditions} />
      </div>
      {props.splitPayment && <div className="min-w-0"><Label htmlFor="next-payment-condition">Final payment release condition</Label><div className="relative mt-2"><Textarea id="next-payment-condition" className="h-24 resize-none overflow-y-auto pr-20 text-sm leading-5" rows={3} placeholder="What must happen before the final payment is released?" value={props.nextPaymentReleaseConditions} onChange={(event) => props.onFieldChange('nextPaymentReleaseConditions', event.target.value)} /><button type="button" onClick={() => setExpandedCondition('final')} className="absolute right-10 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Expand final payment release condition" title="Expand"><Expand size={15} /></button><button type="button" disabled={props.generating} onClick={() => props.onGenerate('final')} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10 disabled:opacity-50" aria-label="Generate final payment condition with AI" title="Generate with AI">{props.generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}</button></div><FieldError message={props.errors.nextPaymentReleaseConditions} /></div>}
      </div>
      <Collapsible open={props.showAdvancedTiming} onOpenChange={props.onAdvancedTimingChange} className="rounded-2xl border">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"><span className="flex items-center gap-2 text-sm font-semibold"><Clock3 size={15} className="text-primary" />Invitation timing</span><span className="flex items-center gap-2 text-xs text-muted-foreground">Expires after 7 days by default<ChevronDown size={15} className={`transition-transform ${props.showAdvancedTiming ? 'rotate-180' : ''}`} /></span></CollapsibleTrigger>
        <CollapsibleContent className="border-t px-4 py-4"><Label htmlFor="open">Invitation expires</Label><Input id="open" type="date" min={props.minOpen} max={props.maxOpen} className="mt-1.5 max-w-sm" value={props.openUntil} onChange={(event) => props.onFieldChange('openUntil', event.target.value)} /><p className="mt-1 text-xs leading-5 text-muted-foreground">The other party must accept before this date. You can choose up to {props.maxOpenDays} days.</p><FieldError message={props.errors.openUntil} /></CollapsibleContent>
      </Collapsible>
      <Dialog open={expandedCondition !== null} onOpenChange={(open) => { if (!open) setExpandedCondition(null); }}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{expandedCondition === 'final' ? 'Final payment release condition' : props.splitPayment ? 'First payment release condition' : 'Payment release condition'}</DialogTitle>
            <DialogDescription>Review or edit the full condition below.</DialogDescription>
          </DialogHeader>
          <Textarea
            className="h-[min(55vh,28rem)] resize-none overflow-y-auto text-sm leading-6"
            placeholder={expandedCondition === 'final' ? 'What must happen before the final payment is released?' : 'What must happen before this payment is released?'}
            value={expandedCondition === 'final' ? props.nextPaymentReleaseConditions : props.releaseConditions}
            onChange={(event) => props.onFieldChange(expandedCondition === 'final' ? 'nextPaymentReleaseConditions' : 'releaseConditions', event.target.value)}
            autoFocus
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
