import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import type { DealDetailsValues, DealParticipantForm } from './CreateDealDetailsStep';

export function SimpleDealDetails({ form, errors, mobileStage, onFieldChange, onParticipantChange }: {
  form: DealDetailsValues; errors: Record<string,string>; mobileStage: number;
  onFieldChange: (field: keyof DealDetailsValues, value: string) => void;
  onParticipantChange: (index: number, key: keyof DealParticipantForm, value: string) => void;
}) {
  const error = (key: string) => errors[key] && <p role="alert" className="mt-1 text-xs text-destructive">{errors[key]}</p>;
  return <>
    <div className={`${mobileStage===1?'grid':'hidden sm:grid'} gap-5`}>
      <div><Label htmlFor="simple-deal-title">What is the deal for?</Label><Input id="simple-deal-title" className="mt-2" placeholder="e.g. Website design for my shop" value={form.title} onChange={e=>onFieldChange('title',e.target.value)}/>{error('title')}</div>
      <div><Label htmlFor="simple-deal-description">Describe what’s included</Label><Textarea id="simple-deal-description" className="mt-2" rows={3} placeholder="Include quantities, specifications or the work you agreed on." value={form.description} onChange={e=>onFieldChange('description',e.target.value)}/>{error('description')}</div>
    </div>
    <div className={`${mobileStage===2?'grid':'hidden sm:grid'} gap-5 sm:grid-cols-2`}>
      <div><Label htmlFor="simple-deal-amount">Total amount (NGN)</Label><Input id="simple-deal-amount" className="mt-2" inputMode="decimal" placeholder="0.00" value={form.amount} onChange={e=>onFieldChange('amount',e.target.value)}/>{error('amount')}<p className="mt-2 text-xs text-muted-foreground">One payment, released after the agreed checks.</p></div>
      <div><Label htmlFor="simple-deal-date">Delivery or completion date</Label><Input id="simple-deal-date" type="date" className="mt-2" min={new Date().toLocaleDateString('en-CA')} value={form.deliveryDueDate} onChange={e=>onFieldChange('deliveryDueDate',e.target.value)}/>{error('deliveryDueDate')}</div>
    </div>
    <div className={`${mobileStage===3?'grid':'hidden sm:grid'} gap-5 border-t pt-5 sm:grid-cols-2`}>
      <div><Label htmlFor="simple-party-name">Other person or business</Label><Input id="simple-party-name" className="mt-2" placeholder="Their name" value={form.participants[0]?.name ?? ''} onChange={e=>onParticipantChange(0,'name',e.target.value)}/>{error('participant_0_name')}</div>
      <div><Label htmlFor="simple-party-contact">Their email, phone or Naitrust ID</Label><Input id="simple-party-contact" className="mt-2" placeholder="name@example.com" value={form.participants[0]?.contact ?? ''} onChange={e=>onParticipantChange(0,'contact',e.target.value)}/>{error('participant_0_contact')}</div>
    </div>
    {error('allocation')}
  </>;
}
