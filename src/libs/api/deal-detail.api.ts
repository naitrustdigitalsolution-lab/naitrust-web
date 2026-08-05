/**
 * Deal Detail API
 * Provides the full transaction-room view of a safe deal. In mock mode the
 * detail is synthesized from the deal summary in `transactions.json`: parties,
 * partner funding, evidence, agreement, and an activity timeline are derived
 * from the deal's status so every deal opens a coherent room. The real backend
 * returns this shape directly from GET /transactions/:id.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ApiSuccess } from './types';
import type {
  DealActivityEvent,
  DealEvidenceItem,
  DealFunding,
  DealMilestone,
  DealParty,
  DeliveryHandoverPreview,
  FundingStatus,
  MilestoneStatus,
  SafeDealDetail,
} from '../store/types';
import type { AgreementDraft, DealType, SafeDealStatus, SafeDealSummary } from '../store/types';
import type { CreateSafeDealInput, DealRole } from '../store/types';
import { formatMinorAmount } from '../utils/safe-deal-presentation';
import mockTransactions from '../../mocks/apis/transactions.json';
import {
  approveEarlyRelease,
  completeHandoverReview,
  confirmDeliveryReceipt,
  generateDeliveryCard,
  invalidateDeliveryCard,
  reconcileDeliveryLifecycle,
  resolveDeliveryToken,
  type DeliveryDealContext,
} from './delivery-review.mock';
import {
  findMockCreatedDeal,
  getMockDealRuntime,
  listMockCreatedDeals,
} from './mock-protected-deal-store';
import { useAuthStore } from '../store/auth.store';

const MOCK_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const summaries = (mockTransactions as ApiSuccess<SafeDealSummary[]>).data;

function allSummaries(): SafeDealSummary[] {
  return [...listMockCreatedDeals().map((deal) => deal.summary), ...summaries];
}

function findSummary(id: string): SafeDealSummary | undefined {
  return allSummaries().find((summary) => summary.id === id || summary.reference === id);
}

interface DetailOverlay {
  description: string;
  useCase: string;
  releaseConditions: string;
  dealType?: DealType;
  recurring?: boolean;
  previousReference?: string;
}

/**
 * Rich, hand-authored overlays for a few known deals: description/useCase/
 * release conditions only. `title` always comes from the deal summary
 * (single source of truth with the list row) so the room a deal opens into
 * never shows a different name than the row that was clicked.
 */
const DETAIL_OVERLAY: Record<string, DetailOverlay> = {
  txn_mock_001: {
    description: 'Two-bedroom apartment reservation with Adaeze Homes & Properties Ltd, held safely until the offer letter, allocation details, and deposit receipt are confirmed.',
    useCase: 'property-agent-payments',
    releaseConditions: 'Offer letter, allocation details, and deposit receipt confirmed by the buyer.',
    dealType: 'milestone',
  },
  txn_mock_003: {
    description: 'Off-plan unit deposit with Lekki Gardens Development Co., held safely until allocation documents and inspection evidence are confirmed.',
    useCase: 'developer-instalments',
    releaseConditions: 'Allocation letter and supporting documents delivered and confirmed by the buyer, with inspection evidence uploaded.',
    dealType: 'milestone',
  },
  txn_mock_004: {
    description: 'Sale of a 4-bedroom detached duplex in Magodo with Bright Homes Realty Ltd, held safely pending resolution of an open dispute.',
    useCase: 'property-agent-payments',
    releaseConditions: 'Title documents and handover confirmation provided and accepted by the buyer.',
  },
  txn_mock_029: {
    description: 'A sealed Galaxy S25 Ultra supplied for business use, with model, IMEI, package condition, and tamper seal recorded before dispatch.',
    useCase: 'supplier-orders',
    releaseConditions: 'Buyer completes handover review and the funding-review deadline passes without a dispute, or the buyer approves early release.',
    dealType: 'milestone',
  },
};

