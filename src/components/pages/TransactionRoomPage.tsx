/**
 * TransactionRoomPage
 * The deal room (`/app/deals/:id`): the most important screen
 * (guardrails/ui.md). Centered, modern layout: a deal header, a tabbed main
 * column (Overview, Chat between the parties, Evidence, Activity), and a side
 * rail with the Parties panel, partner Funding panel, and contextual actions.
 * Reads the deal detail query; actions are mocked until the backend lands.
 */

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  Check,
  Circle,
  Copy,
  Download,
  FileText,
  Eye,
  GitPullRequestArrow,
  Landmark,
  MapPin,
  Maximize2,
  MessageSquare,
  Minimize2,
  Paperclip,
  Pencil,
  Plus,
  ScrollText,
  ShieldAlert,
  ScanFace,
  Truck,
  Trash2,
  Undo2,
  Upload,
  Users,
  WalletCards,
  Gift,
  Sparkles,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { TransactionStatusBadge } from '../pieces/dashboard/TransactionStatusBadge';
import { AgreementDocument } from '../pieces/agreement/AgreementDocument';
import { DealChat } from '../pieces/transaction/DealChat';
import { NegotiationPanel } from '../pieces/transaction/NegotiationPanel';
import { ProposeChangesModal } from '../pieces/transaction/ProposeChangesModal';
import { AddTrackingStepModal } from '../pieces/transaction/AddTrackingStepModal';
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
import { PinPromptModal } from '../pieces/security/PinPromptModal';
import Spinner from '../ui/spinner';
import {
  useDealDetail,
  useAdvanceTracking,
  useAddTrackingStep,
  useEditTrackingStep,
  useRevertTracking,
  useAddEvidence,
  useFundDealFromWallet,
} from '../../hooks/useDealDetail';
import { useDeleteUnacceptedDeal } from '../../hooks/useTransactions';
import { useWallet } from '../../hooks/useWallet';
import { useNegotiation, useProposeNegotiation } from '../../hooks/useNegotiation';
import { useDispute, useOpenDispute } from '../../hooks/useDispute';
import { useTermination, useRequestTermination, useRespondTermination } from '../../hooks/useTermination';
import { useCases } from '../../libs/use-cases';
import { WORKFLOW_META } from '../../libs/features/use-case-features';
import {
  formatMinorAmount,
  getFundingPresentation,
  getPartyStatusPresentation,
  partyModeLabel,
  roleLabel,
} from '../../libs/utils/safe-deal-presentation';
import { downloadAgreementDocument, downloadDealSummaryCard } from '../../libs/utils/deal-documents';
import type { DealActivityEvent, SafeDealDetail } from '../../libs/store/types';
import type { DealNegotiation } from '../../libs/store/types';
import { useAuth } from '../../libs/auth-context';
import { accountTypeOf } from '../../libs/utils/account';
import { listMockDealIdentityCaptures, viewMockDealIdentityCapture, type DealIdentityCaptureView } from '../../libs/api/deal-identity-captures.mock';
import { invitationsApi } from '../../libs/api/invitations.api';

const CELEBRATION_EMOJIS = ['🎉', '✨', '🎊', '⭐', '🥳', '💙', '✅', '🎉', '✨', '🎊', '⭐', '🥳'];

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
      <SectionHeading icon={Users}>Parties</SectionHeading>
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
        <p className="flex items-center gap-1.5 text-xs font-semibold"><ScanFace size={14} className="text-primary" /> Live identity for this deal</p>
        {otherCaptures.length ? otherCaptures.map((capture) => (
          <div key={capture.captureId} className="mt-2 rounded-xl border bg-background p-3">
            <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold">{capture.representativeName}</p>{capture.businessName && <p className="text-[11px] text-muted-foreground">{capture.businessName}</p>}<p className="mt-1 text-[11px] text-muted-foreground">{capture.action === 'deal_created' ? 'Created this deal' : 'Accepted this deal'} · {new Date(capture.capturedAt).toLocaleString()}</p></div><Badge variant="success" className="text-[9px]">Confirmed</Badge></div>
            {capture.photoAvailable ? <Button type="button" variant="outline" size="sm" className="mt-2 h-8 rounded-full text-xs" onClick={() => {
              try { setIdentityPhoto(viewMockDealIdentityCapture(deal.id, capture.captureId)); }
              catch (error) { toast.error(error instanceof Error ? error.message : 'Photo unavailable.'); }
            }}><Eye size={13} /> View live photo</Button> : <p className="mt-2 text-[11px] text-muted-foreground">Photo for this deal is not available.</p>}
          </div>
        )) : <p className="mt-2 text-[11px] leading-4 text-muted-foreground">The other participant’s photo for this deal is not available yet.</p>}
      </div>
      <Dialog open={Boolean(identityPhoto)} onOpenChange={(open) => !open && setIdentityPhoto(undefined)}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Live identity for this deal</DialogTitle><DialogDescription>Captured for this Protected Deal. It is not a reusable profile photo.</DialogDescription></DialogHeader>{identityPhoto && <div className="relative overflow-hidden rounded-2xl bg-muted"><img src={identityPhoto.photoDataUrl} alt={`${identityPhoto.representativeName} live identity capture for this deal`} className="aspect-[4/3] w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-[11px] text-white">{identityPhoto.watermark}</div></div>}</DialogContent>
      </Dialog>
    </Card>
  );
}

