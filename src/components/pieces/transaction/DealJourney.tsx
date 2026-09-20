import { Check } from 'lucide-react';
import type { SafeDealDetail } from '../../../libs/store/types';

export function DealJourney({ deal, compact = false }: { deal: SafeDealDetail; compact?: boolean }) {
  const role=deal.parties.find(p=>p.isYou)?.role;
  const completed=['paid_out','completed'].includes(deal.status);
  const closed=['refunded','cancelled'].includes(deal.status);
  const stage=completed?5:['pending_counterparty','terms_negotiation','draft'].includes(deal.status)?0:['terms_agreed','awaiting_funding'].includes(deal.status)?1:deal.status==='release_approved'?4:['buyer_review','evidence_submitted'].includes(deal.status)?3:2;
  const next: Record<number,[string,string]>={
    0:['Agree the details','Both people review and accept the agreement before payment. You can request changes if something isn’t right.'],
    1:[role==='buyer'?'Fund your deal':'Waiting for payment',role==='buyer'?'Use the Payment panel to fund this deal after the terms are accepted.':'Wait for the payment status to show Funded before providing the goods or service.'],
    2:deal.workflowMode==='delivery' ? [role==='seller'?'Prepare for delivery':'Waiting for delivery',role==='seller'?'Create a delivery card when the goods are ready. Share updates in Activity.':'Verify the delivery card when the goods arrive, then check your purchase.'] : [role==='seller'?'Share your progress':'Your deal is in progress',role==='seller'?'Add evidence of the completed work or delivery, then ask the buyer to review.':'You can message the seller here. Review the goods or work before approving release.'],
    3:[role==='buyer'?'Review before you release':'Waiting for buyer review',role==='buyer'?'Check the evidence against your agreement. Approve when satisfied, request changes, or raise an issue.':'The buyer will review your evidence and confirm whether the agreed conditions are met.'],
    4:['Release approved','Payment release is being processed. Follow its status in the Payment panel.'],
    5:['Deal completed','Your agreement, evidence and payment record remain available here.'],
  };
  const message=closed?['Deal closed',deal.status==='refunded'?'This deal was refunded. You can still view its records.':'This deal was cancelled. You can still view its records.']:deal.status==='disputed'?['An issue needs attention','Use the Dispute tab to follow the review and provide supporting evidence.']:next[stage];
  if (compact) return <div className="nd-room-next"><strong>{message[0]}</strong><p>{message[1]}</p></div>;
  return <><div className="nd-journey" aria-label="Deal progress">{['Agree terms','Fund payment','Work or delivery','Buyer review','Release'].map((label,index)=><div key={label} className={index<stage?'done':''} aria-current={!closed && index===stage?'step':undefined}><span>{index<stage?<Check size={12}/>:index+1}</span>{label}</div>)}</div><div className="nd-next-step"><strong>{message[0]}</strong><p>{message[1]}</p></div></>;
}