function fundingFor(status: SafeDealStatus, amountMinor: number, currency: string): DealFunding {
  let fundingStatus: FundingStatus = 'unfunded';
  let received = 0;
  if (status === 'awaiting_funding') {
    fundingStatus = 'awaiting_transfer';
  } else if (status === 'paid_out' || status === 'completed') {
    fundingStatus = 'released';
    received = amountMinor;
  } else if (
    status === 'funded' ||
    status === 'in_progress' ||
    status === 'evidence_submitted' ||
    status === 'buyer_review' ||
    status === 'release_approved' ||
    status === 'disputed'
  ) {
    fundingStatus = 'funded';
    received = amountMinor;
  }
  return {
    partner: 'Anchor',
    accountNumber: '7' + String(Math.abs(hash(status + amountMinor)) % 1000000000).padStart(9, '0'),
    accountName: 'NAITRUST / SAFE DEAL',
    bankName: 'Anchor (partner bank)',
    amountExpectedMinor: amountMinor,
    amountReceivedMinor: received,
    currency,
    status: fundingStatus,
  };
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) | 0;
  return h;
}

function partiesFor(summary: SafeDealSummary, youAreSeller: boolean): DealParty[] {
  const preFunding = summary.status === 'draft' || summary.status === 'pending_counterparty';
  const you: DealParty = {
    id: 'party_you',
    name: 'You',
    role: youAreSeller ? 'seller' : 'buyer',
    status: 'creator',
    isYou: true,
    allocationMinor: youAreSeller ? summary.amountMinor : undefined,
  };
  const counterparty: DealParty = {
    id: 'party_cp',
    name: summary.counterpartyName,
    role: youAreSeller ? 'buyer' : 'seller',
    status: preFunding ? 'invited' : 'accepted',
    isYou: false,
    allocationMinor: youAreSeller ? undefined : summary.amountMinor,
  };
  return [you, counterparty];
}

function partiesForCreatedDeal(summary: SafeDealSummary, input: CreateSafeDealInput): DealParty[] {
  const you: DealParty = {
    id: 'party_you',
    name: 'You',
    role: input.role,
    status: 'creator',
    isYou: true,
    allocationMinor: input.role === 'seller' ? summary.amountMinor : undefined,
  };
  return [
    you,
    ...input.participants.map((participant, index) => ({
      id: `party_created_${index}`,
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      role: input.role === 'seller' ? ('buyer' as const) : ('seller' as const),
      status: summary.status === 'pending_counterparty' ? ('invited' as const) : ('accepted' as const),
      isYou: false,
      allocationMinor: input.role === 'buyer' ? participant.allocationMinor : undefined,
    })),
  ];
}

function evidenceFor(summary: SafeDealSummary): DealEvidenceItem[] {
  const hasEvidence = ['evidence_submitted', 'buyer_review', 'release_approved', 'paid_out', 'completed', 'disputed'].includes(
    summary.status,
  );
  if (!hasEvidence) return [];
  const base = new Date(summary.createdAt).getTime();
  const evidence: DealEvidenceItem[] = [
    {
      id: 'ev_1',
      fileName: 'invoice.pdf',
      kind: 'Invoice',
      uploadedByName: summary.counterpartyName,
      note: 'Order invoice for the agreed items.',
      createdAt: new Date(base + 2 * 86400000).toISOString(),
    },
    {
      id: 'ev_2',
      fileName: 'waybill-photo.jpg',
      kind: 'Waybill',
      uploadedByName: summary.counterpartyName,
      note: 'Signed waybill on dispatch.',
      createdAt: new Date(base + 3 * 86400000).toISOString(),
    },
  ];
  if (summary.id === 'txn_mock_029') {
    evidence.push(
      {
        id: 'ev_product_model',
        fileName: 'galaxy-s25-ultra-model.jpg',
        kind: 'Product model',
        uploadedByName: 'You',
        note: 'Galaxy S25 Ultra, Titanium Black, 512GB.',
        createdAt: new Date(base + 3.1 * 86400000).toISOString(),
      },
      {
        id: 'ev_product_imei',
        fileName: 'imei-label.jpg',
        kind: 'Serial / IMEI',
        uploadedByName: 'You',
        note: 'IMEI label recorded before sealing the package.',
        createdAt: new Date(base + 3.2 * 86400000).toISOString(),
      },
      {
        id: 'ev_product_packaging',
        fileName: 'sealed-package.jpg',
        kind: 'Packaging condition',
        uploadedByName: 'You',
        note: 'Outer package photographed without visible damage.',
        createdAt: new Date(base + 3.3 * 86400000).toISOString(),
      },
      {
        id: 'ev_product_seal',
        fileName: 'tamper-seal.jpg',
        kind: 'Tamper seal',
        uploadedByName: 'You',
        note: 'Numbered tamper seal applied before rider collection.',
        createdAt: new Date(base + 3.4 * 86400000).toISOString(),
      },
    );
  }
  return evidence;
}