function FundingPanel({ deal }: { deal: SafeDealDetail }) {
  const { funding } = deal;
  const [showFundingConfirmation, setShowFundingConfirmation] = useState(false);
  const [showFundingPin, setShowFundingPin] = useState(false);
  const wallet = useWallet();
  const fundFromWallet = useFundDealFromWallet(deal.id);
  const presentation = getFundingPresentation(funding.status);
  const showAccount = funding.status === 'awaiting_transfer' || funding.status === 'unfunded';
  const canFund = funding.status === 'awaiting_transfer'
    && deal.parties.some((party) => party.isYou && party.role === 'buyer');
  const walletBalance = wallet.data?.balance.availableMinor ?? 0;
  const walletHasEnough = walletBalance >= funding.amountExpectedMinor;
  const shortfallMinor = Math.max(0, funding.amountExpectedMinor - walletBalance);
  const balanceAccount = wallet.data?.virtualAccount;

  const copyBalanceAccount = () => {
    if (!balanceAccount) return;
    navigator.clipboard?.writeText(balanceAccount.accountNumber).then(
      () => toast.success('Naitrust account number copied.'),
      () => toast.error('Could not copy the account number.'),
    );
  };

  const confirmFundingWithPin = () => {
    setShowFundingPin(false);
    fundFromWallet.mutate(undefined, {
      onSuccess: () => toast.success(`${formatMinorAmount(funding.amountExpectedMinor, funding.currency)} is now protected for ${deal.title}.`),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <>
    <Card className="gap-0 p-0 shadow-sm">
      <SectionHeading icon={canFund ? WalletCards : Landmark}>{canFund ? 'Protect payment' : 'Payment status'}</SectionHeading>
      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={presentation.variant}>{presentation.label}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {formatMinorAmount(funding.amountExpectedMinor, funding.currency)}
          </span>
        </div>

        {showAccount ? canFund ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold"><WalletCards size={15} className="text-primary"/> Available balance</p>
                  <p className="mt-1 text-xs text-muted-foreground">Available {formatMinorAmount(walletBalance, funding.currency)}</p>
                </div>
              </div>
              {walletHasEnough ? (
                <Button className="mt-3 w-full rounded-full" disabled={wallet.isLoading || fundFromWallet.isPending} onClick={() => setShowFundingConfirmation(true)}>
                  {fundFromWallet.isPending ? 'Protecting payment…' : 'Pay from available balance'}
                </Button>
              ) : !wallet.isLoading && (
                <div className="mt-3">
                  <p className="text-xs text-destructive">Add {formatMinorAmount(shortfallMinor, funding.currency)} to protect this payment from your balance.</p>
                </div>
              )}
              {!walletHasEnough && balanceAccount && <div className="mt-3 border-t pt-3">
                <p className="text-[11px] font-medium text-muted-foreground">Add money to your Naitrust balance</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-base font-semibold tracking-wide">{balanceAccount.accountNumber}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={copyBalanceAccount} aria-label="Copy Naitrust account number"><Copy size={14}/></Button>
                </div>
                <p className="text-xs text-muted-foreground">{balanceAccount.accountName} · {balanceAccount.bankName}</p>
              </div>}
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">Waiting for the buyer to protect this payment.</p>
        ) : (
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-[11px] leading-4 text-emerald-700 dark:text-emerald-400">
            <Check size={13} className="shrink-0" />
            {funding.status === 'released'
              ? 'Funds have been released to the seller.'
              : `Protected with Naitrust’s regulated financial partner, ${funding.partner}.`}
          </div>
        )}
      </div>
    </Card>
    <Dialog open={showFundingConfirmation} onOpenChange={setShowFundingConfirmation}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Protect this payment?</DialogTitle>
          <DialogDescription>
            You are about to place {formatMinorAmount(funding.amountExpectedMinor, funding.currency)} into “{deal.title}” from your available balance.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Available balance</span><span className="font-semibold tabular-nums">{formatMinorAmount(walletBalance, funding.currency)}</span></div>
          <div className="mt-2 flex justify-between gap-4"><span className="text-muted-foreground">Balance after payment</span><span className="font-semibold tabular-nums">{formatMinorAmount(walletBalance - funding.amountExpectedMinor, funding.currency)}</span></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowFundingConfirmation(false)}>Decline</Button>
          <Button onClick={() => { setShowFundingConfirmation(false); setShowFundingPin(true); }}>Accept and continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <PinPromptModal
      open={showFundingPin}
      onOpenChange={setShowFundingPin}
      onVerified={confirmFundingWithPin}
      title="Confirm protected payment"
      description={`Enter your transaction PIN to place ${formatMinorAmount(funding.amountExpectedMinor, funding.currency)} into “${deal.title}”.`}
    />
    </>
  );
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
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Preview document">
                    <a href={item.fileUrl} target="_blank" rel="noreferrer">
                      <Eye size={16} />
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Download document">
                    <a href={item.fileUrl} download={item.fileName}>
                      <Download size={16} />
                    </a>
                  </Button>
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

function ActivityTab({ events }: { events: DealActivityEvent[] }) {
  return (
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
    </ol>
  );
}

function OverviewTab({ deal }: { deal: SafeDealDetail }) {
  const hasSplitPayment = Boolean(deal.initialPaymentMinor && deal.remainingPaymentMinor);
  const useCase = useCases.find((item) => item.slug === deal.useCase);
  const buyer = deal.parties.find((party) => party.role === 'buyer');
  const sellers = deal.parties.filter((party) => party.role === 'seller');
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-primary/15 sm:rounded-2xl sm:bg-gradient-to-br sm:from-primary/[0.08] sm:via-background sm:to-background">
        <div className="hidden p-5 sm:block sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Deal at a glance</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">The agreed structure, participants, delivery timing, and release controls in one view.</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-muted-foreground">Protected amount</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{formatMinorAmount(deal.amountMinor, deal.currency)}</p>
            </div>
          </div>
        </div>
        <dl className="grid border-t bg-background/70 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewFact label="What you're protecting" value={useCase?.title ?? deal.useCase} />
          <OverviewFact label="Payment release setup" value="Single release" />
          <OverviewFact label="Who's involved" value={partyModeLabel(deal.partyMode)} />
          <OverviewFact label="Buyer" value={buyer?.name ?? 'Not available'} />
          <OverviewFact label={sellers.length > 1 ? 'Sellers' : 'Seller'} value={sellers.map((party) => party.name).join(', ') || 'Not available'} />
          <OverviewFact label="Delivery or completion" value={deal.deliveryDueDate} />
          <OverviewFact label="Handover check" value="10 minutes" />
          <OverviewFact label="Payment review" value="1 hour after handover" />
          <OverviewFact label="Agreement" value={`v${deal.agreement.version} · ${deal.agreement.sections.length} clauses`} />
        </dl>
      </div>

      {deal.description && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </p>
          <p className="text-sm leading-6 text-foreground">{deal.description}</p>
        </div>
      )}

      {hasSplitPayment && deal.activePaymentStage === 2 && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles size={17} /></span>
          <div><p className="text-sm font-semibold">Second payment is now active</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The first allocation reached the seller successfully. The remaining allocation is ready for its own funding, delivery checks, and release review.</p></div>
        </div>
      )}

      <details className="rounded-xl border sm:hidden">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Release conditions</summary>
        <p className="border-t px-4 py-3 text-xs leading-5 text-muted-foreground">{deal.releaseConditions}</p>
        {hasSplitPayment && deal.nextPaymentReleaseConditions && <p className="border-t px-4 py-3 text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Next payment: </span>{deal.nextPaymentReleaseConditions}</p>}
      </details>
      <dl className="hidden divide-y divide-border rounded-xl border sm:block">
        {hasSplitPayment && (
          <div className="grid gap-3 px-4 py-3 sm:grid-cols-[160px_1fr_1fr] sm:items-center">
            <dt className="text-sm text-muted-foreground">Payment allocation</dt>
            <dd><span className="flex items-center gap-2 text-xs text-muted-foreground">First payment <Badge variant={deal.activePaymentStage === 2 ? 'success' : 'default'} className="px-1.5 py-0 text-[9px]">{deal.activePaymentStage === 2 ? 'Released' : 'Active'}</Badge></span><span className="text-sm font-semibold tabular-nums">{formatMinorAmount(deal.initialPaymentMinor!, deal.currency)}</span></dd>
            <dd><span className="flex items-center gap-2 text-xs text-muted-foreground">Remaining <Badge variant={deal.activePaymentStage === 2 ? 'default' : 'outline'} className="px-1.5 py-0 text-[9px]">{deal.activePaymentStage === 2 ? 'Active' : 'Locked'}</Badge></span><span className="text-sm font-semibold tabular-nums">{formatMinorAmount(deal.remainingPaymentMinor!, deal.currency)}</span></dd>
          </div>
        )}
        <div className="flex gap-4 px-4 py-3">
          <dt className="w-40 shrink-0 text-sm text-muted-foreground">{hasSplitPayment ? 'First payment release' : 'Release conditions'}</dt>
          <dd className="min-w-0 flex-1 text-sm font-medium text-foreground text-justify">{deal.releaseConditions}</dd>
        </div>
        {hasSplitPayment && deal.nextPaymentReleaseConditions && (
          <div className="flex gap-4 px-4 py-3">
            <dt className="w-40 shrink-0 text-sm text-muted-foreground">Next payment unlock</dt>
            <dd className="min-w-0 flex-1 text-sm font-medium text-foreground">{deal.nextPaymentReleaseConditions}</dd>
          </div>
        )}
      </dl>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Agreement
          </p>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 rounded-full p-0 sm:w-auto sm:px-3"
            aria-label="Download agreement"
            onClick={() =>
              toast.promise(downloadAgreementDocument(deal), {
                loading: 'Preparing agreement PDF…',
                success: 'Agreement downloaded.',
                error: 'Could not generate the PDF.',
              })
            }
          >
            <Download size={14} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Download agreement</span>
          </Button>
        </div>
        <AgreementDocument agreement={deal.agreement} scrollable hideAiNote collapsible />
      </div>
    </div>
  );
}

function OverviewFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b px-4 py-3 last:border-b-0 sm:border-r lg:[&:nth-child(3n)]:border-r-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-5 text-foreground">{value}</dd>
    </div>
  );
}

function MilestoneTracking({ deal, canUpdate }: { deal: SafeDealDetail; canUpdate: boolean }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<{ id: string; title: string; description?: string } | null>(null);
  const advance = useAdvanceTracking(deal.id);
  const addStep = useAddTrackingStep(deal.id);
  const editStep = useEditTrackingStep(deal.id);
  const revert = useRevertTracking(deal.id);
  const hasNext = deal.milestones.some((m) => m.status === 'current' || m.status === 'pending');
  const nextStage = deal.milestones.find((m) => m.status === 'current' || m.status === 'pending');
  const needsDeliveryCode = nextStage?.title === 'Dispatched' && deal.delivery.card?.status !== 'active';
  const requiresBuyerConfirmation = nextStage?.title === 'Delivered & confirmed';
  // Something to revert exists once at least one stage is done.
  const canRevert = deal.milestones.some((m) => m.status === 'done');

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {canUpdate
          ? "Keep the buyer informed by adding only the delivery or work updates that apply to this deal."
          : 'Updates added by the seller will appear here with their supporting evidence.'}
      </p>

      {canUpdate && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <span className="mr-auto text-sm font-medium text-foreground">Update tracking</span>
          {hasNext && (
            <Button
              size="sm"
              className="rounded-full"
              onClick={() =>
                advance.mutate(undefined, {
                  onSuccess: () => toast.success('Tracking advanced.'),
                })
              }
              disabled={advance.isPending || needsDeliveryCode || requiresBuyerConfirmation}
            >
              <MapPin size={14} className="mr-1.5" />
              Mark "{nextStage?.title}" done
            </Button>
          )}
          {canRevert && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() =>
                revert.mutate(undefined, {
                  onSuccess: () => toast.success('Stepped tracking back one stage.'),
                })
              }
              disabled={revert.isPending}
            >
              <Undo2 size={14} className="mr-1.5" />
              Revert last update
            </Button>
          )}
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="mr-1.5" />
            Add custom step
          </Button>
          {needsDeliveryCode && <p className="basis-full text-right text-[11px] text-muted-foreground">Create the buyer's delivery code before marking this order as dispatched.</p>}
          {requiresBuyerConfirmation && <p className="basis-full text-right text-[11px] text-muted-foreground">Only the buyer can complete delivery confirmation using the handover code.</p>}
        </div>
      )}

      <AddTrackingStepModal
        open={showAdd}
        onOpenChange={setShowAdd}
        submitting={addStep.isPending}
        steps={deal.milestones}
        onSubmit={(step, afterStepId) =>
          addStep.mutate(
            { ...step, afterStepId },
            {
              onSuccess: () => {
                setShowAdd(false);
                toast.success('Tracking update posted.');
              },
            },
          )
        }
      />

      <AddTrackingStepModal
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        mode="edit"
        submitting={editStep.isPending}
        initial={editing ? { title: editing.title, description: editing.description } : undefined}
        onSubmit={(step) => {
          if (!editing) return;
          editStep.mutate(
            { stepId: editing.id, ...step },
            {
              onSuccess: () => {
                setEditing(null);
                toast.success('Tracking step updated.');
              },
            },
          );
        }}
      />

      {deal.milestones.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-5 py-8 text-center">
          <Truck size={22} className="mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-foreground">No tracking updates yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
            {canUpdate ? 'Add an update when there is relevant delivery or work progress to share.' : 'The seller has not posted a delivery or work update for this deal.'}
          </p>
        </div>
      ) : <ol className="relative space-y-6 pl-7">
        <span className="absolute left-[9px] top-2 bottom-2 w-px bg-border" aria-hidden />
        {deal.milestones.map((ms) => {
          const done = ms.status === 'done';
          const current = ms.status === 'current';
          return (
            <li key={ms.id} className="relative">
              <span className="absolute -left-7 top-0.5 flex h-5 w-5 items-center justify-center">
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check size={12} />
                  </span>
                ) : current ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary">
                    <MapPin size={11} className="text-primary" />
                  </span>
                ) : (
                  <Circle size={18} className="text-border" />
                )}
              </span>
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${current ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {ms.title}
                  {current && <span className="ml-2 text-xs font-medium text-primary">In progress</span>}
                </p>
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => setEditing({ id: ms.id, title: ms.title, description: ms.description })}
                    className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Edit step ${ms.title}`}
                  >
                    <Pencil size={11} />
                    Edit
                  </button>
                )}
              </div>
              {ms.description && <p className="mt-0.5 text-sm text-muted-foreground">{ms.description}</p>}
              {ms.at && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {ms.updatedByName ? `${ms.updatedByName} · ` : ''}
                  {format(new Date(ms.at), 'MMM d, h:mm a')}
                </p>
              )}
            </li>
          );
        })}
      </ol>}
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
    ? 'Available after the protected payment is received.'
    : terminated
      ? 'This deal has been terminated.'
      : releaseClosed
        ? 'The Naitrust payment-dispute window closed when payment was released.'
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
          {deleteUnaccepted ? 'Delete deal' : 'Terminate deal'}
        </Button>
      )}
      {canTerminate && terminationLocked && (
        <p className="text-xs leading-5 text-muted-foreground">This deal cannot be terminated while the handover or funding-review countdown is active. Raise a dispute if there is a problem.</p>
      )}
      {!youIsReleaser && deal.funding.status === 'awaiting_transfer' && (
        <p className="text-xs leading-5 text-muted-foreground">
          The buyer funds this deal. You'll be notified once payment is protected.
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
  const [showPropose, setShowPropose] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showDeleteDeal, setShowDeleteDeal] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDeliveryEvidence, setShowDeliveryEvidence] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [resendingInvite, setResendingInvite] = useState(false);
  const [deliveryEvidenceKind, setDeliveryEvidenceKind] = useState('Invoice');
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(requestedTab === 'chat' ? 'chat' : 'overview');
  const [chatFullscreen, setChatFullscreen] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(() => {
    if (!id || typeof window === 'undefined') return false;
    try {
      const claimed = JSON.parse(localStorage.getItem('naitrust_mock_claimed_deal_rewards') || '[]') as string[];
      return claimed.includes(id);
    } catch {
      return false;
    }
  });

  const claimCompletionReward = () => {
    if (!id || rewardClaimed) return;
    const rewardPoints = deal?.parties.find((party) => party.isYou)?.role === 'buyer' ? 300 : 100;
    let claimed: string[] = [];
    try { claimed = JSON.parse(localStorage.getItem('naitrust_mock_claimed_deal_rewards') || '[]') as string[]; } catch { /* start a fresh mock list */ }
    localStorage.setItem('naitrust_mock_claimed_deal_rewards', JSON.stringify([...new Set([...claimed, id])]));
    const currentPoints = Number(localStorage.getItem('naitrust_mock_reward_points') || 0);
    localStorage.setItem('naitrust_mock_reward_points', String(currentPoints + rewardPoints));
    let rewardAmounts: Record<string, number> = {};
    try { rewardAmounts = JSON.parse(localStorage.getItem('naitrust_mock_deal_reward_amounts') || '{}') as Record<string, number>; } catch { /* start a fresh reward map */ }
    localStorage.setItem('naitrust_mock_deal_reward_amounts', JSON.stringify({ ...rewardAmounts, [id]: rewardPoints }));
    setRewardClaimed(true);
    toast.success(`${rewardPoints} Naitrust reward points claimed`);
  };

  useEffect(() => {
    if (requestedTab === 'chat') setActiveTab('chat');
  }, [requestedTab]);

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
    if (value === 'overview') next.delete('tab');
    else next.set('tab', value);
    setSearchParams(next, { replace: true });
    if (value !== 'chat') setChatFullscreen(false);
  };

  const counterparty = deal?.parties.find((p) => !p.isYou);
  const youParty = deal?.parties.find((p) => p.isYou);
  const viewerIsCreator = youParty?.status === 'creator';
  const canDeleteUnaccepted = Boolean(viewerIsCreator && deal && ['pending_counterparty', 'terms_negotiation'].includes(deal.status));
  const youIsReleaser = youParty?.role === 'buyer';
  const youIsSeller = youParty?.role === 'seller';
  const completionRewardPoints = youIsSeller ? 100 : 300;
  const viewerIsBusiness = accountTypeOf(user) === 'business';
  const useCaseTitle = useCases.find((u) => u.slug === deal?.useCase)?.title;
  const expired = deal ? new Date(deal.expiresAt).getTime() < Date.now() : false;
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
  // Tracking describes delivery/work progress and is independent of how the
  // protected payment releases. Single-release deals still need seller
  // updates for the buyer.
  const hasTracking = deal?.workflowMode === 'delivery' || deal?.workflowMode === 'milestone';

  const hasNegotiation = (negotiation?.proposals.length ?? 0) > 0;
  const negotiationOpen = negotiation?.status === 'open';
  const hasDispute = !!dispute;
  const disputeBlocksRelease = !!dispute && dispute.status !== 'awaiting_evidence';
  const disputeOpen = dispute?.status === 'open' || dispute?.status === 'under_review';
  const terminationPending = termination?.status === 'requested';
  const terminated = termination?.status === 'accepted';
  const terminationLocked = deal?.workflowMode === 'delivery' && (deal.delivery.handover.status === 'in_progress' || deal.delivery.fundingReview.status === 'in_progress');
  // Anyone on the deal can request termination while it's live and none is pending.
  const canTerminate =
    !!deal &&
    !terminationPending &&
    !terminated &&
    !['paid_out', 'completed', 'refunded', 'cancelled'].includes(deal.status);

  useEffect(() => {
    if (!id || !deal || !youIsSeller || !viewerIsBusiness || !['paid_out', 'completed'].includes(deal.status)) return;
    const storageKey = `naitrust:completed-deal-celebration:${user?.id ?? 'business'}:${id}`;
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, 'shown');
    setShowCompletionModal(true);
    setShowCelebration(true);
    const timer = window.setTimeout(() => setShowCelebration(false), 4_500);
    return () => window.clearTimeout(timer);
  }, [deal, id, user?.id, viewerIsBusiness, youIsSeller]);

  const submitTermination = (reason: string) =>
    requestTermination.mutate(reason, {
      onSuccess: () => {
        setShowTerminate(false);
        toast.info('Termination requested: the other party will review your reason.');
      },
    });
  const acceptTermination = () =>
    respondTermination.mutate(
      { accept: true, byName: youParty?.name ?? 'You' },
      { onSuccess: () => toast.success('You agreed to terminate. The deal is now ended and recorded.') },
    );
  const rejectTermination = (reason: string) =>
    respondTermination.mutate(
      { accept: false, reason, byName: youParty?.name ?? 'You' },
      {
        onSuccess: () => {
          setShowReject(false);
          toast.info('Termination rejected: the deal stays active.');
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
    <DashboardLayout title="Protected Deal">
      {showCelebration && (
        <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden="true">
          {CELEBRATION_EMOJIS.map((emoji, index) => (
            <motion.span
              key={`${emoji}-${index}`}
              initial={{ y: -80, x: 0, rotate: 0, opacity: 0 }}
              animate={{ y: '110vh', x: index % 2 === 0 ? 45 : -45, rotate: index % 2 === 0 ? 540 : -540, opacity: [0, 1, 1, 0.9] }}
              transition={{ duration: 3.2 + (index % 4) * 0.35, delay: index * 0.12, ease: 'easeIn' }}
              className="absolute top-0 text-2xl drop-shadow-sm sm:text-3xl"
              style={{ left: `${5 + index * 8}%` }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      )}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="overflow-hidden sm:max-w-md">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-emerald-500/12 to-transparent" />
          <DialogHeader className="relative items-center text-center sm:text-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-3xl">🎉</div>
            <DialogTitle className="text-xl">Transaction completed successfully</DialogTitle>
            <DialogDescription className="max-w-sm leading-6">
              The protected payment has reached the seller account and this deal is now complete.
            </DialogDescription>
          </DialogHeader>
          <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600"><Sparkles size={17} /></span>
              <div><p className="text-sm font-semibold">Your business history increased</p><p className="mt-1 text-xs leading-5 text-muted-foreground">This successful Protected Deal was added to your completed-transaction activity and strengthens your Trust Profile. Your {completionRewardPoints}-point completion reward is also ready to claim.</p></div>
            </div>
          </div>
          <DialogFooter className="relative gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCompletionModal(false)}>Done</Button>
            <Button onClick={() => navigate('/app/trust-profile')}><Sparkles size={15} /> View Trust Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mx-auto w-full max-w-9xl [&_.shadow-sm]:shadow-none">
        <button
          type="button"
          onClick={() => navigate('/app/deals')}
          className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:text-foreground sm:mb-4 sm:h-auto sm:w-auto sm:justify-start sm:rounded-none sm:border-0"
          aria-label="All Protected Deals"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">All Protected Deals</span>
        </button>

        {isLoading ? (
          <Card className="flex items-center justify-center p-16 shadow-sm">
            <Spinner size="lg" />
          </Card>
        ) : isError || !deal ? (
          <Card className="flex flex-col items-center gap-3 p-12 text-center shadow-sm">
            <p className="font-semibold text-foreground">Deal not found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              This transaction may have been removed or the link is no longer valid.
            </p>
            <Button variant="outline" className="mt-2 rounded-full" onClick={() => navigate('/app/deals')}>
              Back to Protected Deals
            </Button>
          </Card>
        ) : (
          <>
            {/* Header */}
            <Card className="gap-3 rounded-none border-x-0 p-0 pb-3 shadow-none sm:rounded-2xl sm:border-x sm:p-4 md:p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:flex md:justify-between md:gap-4">
                <div className="flex items-start gap-3">
                  <CounterpartyAvatar
                    name={counterparty?.name ?? deal.counterpartyName}
                    className="hidden h-10 w-10 text-sm sm:flex"
                  />
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl">{deal.title}</h1>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground md:text-sm">
                      {counterparty?.name ?? deal.counterpartyName}<span className="hidden sm:inline"> · {deal.reference}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <TransactionStatusBadge status={deal.status} />
                      {useCaseTitle && <Badge variant="outline" className="hidden sm:inline-flex">{useCaseTitle}</Badge>}
                      {negotiationOpen && (
                        <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400">
                          <GitPullRequestArrow size={12} />
                          Negotiating
                        </Badge>
                      )}
                      {disputeOpen && (
                        <Badge variant="destructive" className="gap-1">
                          <ShieldAlert size={12} />
                          Disputed
                        </Badge>
                      )}
                      {terminated ? (
                        <Badge variant="destructive" className="gap-1">
                          <Ban size={12} />
                          Terminated
                        </Badge>
                      ) : terminationPending ? (
                        <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400">
                          <Ban size={12} />
                          Termination requested
                        </Badge>
                      ) : null}
                    </div>
                    {deal.previousReference && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Continues {deal.previousReference} · a new deal will be created when this
                        one completes.
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right md:border-0 md:pt-0">
                  <p className="text-base font-bold text-foreground tabular-nums sm:text-xl md:text-2xl">
                    {formatMinorAmount(deal.amountMinor, deal.currency)}
                  </p>
                  <p className="mt-1 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex md:justify-end">
                    <CalendarClock size={13} />
                    {expired
                      ? 'Invitation expired'
                      : `Open until ${format(new Date(deal.expiresAt), 'MMM d')} · ${formatDistanceToNow(new Date(deal.expiresAt))} left`}
                  </p>
                  <div className="mt-2 flex flex-wrap justify-end gap-1.5 sm:mt-3 sm:gap-2">
                  {canResendInvite && <>
                    <Button size="sm" variant="outline" className="rounded-full" disabled={resendingInvite} onClick={() => void resendInvitation()}><Send size={14} />{resendingInvite ? 'Resending…' : 'Resend invite'}</Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => void copyInvitationLink()} aria-label="Copy invitation link" title="Copy invitation link"><Copy size={14} /></Button>
                  </>}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 rounded-full p-0 text-muted-foreground sm:w-auto sm:px-3"
                    aria-label="Download deal summary"
                    onClick={() =>
                      toast.promise(downloadDealSummaryCard(deal), {
                        loading: 'Preparing summary PDF…',
                        success: 'Summary card downloaded.',
                        error: 'Could not generate the PDF.',
                      })
                    }
                  >
                    <Download size={14} className="sm:mr-1.5" />
                    <span className="hidden sm:inline">Summary</span>
                  </Button>
                  {deal.parties.some((party) => party.isYou && party.status === 'creator') && ['pending_counterparty', 'terms_negotiation'].includes(deal.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => navigate(`/app/deals/new?edit=${encodeURIComponent(deal.id)}`)}
                    >
                      <Pencil size={14} className="mr-1.5" />
                      Edit deal
                    </Button>
                  )}
                  </div>
                </div>
              </div>
            </Card>

            {(deal.status === 'completed' || deal.status === 'paid_out') && (
              <Card className="mt-4 overflow-hidden border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.08] via-card to-primary/[0.06] p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">{rewardClaimed ? <Sparkles size={18} /> : <Gift size={18} />}</span>
                        <div><p className="text-sm font-semibold">{rewardClaimed ? 'Completion reward claimed' : 'Your completion reward is ready'}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{rewardClaimed ? `${completionRewardPoints} reward points were added for this completed Protected Deal.` : `Claim ${completionRewardPoints} reward points for successfully completing this Protected Deal.`}</p></div>
                  </div>
                  <Button size="sm" className="rounded-full sm:shrink-0" disabled={rewardClaimed} onClick={claimCompletionReward}>{rewardClaimed ? <Check size={15} /> : <Gift size={15} />}{rewardClaimed ? 'Claimed' : 'Claim reward'}</Button>
                </div>
              </Card>
            )}

            {/* Body */}
            <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <Tabs value={activeTab} onValueChange={changeTab} className="w-full min-w-0">
                <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-muted/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <TabsTrigger value="overview" aria-label="Overview">
                    <ScrollText size={15} className="sm:mr-1.5" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  {hasNegotiation && (
                    <TabsTrigger value="negotiations" aria-label="Negotiations">
                      <GitPullRequestArrow size={15} className="sm:mr-1.5" />
                      <span className="hidden sm:inline">Negotiations</span>
                    </TabsTrigger>
                  )}
                  {hasTracking && (
                    <TabsTrigger value="tracking" aria-label="Tracking">
                      <Truck size={15} className="sm:mr-1.5" />
                      <span className="hidden sm:inline">{deal ? WORKFLOW_META[deal.workflowMode].tabLabel : 'Progress'}</span>
                    </TabsTrigger>
                  )}
                  {hasDispute && (
                    <TabsTrigger value="dispute" aria-label="Dispute">
                      <ShieldAlert size={15} className="sm:mr-1.5" />
                      <span className="hidden sm:inline">Dispute</span>
                    </TabsTrigger>
                  )}
                  {termination && (
                    <TabsTrigger value="termination" aria-label="Termination">
                      <Ban size={15} className="sm:mr-1.5" />
                      <span className="hidden sm:inline">Termination</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="chat" aria-label="Messages">
                    <MessageSquare size={15} className="sm:mr-1.5" />
                    <span className="hidden sm:inline">Messages</span>
                  </TabsTrigger>
                  <TabsTrigger value="evidence" aria-label="Evidence">
                    <Paperclip size={15} className="sm:mr-1.5" />
                    <span className="hidden sm:inline">Evidence</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" aria-label="Activity">
                    <CalendarClock size={15} className="sm:mr-1.5" />
                    <span className="hidden sm:inline">Activity</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
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
                  <Card className="rounded-none border-x-0 p-0 pt-4 shadow-sm sm:rounded-xl sm:border-x sm:p-5">
                    <OverviewTab deal={deal} />
                  </Card>
                </TabsContent>
                {hasNegotiation && negotiation && (
                  <TabsContent value="negotiations">
                    <Card className="p-5 shadow-sm">
                      <NegotiationPanel deal={deal} negotiation={negotiation as DealNegotiation} canProposeChanges={!viewerIsCreator} />
                    </Card>
                  </TabsContent>
                )}
                {hasTracking && (
                  <TabsContent value="tracking">
                    <Card className="p-5 shadow-sm">
                      <MilestoneTracking deal={deal} canUpdate={youIsSeller} />
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
                            Protected Deal · {deal.reference}
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
                    <ActivityTab events={mergedActivity} />
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col gap-4">
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
                  onRequestChanges={() => setShowPropose(true)}
                  onRaiseDispute={() => setShowDispute(true)}
                  onTerminate={() => canDeleteUnaccepted ? setShowDeleteDeal(true) : setShowTerminate(true)}
                />
                <PartiesPanel deal={deal} />
                <FundingPanel deal={deal} />
              </div>
            </div>

            <TerminationReasonModal
              open={showTerminate}
              onOpenChange={setShowTerminate}
              title="Terminate this deal?"
              description="Tell the other party why you want to end this deal. They'll accept or reject your request."
              submitLabel="Request termination"
              destructive
              submitting={requestTermination.isPending}
              onSubmit={submitTermination}
            />
            <Dialog open={showDeleteDeal} onOpenChange={setShowDeleteDeal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete this deal?</DialogTitle>
                  <DialogDescription>No participant has accepted this invitation. Are you sure you want to delete it? This removes the invitation for everyone.</DialogDescription>
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
              title="Reject termination"
              description="Let the other party know why you don't want to end this deal."
              submitLabel="Reject request"
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
                    onSuccess: () => {
                      setShowDeliveryEvidence(false);
                      toast.success(`${deal.workflowMode === 'delivery' ? 'Product' : deal.workflowMode === 'service' ? 'Work' : 'Milestone'} evidence added to this Protected Deal.`);
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
