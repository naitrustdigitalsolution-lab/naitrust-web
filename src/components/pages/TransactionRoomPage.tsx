import { useLegalRefresh } from '../../features/legal/hooks';
import { dealDetailApi } from '../../libs/api/deal-detail.api';
import { formatFileSize } from '../../libs/protected-deals/evidence-files';
import { LegalReviewPanel, LegalFeeSummary } from '../../features/legal/components';
import { legalApi, legalFundingBlocked } from '../../features/legal/legal.api';
/**
 * TransactionRoomPage
 * The deal room (`/app/deals/:id`): the most important screen
 * (guardrails/ui.md). Centered, modern layout: a deal header, a tabbed main
 * column (Overview, Chat between the parties, Evidence, Activity), and a side
 * rail with the Parties panel, partner Funding panel, and contextual actions.
 * Reads the deal detail query; actions are mocked until the backend lands.
 */

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MoreHorizontal,
  Ban,
  CalendarClock,
  Check,
  Copy,
  Download,
  FileText,
  Eye,
  GitPullRequestArrow,
  Maximize2,
  MessageSquare,
  Minimize2,
  Paperclip,
  ScrollText,
  ShieldAlert,
  ScanFace,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { TransactionStatusBadge } from '../pieces/dashboard/TransactionStatusBadge';
import { AgreementDocument } from '../pieces/agreement/AgreementDocument';
import { DealJourney } from '../pieces/transaction/DealJourney';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Textarea } from '../ui/textarea';
import { ACTIVITY_UPDATE_PREFIX } from '../../libs/api/deal-messages.api';
import { DealChat } from '../pieces/transaction/DealChat';
import { NegotiationPanel } from '../pieces/transaction/NegotiationPanel';
import { ProposeChangesModal } from '../pieces/transaction/ProposeChangesModal';
import { UploadEvidenceModal } from '../pieces/transaction/UploadEvidenceModal';
import { RaiseDisputeModal } from '../pieces/transaction/RaiseDisputeModal';
import { DealDeliveryReviewPanel } from '../pieces/transaction/DealDeliveryReviewPanel';
import { DealServiceCompletionPanel } from '../pieces/transaction/DealServiceCompletionPanel';
import { DisputePanel } from '../pieces/transaction/DisputePanel';
import { TerminationPanel } from '../pieces/transaction/TerminationPanel';
import { TerminationReasonModal } from '../pieces/transaction/TerminationReasonModal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Spinner from '../ui/spinner';
import {
  useDealDetail,
  useDealMessages,
  useSendDealMessage,
  useAddEvidence,
} from '../../hooks/useDealDetail';
import { useDeleteUnacceptedDeal } from '../../hooks/useTransactions';
import { appConfig } from '../../configs/env';
import { useNegotiation, useProposeNegotiation } from '../../hooks/useNegotiation';
import { useDispute, useOpenDispute } from '../../hooks/useDispute';
import { useTermination, useRequestTermination, useRespondTermination } from '../../hooks/useTermination';
import {
  formatMinorAmount,
  getFundingPresentation,
  getPartyStatusPresentation,
  roleLabel,
} from '../../libs/utils/safe-deal-presentation';
import { downloadAgreementDocument, downloadDealSummaryCard } from '../../libs/utils/deal-documents';
import type { DealActivityEvent, SafeDealDetail } from '../../libs/store/types';
import type { DealNegotiation } from '../../libs/store/types';
import { useAuth } from '../../libs/auth-context';
import { listMockDealIdentityCaptures, viewMockDealIdentityCapture, type DealIdentityCaptureView } from '../../libs/api/deal-identity-captures.mock';
import { invitationsApi } from '../../libs/api/invitations.api';


function SectionHeading({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-3">
      <Icon size={16} className="text-primary" />
      <h2 className="text-sm font-semibold text-foreground">{children}</h2>
    </div>
  );
}