const STATUS_ORDER: SafeDealStatus[] = [
  'draft',
  'pending_counterparty',
  'terms_negotiation',
  'terms_agreed',
  'awaiting_funding',
  'funded',
  'in_progress',
  'evidence_submitted',
  'buyer_review',
  'release_approved',
  'paid_out',
  'completed',
];

function activityFor(summary: SafeDealSummary): DealActivityEvent[] {
  const base = new Date(summary.createdAt).getTime();
  const events: DealActivityEvent[] = [];
  let step = 0;
  const at = () => new Date(base + step++ * 43200000).toISOString();

  events.push({ id: 'a0', kind: 'created', message: 'Safe deal created and counterparty invited.', createdAt: at() });

  const idx = STATUS_ORDER.indexOf(summary.status);
  const reached = (s: SafeDealStatus) => idx >= STATUS_ORDER.indexOf(s) && STATUS_ORDER.indexOf(s) !== -1;

  if (reached('terms_agreed') || summary.status === 'disputed')
    events.push({ id: 'a1', kind: 'accepted', message: `${summary.counterpartyName} accepted the invitation and agreement.`, createdAt: at() });
  if (reached('funded') || summary.status === 'disputed')
    events.push({ id: 'a2', kind: 'funded', message: `Buyer funded the partner virtual account (${formatMinorAmount(summary.amountMinor, summary.currency)}).`, createdAt: at() });
  if (reached('evidence_submitted') || summary.status === 'disputed')
    events.push({ id: 'a3', kind: 'evidence', message: `${summary.counterpartyName} submitted delivery evidence.`, createdAt: at() });
  if (summary.status === 'disputed')
    events.push({ id: 'a4', kind: 'dispute', message: 'A dispute was opened. Release is paused pending review.', createdAt: at() });
  if (reached('paid_out'))
    events.push({ id: 'a5', kind: 'released', message: 'Funds released to the seller by the partner.', createdAt: at() });
  if (reached('completed'))
    events.push({ id: 'a6', kind: 'completed', message: 'Transaction completed. Reputation updated.', createdAt: at() });

  return events.reverse(); // newest first
}

const MILESTONE_STAGES = [
  { title: 'Order confirmed', description: 'Both parties agreed the terms and the deal is funded.' },
  { title: 'Dispatched', description: 'The seller picked up and dispatched the goods.' },
  { title: 'In transit', description: 'Goods are on the way to the destination.' },
  { title: 'Arrived', description: 'Goods reached the destination for handover.' },
  { title: 'Delivered & confirmed', description: 'Buyer confirmed delivery: release can proceed.' },
];

