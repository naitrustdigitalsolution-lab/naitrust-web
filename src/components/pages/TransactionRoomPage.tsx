/**
 * TransactionRoomPage
 * The transaction room (`/app/deals/:id`) — the most important screen
 * (guardrails/ui.md). Centered, modern layout: a deal header, a tabbed main
 * column (Overview, Chat between the parties, Evidence, Activity), and a side
 * rail with the Parties panel, partner Funding panel, and contextual actions.
 * Reads the deal detail query; actions are mocked until the backend lands.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  Check,
  Circle,
  Copy,
  Download,
  FileText,
  GitPullRequestArrow,
  Landmark,
  MapPin,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  Repeat,
  ScrollText,
  ShieldAlert,
  Truck,
  Undo2,
  Upload,
  Users,
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
import { DisputePanel } from '../pieces/transaction/DisputePanel';
import { TerminationPanel } from '../pieces/transaction/TerminationPanel';
import { TerminationReasonModal } from '../pieces/transaction/TerminationReasonModal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Spinner from '../ui/spinner';
import {
  useDealDetail,
  useAdvanceTracking,
  useAddTrackingStep,
  useEditTrackingStep,
  useRevertTracking,
  useAddEvidence,
} from '../../hooks/useDealDetail';
import { useNegotiation, useProposeNegotiation } from '../../hooks/useNegotiation';
import { useDispute, useOpenDispute } from '../../hooks/useDispute';
import { useTermination, useRequestTermination, useRespondTermination } from '../../hooks/useTermination';
import { useCases } from '../../libs/use-cases';
import {
  formatMinorAmount,
  getFundingPresentation,
  getPartyStatusPresentation,
  partyModeShort,
  roleLabel,
} from '../../libs/utils/safe-deal-presentation';
import { downloadAgreementDocument, downloadDealSummaryCard } from '../../libs/utils/deal-documents';
import type { DealActivityEvent, SafeDealDetail } from '../../libs/store/types';
import type { DealNegotiation } from '../../libs/store/types';

function SectionHeading({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-3">
      <Icon size={16} className="text-primary" />
      <h2 className="text-sm font-semibold text-foreground">{children}</h2>
    </div>
  );
}

function PartiesPanel({ deal }: { deal: SafeDealDetail }) {
  return (
    <Card className="gap-0 p-0 shadow-sm">
      <SectionHeading icon={Users}>Parties</SectionHeading>
      <ul className="divide-y divide-border">
        {deal.parties.map((party) => {
          const status = getPartyStatusPresentation(party.status);
          return (
            <li key={party.id} className="flex items-center gap-3 px-4 py-3">
              <CounterpartyAvatar name={party.isYou ? 'You' : party.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {party.isYou ? 'You' : party.name}
                  </p>
                  {party.isYou && <Badge variant="outline">You</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {roleLabel(party.role)}
                  {party.allocationMinor
                    ? ` · receives ${formatMinorAmount(party.allocationMinor, deal.currency)}`
                    : ''}
                </p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function FundingPanel({ deal }: { deal: SafeDealDetail }) {
  const { funding } = deal;
  const presentation = getFundingPresentation(funding.status);
  const showAccount = funding.status === 'awaiting_transfer' || funding.status === 'unfunded';

  const copyAccount = () => {
    navigator.clipboard?.writeText(funding.accountNumber).then(
      () => toast.success('Account number copied'),
      () => toast.error('Could not copy'),
    );
  };

  return (
    <Card className="gap-0 p-0 shadow-sm">
      <SectionHeading icon={Landmark}>Protected funding</SectionHeading>
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

        {showAccount ? (
          <div className="rounded-xl border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Pay into this partner virtual account</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-base font-semibold tracking-wide text-foreground">
                {funding.accountNumber}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyAccount} aria-label="Copy account number">
                <Copy size={15} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{funding.accountName}</p>
            <p className="text-xs text-muted-foreground">{funding.bankName}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
            <Check size={15} />
            {funding.status === 'released'
              ? 'Funds have been released to the seller.'
              : 'Funds are protected with the partner.'}
          </div>
        )}

        <p className="text-[0.7rem] leading-4 text-muted-foreground">
          Funds are held by {funding.partner}, a regulated financial provider. Naitrust never holds
          your money directly.
        </p>
      </div>
    </Card>
  );
}

function EvidenceTab({ deal }: { deal: SafeDealDetail }) {
  const [showUpload, setShowUpload] = useState(false);
  const addEvidence = useAddEvidence(deal.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Invoices, waybills, photos, and inspection reports attached to this deal.
        </p>
        <Button variant="outline" size="sm" className="shrink-0 rounded-full" onClick={() => setShowUpload(true)}>
          <Upload size={14} className="mr-1.5" />
          Upload
        </Button>
      </div>

      <UploadEvidenceModal
        open={showUpload}
        onOpenChange={setShowUpload}
        submitting={addEvidence.isPending}
        onSubmit={({ items }) =>
          addEvidence.mutate(
            { items, uploadedByName: 'You' },
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
            Evidence such as invoices, delivery proof, and inspection reports will appear here.
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
  return (
    <div className="space-y-5">
      {deal.description && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </p>
          <p className="text-sm leading-6 text-foreground">{deal.description}</p>
        </div>
      )}

      <dl className="divide-y divide-border rounded-xl border">
        <div className="flex gap-4 px-4 py-3">
          <dt className="w-40 shrink-0 text-sm text-muted-foreground">Delivery due</dt>
          <dd className="text-sm font-medium text-foreground">{deal.deliveryDueDate}</dd>
        </div>
        <div className="flex gap-4 px-4 py-3">
          <dt className="w-40 shrink-0 text-sm text-muted-foreground">Release conditions</dt>
          <dd className="min-w-0 flex-1 text-sm font-medium text-foreground">{deal.releaseConditions}</dd>
        </div>
      </dl>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Agreement
          </p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() =>
              toast.promise(downloadAgreementDocument(deal), {
                loading: 'Preparing agreement PDF…',
                success: 'Agreement downloaded.',
                error: 'Could not generate the PDF.',
              })
            }
          >
            <Download size={14} className="mr-1.5" />
            Download agreement
          </Button>
        </div>
        <AgreementDocument agreement={deal.agreement} scrollable hideAiNote />
      </div>
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
  // Something to revert exists once at least one stage is done.
  const canRevert = deal.milestones.some((m) => m.status === 'done');

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {canUpdate
          ? "You're delivering on this deal — keep the buyer updated as the goods move."
          : 'Delivery is tracked in stages so you stay updated while goods are in transit.'}
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
              disabled={advance.isPending}
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

      <ol className="relative space-y-6 pl-7">
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
      </ol>
    </div>
  );
}

function ActionsPanel({
  deal,
  youIsReleaser,
  canNegotiate,
  hasDispute,
  canTerminate,
  onRequestChanges,
  onRaiseDispute,
  onTerminate,
}: {
  deal: SafeDealDetail;
  youIsReleaser: boolean;
  canNegotiate: boolean;
  hasDispute: boolean;
  canTerminate: boolean;
  onRequestChanges: () => void;
  onRaiseDispute: () => void;
  onTerminate: () => void;
}) {
  // Funding must be done by the party who releases the finance (the buyer).
  const canFund = deal.funding.status === 'awaiting_transfer' && youIsReleaser;
  // Release is blocked while a dispute is open.
  const canConfirm =
    youIsReleaser &&
    !hasDispute &&
    ['funded', 'in_progress', 'evidence_submitted', 'buyer_review'].includes(deal.status);
  const canDispute =
    !hasDispute && !['paid_out', 'completed', 'refunded', 'cancelled', 'draft'].includes(deal.status);

  if (!canFund && !canConfirm && !canDispute && !canNegotiate && !canTerminate) return null;

  return (
    <Card className="gap-3 p-4 shadow-sm">
      <p className="text-sm font-semibold text-foreground">Actions</p>
      {canNegotiate && (
        <Button variant="outline" className="w-full rounded-full" onClick={onRequestChanges}>
          <GitPullRequestArrow size={16} className="mr-1.5" />
          Request changes
        </Button>
      )}
      {canFund && (
        <Button className="w-full rounded-full" onClick={() => toast.info('Funding instructions are in the Protected funding panel.')}>
          <Landmark size={16} className="mr-1.5" />
          Fund this deal
        </Button>
      )}
      {canConfirm && (
        <Button className="w-full rounded-full" onClick={() => toast.info('Confirm delivery & release — coming soon')}>
          <Check size={16} className="mr-1.5" />
          Confirm delivery & release
        </Button>
      )}
      {canDispute && (
        <Button
          variant="outline"
          className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRaiseDispute}
        >
          <ShieldAlert size={16} className="mr-1.5" />
          Raise a dispute
        </Button>
      )}
      {hasDispute && (
        <p className="text-xs leading-5 text-muted-foreground">
          A dispute is open — release is paused while it's reviewed. See the Dispute tab.
        </p>
      )}
      {canTerminate && (
        <Button
          variant="outline"
          className="w-full rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onTerminate}
        >
          <Ban size={16} className="mr-1.5" />
          Terminate deal
        </Button>
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
  const { data: deal, isLoading, isError } = useDealDetail(id);
  const { data: negotiation } = useNegotiation(id);
  const { data: dispute } = useDispute(id);
  const { data: termination } = useTermination(id);
  const propose = useProposeNegotiation(id);
  const openDispute = useOpenDispute(id);
  const requestTermination = useRequestTermination(id);
  const respondTermination = useRespondTermination(id);
  const [showPropose, setShowPropose] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const counterparty = deal?.parties.find((p) => !p.isYou);
  const youParty = deal?.parties.find((p) => p.isYou);
  const youIsReleaser = youParty?.role === 'buyer';
  const youIsSeller = youParty?.role === 'seller';
  const useCaseTitle = useCases.find((u) => u.slug === deal?.useCase)?.title;
  const expired = deal ? new Date(deal.expiresAt).getTime() < Date.now() : false;
  const hasTracking = (deal?.milestones.length ?? 0) > 0;

  const hasNegotiation = (negotiation?.proposals.length ?? 0) > 0;
  const negotiationOpen = negotiation?.status === 'open';
  const hasDispute = !!dispute;
  const disputeOpen = dispute?.status === 'open' || dispute?.status === 'under_review';
  const terminationPending = termination?.status === 'requested';
  const terminated = termination?.status === 'accepted';
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
        toast.info('Termination requested — the other party will review your reason.');
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
          toast.info('Termination rejected — the deal stays active.');
        },
      },
    );
  // A deal can be renegotiated before it's funded/closed.
  const canNegotiate =
    !!deal &&
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
    <DashboardLayout title="Transaction room">
      <div className="mx-auto w-full max-w-9xl">
        <button
          type="button"
          onClick={() => navigate('/app/deals')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          All safe deals
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
              Back to safe deals
            </Button>
          </Card>
        ) : (
          <>
            {/* Header */}
            <Card className="gap-4 p-5 shadow-sm md:p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="flex items-start gap-4">
                  <CounterpartyAvatar
                    name={counterparty?.name ?? deal.counterpartyName}
                    className="h-12 w-12 text-base"
                  />
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">{deal.title}</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {deal.reference} · with {counterparty?.name ?? deal.counterpartyName}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <TransactionStatusBadge status={deal.status} />
                      <Badge variant="outline">{partyModeShort(deal.partyMode)}</Badge>
                      {useCaseTitle && <Badge variant="outline">{useCaseTitle}</Badge>}
                      {deal.dealType === 'milestone' && (
                        <Badge variant="outline" className="gap-1">
                          <Truck size={12} />
                          Tracked
                        </Badge>
                      )}
                      {deal.recurring && (
                        <Badge variant="outline" className="gap-1 text-primary">
                          <Repeat size={12} />
                          Recurring
                        </Badge>
                      )}
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
                <div className="shrink-0 text-left md:text-right">
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {formatMinorAmount(deal.amountMinor, deal.currency)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground md:justify-end">
                    <CalendarClock size={13} />
                    {expired
                      ? 'Invitation expired'
                      : `Open until ${format(new Date(deal.expiresAt), 'MMM d')} · ${formatDistanceToNow(new Date(deal.expiresAt))} left`}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 rounded-full"
                    onClick={() =>
                      toast.promise(downloadDealSummaryCard(deal), {
                        loading: 'Preparing summary PDF…',
                        success: 'Summary card downloaded.',
                        error: 'Could not generate the PDF.',
                      })
                    }
                  >
                    <Download size={14} className="mr-1.5" />
                    Download summary card
                  </Button>
                </div>
              </div>
            </Card>

            {/* Body */}
            <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
              <Tabs defaultValue="overview" className="w-full min-w-0">
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="overview">
                    <ScrollText size={15} className="mr-1.5" />
                    Overview
                  </TabsTrigger>
                  {hasNegotiation && (
                    <TabsTrigger value="negotiations">
                      <GitPullRequestArrow size={15} className="mr-1.5" />
                      Negotiations
                    </TabsTrigger>
                  )}
                  {hasTracking && (
                    <TabsTrigger value="tracking">
                      <Truck size={15} className="mr-1.5" />
                      Tracking
                    </TabsTrigger>
                  )}
                  {hasDispute && (
                    <TabsTrigger value="dispute">
                      <ShieldAlert size={15} className="mr-1.5" />
                      Dispute
                    </TabsTrigger>
                  )}
                  {termination && (
                    <TabsTrigger value="termination">
                      <Ban size={15} className="mr-1.5" />
                      Termination
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="chat">
                    <MessageSquare size={15} className="mr-1.5" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="evidence">
                    <Paperclip size={15} className="mr-1.5" />
                    Evidence
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <CalendarClock size={15} className="mr-1.5" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card className="p-5 shadow-sm">
                    <OverviewTab deal={deal} />
                  </Card>
                </TabsContent>
                {hasNegotiation && negotiation && (
                  <TabsContent value="negotiations">
                    <Card className="p-5 shadow-sm">
                      <NegotiationPanel deal={deal} negotiation={negotiation as DealNegotiation} />
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
                  <Card className="p-5 shadow-sm">
                    <DealChat dealId={deal.id} counterpartyName={counterparty?.name ?? deal.counterpartyName} />
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

              <div className="flex flex-col gap-6">
                <ActionsPanel
                  deal={deal}
                  youIsReleaser={youIsReleaser}
                  canNegotiate={canNegotiate}
                  hasDispute={hasDispute}
                  canTerminate={canTerminate}
                  onRequestChanges={() => setShowPropose(true)}
                  onRaiseDispute={() => setShowDispute(true)}
                  onTerminate={() => setShowTerminate(true)}
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
            <TerminationReasonModal
              open={showReject}
              onOpenChange={setShowReject}
              title="Reject termination"
              description="Let the other party know why you don't want to end this deal."
              submitLabel="Reject request"
              submitting={respondTermination.isPending}
              onSubmit={rejectTermination}
            />

            <ProposeChangesModal
              open={showPropose}
              onOpenChange={setShowPropose}
              deal={deal}
              submitting={propose.isPending}
              onSubmit={(input) =>
                propose.mutate(input, {
                  onSuccess: () => {
                    setShowPropose(false);
                    toast.success('Change request sent — opened a negotiation.');
                  },
                })
              }
            />

            <RaiseDisputeModal
              open={showDispute}
              onOpenChange={setShowDispute}
              submitting={openDispute.isPending}
              onSubmit={(input) =>
                openDispute.mutate(input, {
                  onSuccess: () => {
                    setShowDispute(false);
                    toast.success('Dispute opened — release is paused while it is reviewed.');
                  },
                })
              }
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