function PartiesPanel({ deal }: { deal: SafeDealDetail }) {
  const { user } = useAuth();
  const [identityPhoto, setIdentityPhoto] = useState<DealIdentityCaptureView>();
  const otherCaptures = listMockDealIdentityCaptures(deal.id).filter((capture) => capture.subjectUserId !== user?.id);
  return (
    <Card className="gap-0 p-0 shadow-sm">
      <SectionHeading icon={Users}>Buyer and seller</SectionHeading>
      <ul className="divide-y divide-border">
        {deal.parties.map((party) => {
          const status = getPartyStatusPresentation(party.status);
          return (
            <li key={party.id} className="flex items-center gap-3 px-4 py-3">
              <CounterpartyAvatar name={party.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {party.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {roleLabel(party.role)}
                </p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </li>
          );
        })}
      </ul>
      <div className="border-t bg-muted/20 px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold"><ScanFace size={14} className="text-primary" /> Identity check</p>
        {otherCaptures.length ? otherCaptures.map((capture) => (
          <div key={capture.captureId} className="mt-2 rounded-xl border bg-background p-3">
            <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold">{capture.representativeName}</p>{capture.businessName && <p className="text-[11px] text-muted-foreground">{capture.businessName}</p>}<p className="mt-1 text-[11px] text-muted-foreground">{capture.action === 'deal_created' ? 'Created this deal' : 'Accepted this deal'} · {new Date(capture.capturedAt).toLocaleString()}</p></div><Badge variant="success" className="text-[9px]">Confirmed</Badge></div>
            {capture.photoAvailable ? <Button type="button" variant="outline" size="sm" className="mt-2 h-8 rounded-full text-xs" onClick={() => {
              try { setIdentityPhoto(viewMockDealIdentityCapture(deal.id, capture.captureId)); }
              catch (error) { toast.error(error instanceof Error ? error.message : 'Photo unavailable.'); }
            }}><Eye size={13} /> View live photo</Button> : <p className="mt-2 text-[11px] text-muted-foreground">Photo for this deal is not available.</p>}
          </div>
        )) : <p className="mt-2 text-[11px] leading-4 text-muted-foreground">The other participant’s deal photo is not available yet.</p>}
      </div>
      <Dialog open={Boolean(identityPhoto)} onOpenChange={(open) => !open && setIdentityPhoto(undefined)}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Live identity for this deal</DialogTitle><DialogDescription>Captured for this deal. It is not a reusable profile photo.</DialogDescription></DialogHeader>{identityPhoto && <div className="relative overflow-hidden rounded-2xl bg-muted"><img src={identityPhoto.photoDataUrl} alt={`${identityPhoto.representativeName} live identity capture for this deal`} className="aspect-[4/3] w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-[11px] text-white">{identityPhoto.watermark}</div></div>}</DialogContent>
      </Dialog>
    </Card>
  );
}

function FundingPanel({ deal }: { deal: SafeDealDetail }) {
  useLegalRefresh();
  const legal = appConfig.isMock ? legalApi.get(deal.id) : null;
  const legalBlocked = appConfig.isMock && legalFundingBlocked(deal.id);
  const { funding } = deal;
  const buyer = deal.parties.some(party => party.isYou && party.role === 'buyer');
  const canFund = buyer && funding.status === 'awaiting_transfer';
  const presentation = getFundingPresentation(funding.status);
  return <>
    <Card className="gap-0 p-0"><div className="space-y-3 p-5">
      <div className="flex items-center justify-between gap-3"><strong className="text-sm font-semibold">Payment</strong><Badge variant={appConfig.isMock ? "secondary" : presentation.variant}>{appConfig.isMock ? "Provider status unavailable" : presentation.label}</Badge></div>
      {(deal.initialPaymentMinor || canFund) && <p className="text-sm">{deal.initialPaymentMinor ? `${deal.activePaymentStage === 2 ? 'Remaining' : 'First'} payment · ` : ''}{formatMinorAmount(funding.amountExpectedMinor, funding.currency)}</p>}
      {legal && !legal.removed && <LegalFeeSummary fee={legal.fee} />}
      {legalBlocked && <p className="text-sm text-amber-700">Resolve legal consent before funding this deal.</p>}
      {funding.status === 'unfunded' && <p className="text-xs leading-5 text-muted-foreground">Both people must accept the agreement before the buyer funds this deal.</p>}
      {funding.status === 'awaiting_transfer' && !buyer && <p className="text-xs leading-5 text-muted-foreground">Waiting for the buyer’s payment. Confirm the funded status here before starting work.</p>}
      {canFund && appConfig.isMock && <p className="text-xs leading-5 text-muted-foreground">Payment instructions will appear here after the payment provider is connected. Do not send money against this local record.</p>}
      {canFund && !appConfig.isMock && (funding.accountNumber && funding.bankName ? <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Transfer to the account assigned to this deal</p><p className="mt-3 text-lg font-semibold">{funding.accountNumber}</p><p className="text-xs leading-5">{funding.accountName}<br/>{funding.bankName}</p><Button variant="outline" size="sm" className="mt-3" onClick={()=>void navigator.clipboard.writeText(funding.accountNumber).then(()=>toast.success('Account number copied.')).catch(()=>toast.error('Could not copy. Please select the account number.'))}><Copy size={13}/>Copy account number</Button><p className="mt-3 text-xs text-muted-foreground">Payment status updates after the provider confirms receipt.</p></div> : <p className="text-xs leading-5 text-muted-foreground">Payment instructions are not available yet. Contact support for help.</p>)}
      {funding.status === 'funded' && <p className="text-xs leading-5 text-muted-foreground">{appConfig.isMock ? 'Local funding record. Provider confirmation is unavailable.' : 'Payment confirmed.'} Release follows the agreed conditions and review process.</p>}
      {funding.status === 'released' && <p className="text-xs leading-5 text-emerald-700">{appConfig.isMock ? 'Local release record. No provider payout was made.' : 'Payment released to the seller.'}</p>}
    </div></Card>

  </>;
}

function EvidenceTab({ deal }: { deal: SafeDealDetail }) {
  const [showUpload, setShowUpload] = useState(false);
  const addEvidence = useAddEvidence(deal.id);
  const viewerRole = deal.parties.find((party) => party.isYou)?.role ?? 'buyer';

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Invoices, property documents, photos, and inspection reports attached to this transaction.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowUpload(true)}>
            <Upload size={14} className="mr-1.5" /> Upload document
          </Button>
        </div>
      </div>

      <UploadEvidenceModal
        open={showUpload}
        onOpenChange={setShowUpload}
        submitting={addEvidence.isPending}
        onSubmit={({ items }) =>
          addEvidence.mutate(
            { items, uploadedByName: 'You', uploadedByRole: viewerRole },
            {
              onSuccess: () => {
                setShowUpload(false);
                toast.success(`${items.length} file${items.length === 1 ? '' : 's'} uploaded.`);
              },
            },
          )
        }
      />
      {deal.evidence.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center">
          <Paperclip size={22} className="text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No evidence yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Property documents, receipts, inspection evidence, and supporting reports will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border">
          {deal.evidence.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.kind} · {item.uploadedByName} · {format(new Date(item.createdAt), 'MMM d')}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {item.kind}
              </Badge>
              {item.fileUrl ? (
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" title="Download document" onClick={async () => {
                    try { const url = await dealDetailApi.getEvidenceFile(deal.id, item.id); if (!/^(data:|blob:|https:\/\/)/.test(url)) throw new Error('Unsupported file URL.'); const blob = await (await fetch(url)).blob(); const objectUrl = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = objectUrl; link.download = item.fileName; link.click(); setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); } catch (error) { toast.error((error as Error).message); }
                  }}><Download size={16} />{item.sizeBytes !== undefined ? formatFileSize(item.sizeBytes) : 'Open'}</Button>
                </div>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">Preview unavailable</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActivityTab({ events, dealId }: { events: DealActivityEvent[]; dealId: string }) {
  const [note, setNote] = useState('');
  const send = useSendDealMessage(dealId);
  return (<div><form className="nd-activity-form" onSubmit={event => { event.preventDefault(); if (!note.trim()) return; send.mutate(ACTIVITY_UPDATE_PREFIX + note.trim(), { onSuccess: () => { setNote(''); toast.success('Activity added.'); }, onError: () => toast.error('Could not post your update. Please try again.') }); }}>
    <label htmlFor="activity-note">Add an activity</label><Textarea id="activity-note" rows={3} maxLength={2000} value={note} onChange={event=>setNote(event.target.value)} placeholder="Share a progress update with the other party."/><div><span>Visible to both parties.</span><Button type="submit" disabled={!note.trim() || send.isPending}>{send.isPending ? 'Posting…' : 'Post update'}</Button></div>
  </form>
    <ol className="relative space-y-5 pl-6">
      <span className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-border" aria-hidden />
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-6 top-1 flex h-3.5 w-3.5 items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
          </span>
          <p className="text-sm text-foreground">{event.message}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {format(new Date(event.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
        </li>
      ))}
    </ol></div>
  );
}

function OverviewTab({ deal }: { deal: SafeDealDetail }) {
  const split = Boolean(deal.initialPaymentMinor && deal.remainingPaymentMinor);
  return <div className="space-y-6">
    <div><h2 className="text-base font-semibold">Your agreement</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{deal.description || deal.title}</p></div>
    <dl className="grid rounded-xl border sm:grid-cols-2">
      <OverviewFact label={deal.workflowMode === 'delivery' ? 'Delivery date' : 'Completion date'} value={deal.deliveryDueDate}/>
      <OverviewFact label="Payment" value={split ? 'Existing staged agreement' : 'Single release'}/>
    </dl>
    <div className="rounded-xl bg-muted/40 p-4"><h3 className="text-sm font-semibold">Release conditions</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{deal.releaseConditions}</p></div>
    {split && <div className="rounded-xl border p-4 text-sm"><p>First payment: {formatMinorAmount(deal.initialPaymentMinor!,deal.currency)}</p><p className="mt-2">Remaining payment: {formatMinorAmount(deal.remainingPaymentMinor!,deal.currency)}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{deal.nextPaymentReleaseConditions}</p></div>}
    <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Agreement v{deal.agreement.version}</p><Button variant="outline" size="sm" onClick={()=>toast.promise(downloadAgreementDocument(deal),{loading:'Preparing agreement…',success:'Agreement downloaded.',error:'Could not download the agreement.'})}><Download size={14}/>Download</Button></div>
    <AgreementDocument agreement={deal.agreement} collapsible hideAiNote />
  </div>;
}

function OverviewFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b px-4 py-3 last:border-b-0 sm:border-r lg:[&:nth-child(3n)]:border-r-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-5 text-foreground">{value}</dd>
    </div>
  );
}

