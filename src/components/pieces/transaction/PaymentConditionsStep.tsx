import { ChevronDown, Clock3 } from 'lucide-react';
import type { ExtendedProductTestingDays } from '../../../libs/store/types';
import { supportsDeliveryReview } from '../../../libs/protected-deals/delivery-review';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { ProductTestingPeriodField } from './ProductTestingPeriodField';

interface PaymentConditionsStepProps {
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
  onFieldChange: (field: 'releaseConditions' | 'nextPaymentReleaseConditions' | 'openUntil', value: string) => void;
  onTestingPeriodChange: (value?: ExtendedProductTestingDays) => void;
  onAdvancedTimingChange: (open: boolean) => void;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;
}

export function PaymentConditionsStep(props: PaymentConditionsStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold text-foreground">Payment conditions</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {props.splitPayment ? 'Set what releases the first payment and what must happen before the remaining payment is available.' : 'Set what must happen before this payment can be released.'}
        </p>
      </div>
      <div>
        <Label htmlFor="release">{props.splitPayment ? 'First payment release condition' : 'Release condition'}</Label>
        <Textarea id="release" className="mt-1.5" rows={3} value={props.releaseConditions} onChange={(event) => props.onFieldChange('releaseConditions', event.target.value)} />
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">A 24-hour review applies before this payment releases. The payer may approve an earlier release with their transaction PIN, but Naitrust will show a final warning first.</p>
        <FieldError message={props.errors.releaseConditions} />
      </div>
      {props.splitPayment && <div><Label htmlFor="next-payment-condition">Second payment release condition</Label><Textarea id="next-payment-condition" className="mt-1.5" rows={3} placeholder="For example: Release the remaining payment after final delivery is inspected and accepted." value={props.nextPaymentReleaseConditions} onChange={(event) => props.onFieldChange('nextPaymentReleaseConditions', event.target.value)} /><p className="mt-1 text-xs leading-5 text-muted-foreground">The second payment stays locked until the first payment is released successfully. Once its condition is confirmed, it receives its own 24-hour review period.</p><FieldError message={props.errors.nextPaymentReleaseConditions} /></div>}
      {supportsDeliveryReview(props.useCase) && <ProductTestingPeriodField value={props.extendedProductTestingDays} onChange={props.onTestingPeriodChange} />}
      <Collapsible open={props.showAdvancedTiming} onOpenChange={props.onAdvancedTimingChange} className="rounded-2xl border">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"><span className="flex items-center gap-2 text-sm font-semibold"><Clock3 size={15} className="text-primary" />Invitation timing</span><span className="flex items-center gap-2 text-xs text-muted-foreground">Expires after 7 days by default<ChevronDown size={15} className={`transition-transform ${props.showAdvancedTiming ? 'rotate-180' : ''}`} /></span></CollapsibleTrigger>
        <CollapsibleContent className="border-t px-4 py-4"><Label htmlFor="open">Invitation expires</Label><Input id="open" type="date" min={props.minOpen} max={props.maxOpen} className="mt-1.5 max-w-sm" value={props.openUntil} onChange={(event) => props.onFieldChange('openUntil', event.target.value)} /><p className="mt-1 text-xs leading-5 text-muted-foreground">The other party must accept before this date. You can choose up to {props.maxOpenDays} days.</p><FieldError message={props.errors.openUntil} /></CollapsibleContent>
      </Collapsible>
    </div>
  );
}
