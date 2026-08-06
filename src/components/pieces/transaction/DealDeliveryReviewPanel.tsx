import { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, KeyRound, PackageCheck, QrCode, RefreshCw, ShieldCheck, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useApproveEarlyRelease, useCompleteHandoverReview, useConfirmReceiptByOtp, useGenerateDeliveryCard } from '../../../hooks/useDealDetail';
import { fundingReviewLabel, isDeliveryCardStatusEligible, requiredProductEvidence, supportsDeliveryReview } from '../../../libs/protected-deals/delivery-review';
import type { SafeDealDetail } from '../../../libs/store/types';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { PinPromptModal } from '../security/PinPromptModal';
import { DeliveryCardDialog } from './DeliveryCardDialog';
import { LiveDealCountdown } from './LiveDealCountdown';

interface DealDeliveryReviewPanelProps {
  deal: SafeDealDetail;
  hasDispute: boolean;
  onReportIssue: () => void;
  onUploadEvidence: (kind?: string) => void;
}

function actionError(error: unknown): string {
  return error instanceof Error ? error.message : 'This action could not be completed.';
}

export function DealDeliveryReviewPanel({ deal, hasDispute, onReportIssue, onUploadEvidence }: DealDeliveryReviewPanelProps) {
  const role = deal.parties.find((party) => party.isYou)?.role;
  const isBuyer = role === 'buyer';
  const isSeller = role === 'seller';
  const generate = useGenerateDeliveryCard(deal.id);
  const confirmOtp = useConfirmReceiptByOtp(deal.id);
  const completeHandover = useCompleteHandoverReview(deal.id);
  const release = useApproveEarlyRelease(deal.id);
  const [otp, setOtp] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const delivery = generate.data?.data.delivery ?? deal.delivery;
  const card = delivery.card;
  const evidenceRequirements = requiredProductEvidence(deal.evidence);
  const evidenceReady = evidenceRequirements.every((item) => item.complete);
  const canGenerate = isSeller && deal.funding.status === 'funded' && isDeliveryCardStatusEligible(deal.status) && delivery.handover.status === 'not_started';
  const showFeature = supportsDeliveryReview(deal.useCase) || delivery.handover.status !== 'not_started' || Boolean(card);
  if (!showFeature) return null;

  const handoverDone = delivery.handover.status === 'completed' || delivery.handover.status === 'issue_reported' || delivery.fundingReview.status !== 'not_started';
  const paymentDone = ['release_approved', 'paid_out'].includes(delivery.fundingReview.status);
  const activeStep = delivery.handover.status === 'not_started' ? 1 : delivery.handover.status === 'in_progress' ? 2 : 3;

  const generateCard = () => generate.mutate(undefined, {
    onSuccess: () => { setShowCard(true); toast.success(card ? 'New delivery code created. The old code no longer works.' : 'Delivery code created.'); },
    onError: (error) => toast.error(actionError(error)),
  });

  const confirmWithOtp = () => confirmOtp.mutate(otp, {
    onSuccess: () => { setOtp(''); toast.success('Delivery confirmed. Check the item before the review ends.'); },
    onError: (error) => toast.error(actionError(error)),
  });

  return <Card className="mb-4 gap-0 overflow-hidden border-primary/15 p-0 shadow-sm">
    <div className="border-b bg-[#edf7ff] px-5 py-4 dark:bg-primary/[0.08]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm dark:bg-background"><PackageCheck size={20}/></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Delivery and payment</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Confirm delivery, check the item, then approve payment or report a problem.</p>
        </div>
        {deal.extendedProductTestingDays && <span className="hidden shrink-0 rounded-full border bg-white px-3 py-1 text-[10px] font-semibold text-foreground sm:inline">{deal.extendedProductTestingDays} day check</span>}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { number: 1, label: 'Delivery', done: activeStep > 1 },
          { number: 2, label: 'Check item', done: handoverDone },
          { number: 3, label: 'Payment', done: paymentDone },
        ].map((step) => <div key={step.number} className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-[10px] font-semibold sm:px-3 ${activeStep === step.number ? 'border-primary/30 bg-white text-primary dark:bg-background' : step.done ? 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-400' : 'border-transparent bg-white/45 text-muted-foreground dark:bg-white/[0.03]'}`}>
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] ${step.done ? 'bg-emerald-600 text-white' : activeStep === step.number ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{step.done ? <Check size={12}/> : step.number}</span><span className="truncate">{step.label}</span>
        </div>)}
      </div>
    </div>

    <div className="p-5">
      {delivery.handover.status === 'not_started' && isSeller && <div>
        <p className="text-sm font-semibold">Create the buyer’s delivery code</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">First record the item you are handing over. Then create one code for the buyer.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{evidenceRequirements.map((requirement) => <div key={requirement.kind} className="flex items-center gap-2 text-xs"><span className={requirement.complete ? 'text-emerald-600' : 'text-muted-foreground'}>{requirement.complete ? <CheckCircle2 size={15}/> : <span className="block h-3.5 w-3.5 rounded-full border"/>}</span><span className={requirement.complete ? 'text-foreground' : 'text-muted-foreground'}>{requirement.kind}</span></div>)}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {!evidenceReady && <Button size="sm" variant="outline" className="rounded-full" onClick={() => onUploadEvidence(evidenceRequirements.find((item) => !item.complete)?.kind)}><Upload size={14}/> Add next required proof</Button>}
          {card?.status === 'active' && <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowCard(true)}><QrCode size={14}/> View code</Button>}
          <Button size="sm" className="rounded-full" disabled={!canGenerate || !evidenceReady || generate.isPending} onClick={generateCard}>{card?.status === 'active' ? <RefreshCw size={14}/> : <KeyRound size={14}/>} {card?.status === 'active' ? 'Create a new code' : 'Create delivery code'}</Button>
        </div>
      </div>}

      {delivery.handover.status === 'not_started' && isBuyer && <div>
        <p className="text-sm font-semibold">Have you received the item?</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Only continue when the item is with you. Enter the code from the seller. Payment will remain protected while you check it.</p>
        <div className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row"><Input aria-label="Six digit delivery code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="Enter 6 digit code" className="font-mono tracking-[0.18em]"/><Button disabled={otp.length !== 6 || confirmOtp.isPending || !card} onClick={confirmWithOtp}><KeyRound size={15}/> Confirm delivery</Button></div>
        {!card && <p className="mt-2 text-[11px] text-muted-foreground">The seller has not created a delivery code yet.</p>}
      </div>}

      {delivery.handover.status === 'in_progress' && <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
        <LiveDealCountdown deadline={delivery.handover.endsAt} label="Time to check item"/>
        <div><p className="text-sm font-semibold">Check the item now</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Check the product, serial number, contents, packaging, and seal before the rider leaves.</p>{isBuyer ? <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" className="rounded-full" disabled={completeHandover.isPending} onClick={() => completeHandover.mutate(undefined,{onSuccess:()=>toast.success('Item confirmed. Payment review has started.'),onError:(error)=>toast.error(actionError(error))})}><CheckCircle2 size={15}/> Item is correct</Button><Button size="sm" variant="outline" className="rounded-full" onClick={() => onUploadEvidence('Photo')}><Upload size={14}/> Add photos</Button><Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={onReportIssue}><AlertTriangle size={14}/> Report a problem</Button></div> : <p className="mt-3 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">Waiting for the buyer to finish checking the item.</p>}</div>
      </div>}

      {delivery.fundingReview.status === 'in_progress' && <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
        <LiveDealCountdown deadline={delivery.fundingReview.endsAt} label="Payment review time"/>
        <div><p className="text-sm font-semibold">{fundingReviewLabel(delivery.fundingReview.extendedProductTestingDays)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Payment releases when this time ends. The buyer can release it sooner or report a problem.</p>{isBuyer && !hasDispute ? <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" className="rounded-full" onClick={() => setShowPin(true)}><ShieldCheck size={15}/> Release payment</Button><Button size="sm" variant="outline" className="rounded-full" onClick={() => onUploadEvidence('Photo')}><Upload size={14}/> Add photos</Button><Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={onReportIssue}><AlertTriangle size={14}/> Report a problem</Button></div> : null}</div>
      </div>}

      {(hasDispute || delivery.fundingReview.status === 'blocked' || delivery.handover.status === 'issue_reported') && <StatusNotice danger title="Payment is paused" text="A problem was reported. Funds remain protected while the dispute is reviewed."/>}
      {delivery.fundingReview.status === 'release_approved' && <StatusNotice title="Payment release approved" text="The payment partner is processing the seller payout."/>}
      {delivery.fundingReview.status === 'paid_out' && <StatusNotice title="Payment completed" text="The seller has been paid and the delivery record remains with this deal."/>}
    </div>

    {card && <DeliveryCardDialog open={showCard} onOpenChange={setShowCard} title={deal.title} reference={deal.reference} card={card}/>} 
    <PinPromptModal open={showPin} onOpenChange={setShowPin} title="Release protected payment?" description="Confirm that you have finished checking the item. This payment release cannot be reversed from the Transaction Room." onVerified={() => release.mutate(undefined,{onSuccess:()=>toast.success('Payment release approved.'),onError:(error)=>toast.error(actionError(error))})}/>
  </Card>;
}

function StatusNotice({ title, text, danger = false }: { title: string; text: string; danger?: boolean }) {
  return <div className={`flex items-start gap-3 rounded-2xl border p-4 ${danger ? 'border-destructive/20 bg-destructive/[0.06]' : 'border-emerald-500/20 bg-emerald-500/[0.07]'}`}><span className={danger ? 'text-destructive' : 'text-emerald-600'}>{danger ? <AlertTriangle size={18}/> : <ShieldCheck size={18}/>}</span><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></div>;
}