function ActionsPanel({
  deal,
  youIsReleaser,
  canNegotiate,
  hasDispute,
  disputeBlocksRelease,
  canTerminate,
  terminationLocked,
  terminated,
  deleteUnaccepted,
  onRequestChanges,
  onRaiseDispute,
  onTerminate,
}: {
  deal: SafeDealDetail;
  youIsReleaser: boolean;
  canNegotiate: boolean;
  hasDispute: boolean;
  disputeBlocksRelease: boolean;
  canTerminate: boolean;
  terminationLocked: boolean;
  terminated: boolean;
  deleteUnaccepted: boolean;
  onRequestChanges: () => void;
  onRaiseDispute: () => void;
  onTerminate: () => void;
}) {
  // Release is blocked while a dispute is open.
  const canConfirm = false;
  const releaseClosed =
    deal.funding.status === 'released' ||
    ['release_approved', 'paid_out', 'completed', 'refunded', 'cancelled'].includes(deal.status) ||
    ['release_approved', 'paid_out'].includes(deal.delivery.fundingReview.status);
  const canDispute = !hasDispute && !terminated && !releaseClosed && deal.funding.status === 'funded';
  const disputeUnavailableReason = deal.funding.status === 'unfunded' || deal.funding.status === 'awaiting_transfer'
    ? 'Available after the deal payment is confirmed.'
      : terminated
      ? 'This order has been cancelled.'
      : releaseClosed
        ? 'The Naitrust payment dispute window closed when payment was released.'
        : undefined;

  if (!canConfirm && hasDispute && !canNegotiate && !canTerminate) return null;

  return (
    <Card className="gap-3 p-4 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Actions</p>
      {canNegotiate && (
        <Button variant="outline" className="w-full rounded-full" onClick={onRequestChanges}>
          <GitPullRequestArrow size={16} className="mr-1.5" />
          Request changes
        </Button>
      )}
      {canConfirm && (
        <Button className="w-full rounded-full" onClick={() => toast.info('Milestone and payment instruction confirmed.')}>
          <Check size={16} className="mr-1.5" />
          Confirm milestone and payment instruction
        </Button>
      )}
      {!hasDispute && (
        <Button
          variant="outline"
          className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRaiseDispute}
          disabled={!canDispute}
        >
          <ShieldAlert size={16} className="mr-1.5" />
          Raise a dispute
        </Button>
      )}
      {!hasDispute && !canDispute && disputeUnavailableReason && (
        <p className="text-xs leading-5 text-muted-foreground">{disputeUnavailableReason}</p>
      )}
      {hasDispute && (
        <p className="text-xs leading-5 text-muted-foreground">
          {disputeBlocksRelease
            ? "A dispute is open: release is paused while it's reviewed. See the Dispute tab."
            : 'A report is awaiting buyer evidence. Payment is not frozen yet. See the Dispute tab.'}
        </p>
      )}
      {canTerminate && (
        <Button
          variant="outline"
          className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={terminationLocked}
          onClick={onTerminate}
        >
          {deleteUnaccepted ? <Trash2 size={16} className="mr-1.5" /> : <Ban size={16} className="mr-1.5" />}
          {deleteUnaccepted ? 'Delete deal' : 'Cancel deal'}
        </Button>
      )}
      {canTerminate && terminationLocked && (
        <p className="text-xs leading-5 text-muted-foreground">This deal cannot be cancelled while the handover or payment review countdown is active. Raise a dispute if there is a problem.</p>
      )}
      {!youIsReleaser && deal.funding.status === 'awaiting_transfer' && (
        <p className="text-xs leading-5 text-muted-foreground">
          The buyer funds this deal. You’ll be notified when the deal payment is confirmed.
        </p>
      )}
    </Card>
  );
}