/** How far along the tracking stages a deal is, by status. */
function milestoneProgress(status: SafeDealStatus): number {
  switch (status) {
    case 'funded':
      return 1;
    case 'in_progress':
      return 2;
    case 'evidence_submitted':
    case 'disputed':
      return 3;
    case 'buyer_review':
    case 'release_approved':
      return 4;
    case 'paid_out':
    case 'completed':
      return 5;
    default:
      return 0;
  }
}

function milestonesFor(summary: SafeDealSummary): DealMilestone[] {
  const reached = milestoneProgress(summary.status);
  const base = new Date(summary.createdAt).getTime();
  return MILESTONE_STAGES.map((stage, i) => {
    let status: MilestoneStatus = 'pending';
    if (i < reached) status = 'done';
    else if (i === reached) status = 'current';
    return {
      id: `ms_${i}`,
      title: stage.title,
      description: stage.description,
      status,
      updatedByName: status === 'done' ? summary.counterpartyName : undefined,
      at: status === 'done' ? new Date(base + (i + 1) * 86400000).toISOString() : undefined,
    };
  });
}

function agreementFor(summary: SafeDealSummary, overlay: DetailOverlay | undefined): AgreementDraft {
  const amount = formatMinorAmount(summary.amountMinor, summary.currency);
  return {
    version: 1,
    generatedByAi: false,
    sections: [
      {
        heading: 'Parties and purpose',
        body: `This safe deal agreement covers "${summary.title ?? summary.counterpartyName}" between you (the Buyer) and ${summary.counterpartyName} (the Seller).`,
      },
      {
        heading: 'Protected payment',
        body: `The Buyer funds ${amount} into a partner-issued virtual account. Naitrust never holds the funds directly.`,
      },
      {
        heading: 'Release conditions',
        body: overlay?.releaseConditions ?? 'After receipt, the Buyer completes the handover review. Funds release only after the following funding-review period ends without a dispute, or the Buyer approves early release.',
      },
      {
        heading: 'Product review and consumer rights',
        body: 'The standard funding-review period is 24 hours after handover. This controls only the Naitrust partner-funding release deadline and does not remove statutory, manufacturer, or seller warranty rights.',
      },
    ],
  };
}

/**
 * Session-scoped, in-memory overrides so tracking updates and evidence uploads
 * persist across a session (mock only). Keyed by deal id; the real backend
 * stores these server-side.
 */
const trackingOverrides: Record<string, DealMilestone[]> = {};
const evidenceExtra: Record<string, DealEvidenceItem[]> = {};

