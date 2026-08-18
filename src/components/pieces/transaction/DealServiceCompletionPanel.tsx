import { useState } from 'react';
import { CheckCircle2, FileCheck2, RefreshCw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { DealRole, SafeDealDetail } from '../../../libs/store/types';
import { useApproveServiceRelease, useRequestServiceChanges, useRequestServiceRelease } from '../../../hooks/useDealDetail';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { PinPromptModal } from '../security/PinPromptModal';

export function DealServiceCompletionPanel({ deal, viewerRole, hasDispute, onUploadEvidence }: { deal: SafeDealDetail; viewerRole: DealRole; hasDispute: boolean; onUploadEvidence: () => void }) {
  const [showPin, setShowPin] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [reason, setReason] = useState('');
  const requestRelease = useRequestServiceRelease(deal.id);
  const requestChanges = useRequestServiceChanges(deal.id);
  const approveRelease = useApproveServiceRelease(deal.id);
  const isProvider = viewerRole === 'seller';
  const awaitingReview = deal.completion.status === 'release_requested';
  const providerEvidence = deal.evidence.some((item) => item.uploadedByRole === 'seller');
  const completed = ['release_approved', 'paid_out'].includes(deal.completion.status);

  return (
    <Card className="mb-4 overflow-hidden rounded-2xl border-primary/15 p-0 shadow-sm">
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileCheck2 size={19} /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{deal.workflowMode === 'milestone' ? 'Progress review' : 'Work completion'}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {completed ? 'The buyer approved the work and the protected payment was released.'
              : awaitingReview ? (isProvider ? 'Your payment request is waiting for the buyer to review the evidence.' : 'The provider submitted work and requested payment. Review the evidence before deciding.')
                : deal.completion.status === 'changes_requested' ? (isProvider ? `The buyer requested changes: ${deal.completion.changesReason}` : 'You requested changes. Payment remains protected while the provider updates the work.')
                  : isProvider ? 'Add evidence of the completed work, then request payment when it is ready for review.' : 'Payment remains protected until the provider submits work and you approve release.'}
          </p>
        </div>
      </div>

      {!completed && !hasDispute && (
        <div className="flex flex-col gap-2 border-t bg-muted/20 p-4 sm:flex-row sm:justify-end">
          {isProvider && !awaitingReview && <>
            <Button variant="outline" className="rounded-full" onClick={onUploadEvidence}><Upload size={15} /> Add evidence</Button>
            <Button className="rounded-full" disabled={!providerEvidence || requestRelease.isPending} onClick={() => requestRelease.mutate(undefined, { onSuccess: () => toast.success('Work submitted. The buyer was notified.'), onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not request payment.') })}>
              {deal.completion.status === 'changes_requested' ? <RefreshCw size={15} /> : <CheckCircle2 size={15} />} Submit work & request payment
            </Button>
          </>}
          {!isProvider && awaitingReview && <>
            <Button variant="outline" className="rounded-full" onClick={() => setShowChanges(true)}>Request changes</Button>
            <Button className="rounded-full" onClick={() => setShowPin(true)}><CheckCircle2 size={15} /> Approve & release funds</Button>
          </>}
        </div>
      )}

      <Dialog open={showChanges} onOpenChange={setShowChanges}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Request changes</DialogTitle><DialogDescription>Explain what is incomplete or needs to be corrected. The provider can update the work and submit it again.</DialogDescription></DialogHeader>
          <Textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="What needs to change?" />
          <DialogFooter><Button variant="outline" onClick={() => setShowChanges(false)}>Cancel</Button><Button disabled={!reason.trim() || requestChanges.isPending} onClick={() => requestChanges.mutate(reason, { onSuccess: () => { setShowChanges(false); setReason(''); toast.success('Changes requested. The provider was notified.'); }, onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not request changes.') })}>Send request</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <PinPromptModal open={showPin} onOpenChange={setShowPin} title="Release protected payment?" description="Confirm that you reviewed the submitted work and evidence and are satisfied." warning="Once released, this payment cannot be frozen or reversed from the Deal Room." onVerified={() => approveRelease.mutate(undefined, { onSuccess: () => toast.success('Payment released to the provider.'), onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not release payment.') })} />
    </Card>
  );
}