export function TransactionRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: deal, isLoading, isError } = useDealDetail(id);
  const { data: negotiation } = useNegotiation(id);
  const { data: dispute } = useDispute(id);
  const { data: termination } = useTermination(id);
  const propose = useProposeNegotiation(id);
  const openDispute = useOpenDispute(id);
  const addDeliveryEvidence = useAddEvidence(id);
  const requestTermination = useRequestTermination(id);
  const deleteUnacceptedDeal = useDeleteUnacceptedDeal(id);
  const respondTermination = useRespondTermination(id);
  const [showDetails, setShowDetails] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const { data: messages = [] } = useDealMessages(id);
  const [showPropose, setShowPropose] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showDeleteDeal, setShowDeleteDeal] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDeliveryEvidence, setShowDeliveryEvidence] = useState(false);
  const [resendingInvite, setResendingInvite] = useState(false);
  const [deliveryEvidenceKind, setDeliveryEvidenceKind] = useState('Invoice');
  const defaultRoomTab = 'overview';
  const requestedTab = searchParams.get('tab') === 'tracking' ? 'activity' : searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    requestedTab ?? defaultRoomTab,
  );
  const [chatFullscreen, setChatFullscreen] = useState(false);
  useEffect(() => {
    if (requestedTab) setActiveTab(requestedTab);
    else setActiveTab(defaultRoomTab);
  }, [defaultRoomTab, requestedTab]);

  useEffect(() => {
    if (!chatFullscreen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setChatFullscreen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [chatFullscreen]);

  const changeTab = (value: string) => {
    setActiveTab(value);
    const next = new URLSearchParams(searchParams);
    if (value === defaultRoomTab) next.delete('tab');
    else next.set('tab', value);
    setSearchParams(next, { replace: true });
    if (value !== 'chat') setChatFullscreen(false);
  };

  const counterparty = deal?.parties.find((p) => !p.isYou);
  const youParty = deal?.parties.find((p) => p.isYou);
  const viewerIsCreator = youParty?.status === 'creator';
  const canDeleteUnaccepted = Boolean(viewerIsCreator && deal && ['pending_counterparty', 'terms_negotiation'].includes(deal.status));
  const youIsReleaser = youParty?.role === 'buyer';
  const canResendInvite = Boolean(viewerIsCreator && deal?.publicInvitePath && ['pending_counterparty', 'terms_negotiation'].includes(deal.status));
  const invitationUrl = deal?.publicInvitePath ? `${window.location.origin}${deal.publicInvitePath}` : '';
  const copyInvitationLink = async () => {
    if (!invitationUrl) return;
    await navigator.clipboard.writeText(invitationUrl);
    toast.success('Invitation link copied.');
  };
  const resendInvitation = async () => {
    if (!deal || resendingInvite) return;
    setResendingInvite(true);
    try {
      await invitationsApi.resend(deal.id);
      toast.success('Invitation resent successfully.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not resend the invitation.');
    } finally {
      setResendingInvite(false);
    }
  };

  const hasNegotiation = (negotiation?.proposals.length ?? 0) > 0;
  const hasDispute = !!dispute;
  const disputeBlocksRelease = !!dispute && dispute.status !== 'awaiting_evidence';
  const terminationPending = termination?.status === 'requested';
  const terminated = termination?.status === 'accepted';
  const terminationLocked = deal?.workflowMode === 'delivery' && (deal.delivery.handover.status === 'in_progress' || deal.delivery.fundingReview.status === 'in_progress');
  // Anyone on the deal can request termination while it's live and none is pending.
  const canTerminate =
    !!deal &&
    !terminationPending &&
    !terminated &&
    !['paid_out', 'completed', 'refunded', 'cancelled'].includes(deal.status);

  const submitTermination = (reason: string) =>
    requestTermination.mutate(reason, {
      onSuccess: () => {
        setShowTerminate(false);
        toast.info('Cancellation requested: the other party will review your reason.');
      },
    });
  const acceptTermination = () =>
    respondTermination.mutate(
      { accept: true, byName: youParty?.name ?? 'You' },
      { onSuccess: () => toast.success('You agreed to cancel. The order is now closed and recorded.') },
    );
  const rejectTermination = (reason: string) =>
    respondTermination.mutate(
      { accept: false, reason, byName: youParty?.name ?? 'You' },
      {
        onSuccess: () => {
          setShowReject(false);
          toast.info('Cancellation rejected: the deal remains active.');
        },
      },
    );
  // A deal can be renegotiated before it's funded/closed.
  const canNegotiate =
    !!deal &&
    !viewerIsCreator &&
    !hasNegotiation &&
    ['pending_counterparty', 'terms_negotiation', 'terms_agreed', 'awaiting_funding'].includes(deal.status);

  // Negotiation and dispute events surface on the Activity timeline too.
  const mergedActivity: DealActivityEvent[] = deal
    ? [
        ...deal.activity,
        ...messages.filter(message => message.body.startsWith(ACTIVITY_UPDATE_PREFIX)).map(message => ({ id: message.id, kind: 'message' as const, message: `${message.senderName}: ${message.body.slice(ACTIVITY_UPDATE_PREFIX.length)}`, createdAt: message.createdAt })),
        ...(negotiation?.proposals ?? []).map((p) => ({
          id: `neg_${p.id}`,
          kind: 'message' as const,
          message:
            p.status === 'accepted'
              ? `${p.byYou ? 'You' : p.byName} accepted the proposed changes.`
              : `${p.byYou ? 'You' : p.byName} proposed changes to the terms.`,
          createdAt: p.createdAt,
        })),
        ...(dispute
          ? [
              {
                id: `dispute_${dispute.dealId}`,
                kind: 'dispute' as const,
                message: `${dispute.openedByName} opened a dispute: ${dispute.reason}. Release is paused.`,
                createdAt: dispute.createdAt,
              },
            ]
          : []),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <DashboardLayout title="Deal Room">
      <div className="nd-room [&_.shadow-sm]:shadow-none">
        <button
          type="button"
          onClick={() => navigate('/app/deals')}
          className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:text-foreground sm:mb-4 sm:h-auto sm:w-auto sm:justify-start sm:rounded-none sm:border-0"
          aria-label="All deals"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">All deals</span>
        </button>

        {isLoading ? (
          <Card className="flex items-center justify-center p-16 shadow-sm">
            <Spinner size="lg" />
          </Card>
        ) : isError || !deal ? (
          <Card className="flex flex-col items-center gap-3 p-12 text-center shadow-sm">
            <p className="font-semibold text-foreground">Deal not found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              This deal may have been removed or the link is no longer valid.
            </p>
            <Button variant="outline" className="mt-2 rounded-full" onClick={() => navigate('/app/deals')}>
              Back to deals
            </Button>
          </Card>
        ) : (
          <>
            <header className="nd-room-header">
              <div><p className="nd-room-reference">{deal.reference}</p><h1>{deal.title}</h1><p className="nd-room-person">With {counterparty?.name ?? deal.counterpartyName}</p></div>
              <div className="nd-room-amount"><strong>{formatMinorAmount(deal.amountMinor, deal.currency)}</strong><TransactionStatusBadge status={deal.status}/></div>
            </header>
            <div className="nd-room-tools"><Button variant="outline" onClick={()=>setShowDetails(true)}><FileText size={15}/> Deal details</Button><Button variant="ghost" onClick={()=>setShowMore(true)} aria-label="More deal actions"><MoreHorizontal size={18}/> More</Button></div>

            {/* Body */}
            <div className="min-w-0">
              <Tabs value={activeTab} onValueChange={changeTab} className="w-full min-w-0">
                <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-muted/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <TabsTrigger value="overview" aria-label="Overview" className="gap-1.5 text-xs">
                    <ScrollText size={15} className="sm:mr-1.5" />
                    <span>Overview</span>
                  </TabsTrigger>
                  {hasNegotiation && (
                    <TabsTrigger value="negotiations" aria-label="Negotiations" className="gap-1.5 text-xs">
                      <GitPullRequestArrow size={15} className="sm:mr-1.5" />
                      <span>Changes</span>
                    </TabsTrigger>
                  )}
                  {hasDispute && (
                    <TabsTrigger value="dispute" aria-label="Dispute" className="gap-1.5 text-xs">
                      <ShieldAlert size={15} className="sm:mr-1.5" />
                      <span>Dispute</span>
                    </TabsTrigger>
                  )}
                  {termination && (
                    <TabsTrigger value="termination" aria-label="Cancellation" className="gap-1.5 text-xs">
                      <Ban size={15} className="sm:mr-1.5" />
                      <span>Cancellation</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="chat" aria-label="Messages" className="gap-1.5 text-xs">
                    <MessageSquare size={15} className="sm:mr-1.5" />
                    <span>Messages</span>
                  </TabsTrigger>
                  <TabsTrigger value="evidence" aria-label="Evidence" className="gap-1.5 text-xs">
                    <Paperclip size={15} className="sm:mr-1.5" />
                    <span>Evidence</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" aria-label="Activity" className="gap-1.5 text-xs">
                    <CalendarClock size={15} className="sm:mr-1.5" />
                    <span>Activity</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="nd-room-overview">
                  <DealJourney deal={deal} compact/>
                  <FundingPanel deal={deal}/>
                  <LegalReviewPanel deal={deal}/>
                  {youParty && deal.workflowMode === 'delivery' && <DealDeliveryReviewPanel
                    deal={deal}
                    viewerRole={youParty.role}
                  hasDispute={disputeBlocksRelease}
                  onUploadEvidence={(kind) => {
                      setDeliveryEvidenceKind(kind ?? 'Photo');
                      setShowDeliveryEvidence(true);
                    }}
                  />}
                  {youParty && deal.workflowMode !== 'delivery' && <DealServiceCompletionPanel
                    deal={deal}
                    viewerRole={youParty.role}
                    hasDispute={disputeBlocksRelease}
                    onUploadEvidence={() => {
                      setDeliveryEvidenceKind(deal.workflowMode === 'service' ? 'Completion evidence' : 'Milestone evidence');
                      setShowDeliveryEvidence(true);
                    }}
                  />}
                </TabsContent>
                {hasNegotiation && negotiation && (
                  <TabsContent value="negotiations">
                    <Card className="p-5 shadow-sm">
                      <NegotiationPanel deal={deal} negotiation={negotiation as DealNegotiation} canProposeChanges={!viewerIsCreator} />
                    </Card>
                  </TabsContent>
                )}
                {hasDispute && dispute && (
                  <TabsContent value="dispute">
                    <Card className="p-5 shadow-sm">
                      <DisputePanel dealId={deal.id} dispute={dispute} />
                    </Card>
                  </TabsContent>
                )}
                {termination && (
                  <TabsContent value="termination">
                    <Card className="p-5 shadow-sm">
                      <TerminationPanel
                        termination={termination}
                        responding={respondTermination.isPending}
                        onAccept={acceptTermination}
                        onReject={() => setShowReject(true)}
                      />
                    </Card>
                  </TabsContent>
                )}
                <TabsContent value="chat">
                  <Card
                    className={
                      chatFullscreen
                        ? 'fixed inset-0 z-[100] flex h-dvh flex-col gap-0 rounded-none border-0 bg-background p-0 shadow-none'
                        : 'gap-0 overflow-hidden p-0 shadow-sm'
                    }
                  >
                    <div className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <CounterpartyAvatar
                          name={counterparty?.name ?? deal.counterpartyName}
                          className="h-9 w-9 shrink-0 text-xs"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {counterparty?.name ?? deal.counterpartyName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            Protected deal · {deal.reference}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 rounded-full"
                        onClick={() => setChatFullscreen((current) => !current)}
                      >
                        {chatFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        <span className="hidden sm:inline">
                          {chatFullscreen ? 'Return to deal' : 'Open full screen'}
                        </span>
                      </Button>
                    </div>
                    <div className={chatFullscreen ? 'min-h-0 flex-1 px-4 py-3 sm:px-8 lg:px-16' : 'p-5'}>
                      <DealChat
                        dealId={deal.id}
                        counterpartyName={counterparty?.name ?? deal.counterpartyName}
                        className={chatFullscreen ? 'mx-auto h-full max-w-5xl' : undefined}
                      />
                    </div>
                  </Card>
                </TabsContent>
                <TabsContent value="evidence">
                  <Card className="p-5 shadow-sm">
                    <EvidenceTab deal={deal} />
                  </Card>
                </TabsContent>
                <TabsContent value="activity">
                  <Card className="p-5 shadow-sm">
                    <ActivityTab events={mergedActivity} dealId={deal.id} />
                  </Card>
                </TabsContent>
              </Tabs>

            </div>
            <Sheet open={showDetails} onOpenChange={setShowDetails}><SheetContent className="nd-app nd-room-details w-full overflow-y-auto sm:max-w-3xl xl:max-w-5xl"><SheetHeader className="px-5 py-6 pr-12 sm:px-8 sm:pr-12"><SheetTitle>Deal details</SheetTitle><SheetDescription>{deal.reference} · Your agreement and participants.</SheetDescription></SheetHeader><div className="space-y-8 p-5 sm:p-8"><OverviewTab deal={deal}/><PartiesPanel deal={deal}/></div></SheetContent></Sheet>
            <Dialog open={showMore} onOpenChange={setShowMore}><DialogContent className="nd-app nd-room-actions sm:max-w-md"><DialogHeader><DialogTitle>More deal actions</DialogTitle><DialogDescription>{deal.reference}</DialogDescription></DialogHeader>
                <ActionsPanel
                  deal={deal}
                  youIsReleaser={youIsReleaser}
                  canNegotiate={canNegotiate}
                  hasDispute={hasDispute}
                  disputeBlocksRelease={disputeBlocksRelease}
                  canTerminate={canTerminate}
                  terminationLocked={terminationLocked}
                  terminated={terminated}
                  deleteUnaccepted={canDeleteUnaccepted}
                  onRequestChanges={() => { setShowMore(false); setShowPropose(true); }}
                  onRaiseDispute={() => { setShowMore(false); setShowDispute(true); }}
                  onTerminate={() => { setShowMore(false); canDeleteUnaccepted ? setShowDeleteDeal(true) : setShowTerminate(true); }}
                />

              {canResendInvite && <div className="flex gap-2"><Button variant="outline" disabled={resendingInvite} onClick={()=>void resendInvitation()}>Resend invite</Button><Button variant="outline" onClick={()=>void copyInvitationLink()}>Copy invite link</Button></div>}
              {canDeleteUnaccepted && <Button variant="outline" onClick={()=>navigate(`/app/deals/new?edit=${encodeURIComponent(deal.id)}`)}>Edit deal terms</Button>}
              <Button variant="outline" onClick={()=>toast.promise(downloadDealSummaryCard(deal), { loading: 'Preparing summary…', success: 'Summary downloaded.', error: 'Could not download summary.' })}><Download size={15}/> Download summary</Button>
            </DialogContent></Dialog>

            <TerminationReasonModal
              open={showTerminate}
              onOpenChange={setShowTerminate}
              title="Cancel this deal?"
              description="Tell the other party why you want to end this deal. They’ll accept or reject your request."
              submitLabel="Request cancellation"
              destructive
              submitting={requestTermination.isPending}
              onSubmit={submitTermination}
            />
            <Dialog open={showDeleteDeal} onOpenChange={setShowDeleteDeal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete this deal?</DialogTitle>
                  <DialogDescription>No participant has accepted this deal invitation. Deleting it removes the invitation for everyone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDeal(false)}>Keep deal</Button>
                  <Button variant="destructive" disabled={deleteUnacceptedDeal.isPending} onClick={() => deleteUnacceptedDeal.mutate(undefined, { onSuccess: () => { toast.success('Deal deleted.'); navigate('/app/deals', { replace: true }); }, onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not delete this deal.') })}><Trash2 size={15} /> Delete deal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <TerminationReasonModal
              open={showReject}
              onOpenChange={setShowReject}
              title="Reject cancellation"
              description="Let the other party know why you don’t want to cancel this deal."
              submitLabel="Keep deal active"
              submitting={respondTermination.isPending}
              onSubmit={rejectTermination}
            />

            {!viewerIsCreator && <ProposeChangesModal
              open={showPropose}
              onOpenChange={setShowPropose}
              deal={deal}
              submitting={propose.isPending}
              onSubmit={(input) =>
                propose.mutate(input, {
                  onSuccess: () => {
                    setShowPropose(false);
                    toast.success(deal.status === 'terms_negotiation'
                      ? 'Invitation updated and sent back for review.'
                      : 'Change request sent: opened a negotiation.');
                  },
                })
              }
            />}

            <RaiseDisputeModal
              open={showDispute}
              onOpenChange={setShowDispute}
              submitting={openDispute.isPending || addDeliveryEvidence.isPending}
              onSubmit={async ({ evidence, ...input }) => {
                try {
                  await addDeliveryEvidence.mutateAsync({
                    items: evidence,
                    uploadedByName: youParty?.name ?? 'You',
                    uploadedByRole: youParty?.role ?? 'buyer',
                  });
                  await openDispute.mutateAsync({ ...input, hasEvidence: evidence.length > 0 });
                  setShowDispute(false);
                  toast.success(evidence.length > 0
                    ? 'Evidence submitted. Payment is now paused while the dispute is reviewed.'
                    : 'Report opened. Payment will freeze after relevant evidence is uploaded.');
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'The dispute could not be submitted.');
                }
              }}
            />
            <UploadEvidenceModal
              open={showDeliveryEvidence}
              onOpenChange={setShowDeliveryEvidence}
              submitting={addDeliveryEvidence.isPending}
              initialKind={deliveryEvidenceKind}
              onSubmit={({ items }) =>
                addDeliveryEvidence.mutate(
                  { items, uploadedByName: youParty?.name ?? 'You', uploadedByRole: youParty?.role ?? 'buyer' },
                  {
                    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not save evidence. Please try a smaller file.'),
                    onSuccess: () => {
                      setShowDeliveryEvidence(false);
                      toast.success(`${deal.workflowMode === 'delivery' ? 'Product' : deal.workflowMode === 'service' ? 'Work' : 'Milestone'} evidence added to this deal.`);
                    },
                  },
                )
              }
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