function buildDealDetail(summary: SafeDealSummary): SafeDealDetail {
  const createdDeal = findMockCreatedDeal(summary.id);
  const input = createdDeal?.input;
  const overlay = DETAIL_OVERLAY[summary.id];
  const created = new Date(summary.createdAt).getTime();
  const dealType: DealType = input?.dealType ?? overlay?.dealType ?? 'single';
  const extendedProductTestingDays = input?.extendedProductTestingDays;
  reconcileDeliveryLifecycle(summary.id, extendedProductTestingDays);
  if (['cancelled', 'refunded'].includes(summary.status)) invalidateDeliveryCard(summary.id);
  const runtime = getMockDealRuntime(summary.id);
  const signedInAccountRole = useAuthStore.getState().user?.role;
  const productBuyerView = summary.id === 'txn_mock_029' && signedInAccountRole === 'customer';
  const effectiveSummary: SafeDealSummary = {
    ...summary,
    counterpartyName: productBuyerView ? 'Ayo Mobile Supplies Ltd' : summary.counterpartyName,
    status: runtime?.status ?? summary.status,
  };
  // On tracked (milestone) deals you play the seller who delivers and updates
  // tracking; on other deals you're the buyer who funds and confirms.
  const youAreSeller = input
    ? input.role === 'seller'
    : summary.id === 'txn_mock_029'
      ? !productBuyerView
      : dealType === 'milestone';
  const milestones =
    trackingOverrides[summary.id] ?? (dealType === 'milestone' ? milestonesFor(effectiveSummary) : []);
  const evidence = [...evidenceFor(effectiveSummary), ...(evidenceExtra[summary.id] ?? [])];
  return {
    ...effectiveSummary,
    title: summary.title ?? `Safe deal with ${summary.counterpartyName}`,
    description: input?.description ?? overlay?.description ?? 'Protected transaction with agreed terms, evidence, and release conditions.',
    useCase: input?.useCase ?? overlay?.useCase ?? 'supplier-orders',
    dealType,
    partyMode: input?.partyMode ?? 'b2b',
    deliveryDueDate: input?.deliveryDueDate ?? new Date(created + 10 * 86400000).toISOString().slice(0, 10),
    releaseConditions:
      input?.releaseConditions ?? overlay?.releaseConditions ?? 'Handover and funding review complete without a dispute, or the buyer approves early release.',
    extendedProductTestingDays,
    expiresAt: new Date(created + (input?.expiresInDays ?? 14) * 86400000).toISOString(),
    recurring: overlay?.recurring ?? dealType === 'recurring',
    previousReference: overlay?.previousReference,
    parties: input ? partiesForCreatedDeal(effectiveSummary, input) : partiesFor(effectiveSummary, youAreSeller),
    agreement: input?.agreement ?? agreementFor(effectiveSummary, overlay),
    funding: fundingFor(effectiveSummary.status, summary.amountMinor, summary.currency),
    evidence,
    activity: [...(runtime?.activity ?? []), ...activityFor(effectiveSummary)],
    milestones,
    delivery: runtime?.delivery ?? reconcileDeliveryLifecycle(summary.id, extendedProductTestingDays),
  };
}

/** Ensure a mutable milestone list exists for a deal (seeded from the base). */
function ensureTracking(id: string): DealMilestone[] {
  if (!trackingOverrides[id]) {
    const summary = findSummary(id);
    trackingOverrides[id] = summary ? milestonesFor(summary) : [];
  }
  return trackingOverrides[id];
}

function deliveryContext(deal: SafeDealDetail): DeliveryDealContext {
  const actorRole = deal.parties.find((party) => party.isYou)?.role;
  if (!actorRole) throw new Error('Your role on this deal could not be verified.');
  return {
    id: deal.id,
    reference: deal.reference,
    title: deal.title,
    status: deal.status,
    fundingStatus: deal.funding.status,
    actorRole,
    evidence: deal.evidence,
    extendedProductTestingDays: deal.extendedProductTestingDays,
  };
}

function getMockDetailOrThrow(id: string): SafeDealDetail {
  const summary = findSummary(id);
  if (!summary) throw new Error('Protected Deal not found.');
  return buildDealDetail(summary);
}

