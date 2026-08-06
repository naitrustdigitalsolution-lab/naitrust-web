import { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, HandCoins, KeyRound, PackageCheck, QrCode, RefreshCw, ShieldCheck, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useApproveEarlyRelease, useCompleteHandoverReview, useConfirmReceiptByOtp, useGenerateDeliveryCard } from '../../../hooks/useDealDetail';
import { fundingReviewLabel, isDeliveryCardStatusEligible, supportsDeliveryReview } from '../../../libs/protected-deals/delivery-review';
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
  const [releaseRequested, setReleaseRequested] = useState(false);

  const delivery = generate.data?.data.delivery ?? deal.delivery;
  const card = delivery.card;
  const evidenceReady = deal.evidence.length > 0;
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

  return <Card className="mb-4 gap-0 overflow-hidden p-0 shadow-none">
    <div className="border-b px-4 py-3.5 sm:px-5">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary"><PackageCheck size={16}/></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Delivery and payment</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{isSeller ? 'Prepare the handover, then follow the buyer’s confirmation and payment release.' : 'Confirm delivery, check the item, then decide whether payment can be released.'}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">Step {activeStep} of 3</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {[
          { number: 1, label: isSeller ? 'Prepare handover' : 'Receive delivery', done: activeStep > 1 },
          { number: 2, label: isSeller ? 'Buyer confirmation' : 'Check item', done: handoverDone },
          { number: 3, label: isSeller ? 'Payment release' : 'Release payment', done: paymentDone },
        ].map((step) => <div key={step.number} className="min-w-0">
          <span className={`block h-1 rounded-full ${step.done ? 'bg-emerald-500' : activeStep === step.number ? 'bg-primary' : 'bg-muted'}`} />
          <span className={`mt-1.5 block truncate text-[10px] font-medium ${activeStep === step.number ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
        </div>)}
      </div>
    </div>

    <div className="p-4 sm:p-5">
      {delivery.handover.status === 'not_started' && isSeller && <div>
        <p className="text-sm font-semibold">Create the buyer’s delivery code</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Add supporting proof that fits this handover, then create the one-time code for the buyer.</p>
        {deal.evidence.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{Array.from(new Set(deal.evidence.map((item) => item.kind))).slice(0, 6).map((kind) => <span key={kind} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{kind}</span>)}</div>}
        <p className={`mt-3 flex items-center gap-1.5 text-[11px] font-medium ${evidenceReady ? 'text-emerald-600' : 'text-muted-foreground'}`}>{evidenceReady && <CheckCircle2 size={13}/>} {evidenceReady ? `${deal.evidence.length} supporting ${deal.evidence.length === 1 ? 'file' : 'files'} added.` : 'Add at least one supporting file of your choice.'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => onUploadEvidence('Photo')}><Upload size={14}/> {evidenceReady ? 'Add more proof' : 'Add supporting proof'}</Button>
          {card?.status === 'active' && <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowCard(true)}><QrCode size={14}/> View code</Button>}
          <Button size="sm" className="rounded-full" disabled={!canGenerate || !evidenceReady || generate.isPending} onClick={generateCard}>{card?.status === 'active' ? <RefreshCw size={14}/> : <KeyRound size={14}/>} {card?.status === 'active' ? 'Create a new code' : 'Create delivery code'}</Button>
        </div>
        {!evidenceReady && <p className="mt-2 text-[11px] text-muted-foreground">The delivery-code button unlocks after any supporting file is added.</p>}
        {evidenceReady && !canGenerate && <p className="mt-2 text-[11px] text-destructive">A delivery code can only be created by the seller while the deal is funded and awaiting handover.</p>}
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
        <div><p className="text-sm font-semibold">{fundingReviewLabel(delivery.fundingReview.extendedProductTestingDays)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Payment releases when this time ends. The seller can request release, but only the buyer can approve it sooner or report a problem.</p>{isBuyer && !hasDispute ? <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" className="rounded-full" onClick={() => setShowPin(true)}><ShieldCheck size={15}/> Release payment now</Button><Button size="sm" variant="outline" className="rounded-full" onClick={() => onUploadEvidence('Photo')}><Upload size={14}/> Add photos</Button><Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={onReportIssue}><AlertTriangle size={14}/> Report a problem</Button></div> : isSeller && !hasDispute ? <div className="mt-4"><Button size="sm" variant="outline" className="rounded-full" disabled={releaseRequested} onClick={() => { setReleaseRequested(true); toast.success('Release request sent to the buyer.'); }}><HandCoins size={15}/>{releaseRequested ? 'Release requested' : 'Request fund release'}</Button>{releaseRequested && <p className="mt-2 text-[11px] text-muted-foreground">The buyer has been notified. The 24-hour review continues unless they approve early release.</p>}</div> : null}</div>
      </div>}

      {(hasDispute || delivery.fundingReview.status === 'blocked' || delivery.handover.status === 'issue_reported') && <StatusNotice danger title="Payment is paused" text="A problem was reported. Funds remain protected while the dispute is reviewed."/>}
      {delivery.fundingReview.status === 'release_approved' && <StatusNotice title="Payment release approved" text="The payment partner is processing the seller payout."/>}
      {delivery.fundingReview.status === 'paid_out' && <StatusNotice title="Payment completed" text="The seller has been paid and the delivery record remains with this deal."/>}
    </div>

    {card && <DeliveryCardDialog open={showCard} onOpenChange={setShowCard} title={deal.title} reference={deal.reference} card={card}/>} 
    <PinPromptModal open={showPin} onOpenChange={setShowPin} title="Release protected payment now?" description="Confirm that you have finished checking the item and want Naitrust to proceed without waiting for the review period to end." warning="Warning: this bypasses the remaining 24-hour review time. Once approved, this payment release cannot be reversed from the Transaction Room." onVerified={() => release.mutate(undefined,{onSuccess:()=>toast.success('Payment release approved.'),onError:(error)=>toast.error(actionError(error))})}/>
  </Card>;
}

function StatusNotice({ title, text, danger = false }: { title: string; text: string; danger?: boolean }) {
  return <div className={`flex items-start gap-3 rounded-2xl border p-4 ${danger ? 'border-destructive/20 bg-destructive/[0.06]' : 'border-emerald-500/20 bg-emerald-500/[0.07]'}`}><span className={danger ? 'text-destructive' : 'text-emerald-600'}>{danger ? <AlertTriangle size={18}/> : <ShieldCheck size={18}/>}</span><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></div>;
}