export const dealDetailApi = {
  /** GET /transactions/:id */
  getOne: async (id: string): Promise<ApiSuccess<SafeDealDetail | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const summary = findSummary(id);
      return { success: true, data: summary ? buildDealDetail(summary) : null };
    }
    const response = await httpClient.get<SafeDealDetail>(endpoints.transactions.getOne(id));
    return response as ApiSuccess<SafeDealDetail | null>;
  },

  generateDeliveryCard: async (id: string): Promise<ApiSuccess<SafeDealDetail>> => {
    if (!appConfig.isMock) throw new Error('Delivery-card backend integration is not enabled.');
    await delay(250);
    const deal = getMockDetailOrThrow(id);
    generateDeliveryCard(deliveryContext(deal));
    return { success: true, data: getMockDetailOrThrow(id) };
  },

  getDeliveryPreview: async (token: string): Promise<ApiSuccess<DeliveryHandoverPreview | null>> => {
    if (!appConfig.isMock) throw new Error('Delivery handover backend integration is not enabled.');
    await delay(250);
    const dealId = resolveDeliveryToken(token);
    if (!dealId) return { success: true, data: null };
    const deal = getMockDetailOrThrow(dealId);
    const card = deal.delivery.card;
    if (!card || card.token !== token) return { success: true, data: null };
    return {
      success: true,
      data: {
        dealId: deal.id,
        title: deal.title,
        reference: deal.reference,
        cardExpiresAt: card.expiresAt,
        cardStatus: card.status,
        actorRole: deal.parties.find((party) => party.isYou)?.role ?? 'seller',
        delivery: deal.delivery,
      },
    };
  },

  confirmReceiptByToken: async (token: string): Promise<ApiSuccess<SafeDealDetail>> => {
    if (!appConfig.isMock) throw new Error('Delivery handover backend integration is not enabled.');
    await delay(250);
    const dealId = resolveDeliveryToken(token);
    if (!dealId) throw new Error('This delivery link is not valid.');
    const deal = getMockDetailOrThrow(dealId);
    confirmDeliveryReceipt(deliveryContext(deal), { token });
    return { success: true, data: getMockDetailOrThrow(dealId) };
  },

  confirmReceiptByOtp: async (id: string, otpCode: string): Promise<ApiSuccess<SafeDealDetail>> => {
    if (!appConfig.isMock) throw new Error('Delivery handover backend integration is not enabled.');
    await delay(250);
    const deal = getMockDetailOrThrow(id);
    confirmDeliveryReceipt(deliveryContext(deal), { otpCode });
    return { success: true, data: getMockDetailOrThrow(id) };
  },

  completeHandoverReview: async (id: string): Promise<ApiSuccess<SafeDealDetail>> => {
    if (!appConfig.isMock) throw new Error('Handover backend integration is not enabled.');
    await delay(250);
    const deal = getMockDetailOrThrow(id);
    completeHandoverReview(deliveryContext(deal));
    return { success: true, data: getMockDetailOrThrow(id) };
  },

  approveEarlyRelease: async (id: string): Promise<ApiSuccess<SafeDealDetail>> => {
    if (!appConfig.isMock) throw new Error('Funding-release backend integration is not enabled.');
    await delay(250);
    const deal = getMockDetailOrThrow(id);
    approveEarlyRelease(deliveryContext(deal));
    return { success: true, data: getMockDetailOrThrow(id) };
  },

  /** Seller advances the shipment to the next tracking stage. */
  advanceTracking: async (id: string): Promise<ApiSuccess<DealMilestone[]>> => {
    if (appConfig.isMock) {
      await delay(300);
      const list = ensureTracking(id);
      const currentIdx = list.findIndex((m) => m.status === 'current');
      const idx = currentIdx === -1 ? list.findIndex((m) => m.status === 'pending') : currentIdx;
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: 'done', updatedByName: 'You', at: new Date().toISOString() };
        const next = list.findIndex((m, i) => i > idx && m.status === 'pending');
        if (next !== -1) list[next] = { ...list[next], status: 'current' };
      }
      trackingOverrides[id] = [...list];
      return { success: true, data: trackingOverrides[id] };
    }
    const res = await httpClient.post<DealMilestone[]>(endpoints.transactions.advanceTracking(id));
    return res as ApiSuccess<DealMilestone[]>;
  },

  /**
   * Seller adds a custom tracking update (a logged, completed step). When
   * `afterStepId` is given the update is inserted directly after that step;
   * otherwise it lands just before the first not-yet-done stage.
   */
  addTrackingStep: async (
    id: string,
    step: { title: string; description?: string },
    afterStepId?: string | null,
  ): Promise<ApiSuccess<DealMilestone[]>> => {
    if (appConfig.isMock) {
      await delay(300);
      const list = ensureTracking(id);
      const milestone: DealMilestone = {
        id: `ms_${crypto.randomUUID()}`,
        title: step.title,
        description: step.description,
        status: 'done',
        updatedByName: 'You',
        at: new Date().toISOString(),
      };
      const afterIdx = afterStepId ? list.findIndex((m) => m.id === afterStepId) : -1;
      if (afterIdx !== -1) {
        // Insert directly after the chosen step.
        list.splice(afterIdx + 1, 0, milestone);
      } else {
        // Default: just before the first not-done stage so it reads chronologically.
        const insertAt = list.findIndex((m) => m.status !== 'done');
        if (insertAt === -1) list.push(milestone);
        else list.splice(insertAt, 0, milestone);
      }
      trackingOverrides[id] = [...list];
      return { success: true, data: trackingOverrides[id] };
    }
    const res = await httpClient.post<DealMilestone[]>(endpoints.transactions.tracking(id), {
      ...step,
      afterStepId,
    });
    return res as ApiSuccess<DealMilestone[]>;
  },

  /** Seller edits the title/note of an existing tracking step. */
  editTrackingStep: async (
    id: string,
    stepId: string,
    patch: { title: string; description?: string },
  ): Promise<ApiSuccess<DealMilestone[]>> => {
    if (appConfig.isMock) {
      await delay(300);
      const list = ensureTracking(id);
      const idx = list.findIndex((m) => m.id === stepId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], title: patch.title, description: patch.description };
      }
      trackingOverrides[id] = [...list];
      return { success: true, data: trackingOverrides[id] };
    }
    const res = await httpClient.patch<DealMilestone[]>(
      `${endpoints.transactions.tracking(id)}/${stepId}`,
      patch,
    );
    return res as ApiSuccess<DealMilestone[]>;
  },

  /**
   * Seller reverts the most recent tracking advance: steps the delivery back
   * one stage (the last completed stage re-opens as the current one).
   */
  revertTracking: async (id: string): Promise<ApiSuccess<DealMilestone[]>> => {
    if (appConfig.isMock) {
      await delay(300);
      const list = ensureTracking(id);
      const currentIdx = list.findIndex((m) => m.status === 'current');
      if (currentIdx === -1) {
        // Every stage is done: re-open the final one as current.
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i].status === 'done') {
            list[i] = { ...list[i], status: 'current', updatedByName: undefined, at: undefined };
            break;
          }
        }
      } else if (currentIdx > 0) {
        // Un-complete the previous step: it becomes current, current becomes pending.
        list[currentIdx] = { ...list[currentIdx], status: 'pending', updatedByName: undefined, at: undefined };
        list[currentIdx - 1] = {
          ...list[currentIdx - 1],
          status: 'current',
          updatedByName: undefined,
          at: undefined,
        };
      }
      trackingOverrides[id] = [...list];
      return { success: true, data: trackingOverrides[id] };
    }
    const res = await httpClient.post<DealMilestone[]>(endpoints.transactions.revertTracking(id));
    return res as ApiSuccess<DealMilestone[]>;
  },

  /** Add uploaded evidence (mock retains session object URLs for preview). */
  addEvidence: async (
    id: string,
    items: { fileName: string; kind: string; note?: string; fileUrl?: string; mimeType?: string }[],
    uploadedByName: string,
  ): Promise<ApiSuccess<DealEvidenceItem[]>> => {
    if (appConfig.isMock) {
      await delay(300);
      const created = items.map((it) => ({
        id: `ev_${crypto.randomUUID()}`,
        fileName: it.fileName,
        kind: it.kind,
        fileUrl: it.fileUrl,
        mimeType: it.mimeType,
        uploadedByName,
        note: it.note,
        createdAt: new Date().toISOString(),
      }));
      evidenceExtra[id] = [...(evidenceExtra[id] ?? []), ...created];
      return { success: true, data: evidenceExtra[id] };
    }
    const res = await httpClient.post<DealEvidenceItem[]>(endpoints.upload.verificationDocument, {
      dealId: id,
      items,
    });
    return res as ApiSuccess<DealEvidenceItem[]>;
  },
};
