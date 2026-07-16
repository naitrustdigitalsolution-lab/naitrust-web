/**
 * Deal Detail API
 * Provides the full transaction-room view of a safe deal. In mock mode the
 * detail is synthesized from the deal summary in `transactions.json` — parties,
 * partner funding, evidence, agreement, and an activity timeline are derived
 * from the deal's status so every deal opens a coherent room. The real backend
 * returns this shape directly from GET /transactions/:id.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ApiSuccess } from './transactions.api';
import type {
  DealActivityEvent,
  DealEvidenceItem,
  DealFunding,
  DealMilestone,
  DealParty,
  FundingStatus,
  MilestoneStatus,
  SafeDealDetail,
} from '../store/types';
import type { AgreementDraft, DealType, SafeDealStatus, SafeDealSummary } from '../store/types';
import { formatMinorAmount } from '../utils/safe-deal-presentation';
import mockTransactions from '../../mocks/apis/transactions.json';

const MOCK_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const summaries = (mockTransactions as ApiSuccess<SafeDealSummary[]>).data;

interface DetailOverlay {
  title: string;
  description: string;
  useCase: string;
  releaseConditions: string;
  dealType?: DealType;
  recurring?: boolean;
  previousReference?: string;
}

/** Rich, hand-authored overlays for a few known deals (title/description/etc). */
const DETAIL_OVERLAY: Record<string, DetailOverlay> = {
  txn_mock_001: {
    title: 'Ankara fabric order — 60 yards assorted',
    description: 'Bulk Ankara order for the new season, assorted prints as per the shared catalogue.',
    useCase: 'supplier-orders',
    releaseConditions: 'Fabric delivered, count and prints matching the catalogue, inspected by the buyer.',
    dealType: 'milestone',
  },
  txn_mock_003: {
    title: 'Interstate freight — Lagos to Kano haulage',
    description: 'Full-truck haulage of packaged goods from Lagos to Kano with delivery confirmation.',
    useCase: 'supplier-orders',
    releaseConditions: 'Goods delivered to the Kano warehouse and signed for, with waybill uploaded.',
    dealType: 'milestone',
  },
  txn_mock_004: {
    title: 'Apartment rent — annual, Lekki Phase 1',
    description: 'One-year apartment rent held safely until keys and a signed tenancy agreement are handed over.',
    useCase: 'property-agent-payments',
    releaseConditions: 'Keys handed over and tenancy agreement signed by both parties.',
    dealType: 'recurring',
    recurring: true,
    previousReference: 'NT-2025-000411',
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

function evidenceFor(summary: SafeDealSummary): DealEvidenceItem[] {
  const hasEvidence = ['evidence_submitted', 'buyer_review', 'release_approved', 'paid_out', 'completed', 'disputed'].includes(
    summary.status,
  );
  if (!hasEvidence) return [];
  const base = new Date(summary.createdAt).getTime();
  return [
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
  { title: 'Delivered & confirmed', description: 'Buyer confirmed delivery — release can proceed.' },
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
    generatedByAi: true,
    sections: [
      {
        heading: 'Parties and purpose',
        body: `This safe deal agreement covers "${overlay?.title ?? summary.counterpartyName}" between you (the Buyer) and ${summary.counterpartyName} (the Seller).`,
      },
      {
        heading: 'Protected payment',
        body: `The Buyer funds ${amount} into a partner-issued virtual account. Naitrust never holds the funds directly.`,
      },
      {
        heading: 'Release conditions',
        body: overlay?.releaseConditions ?? 'Funds release when the Buyer confirms delivery, or the auto-confirm window elapses without a dispute.',
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
  const overlay = DETAIL_OVERLAY[summary.id];
  const created = new Date(summary.createdAt).getTime();
  const dealType: DealType = overlay?.dealType ?? 'single';
  // On tracked (milestone) deals you play the seller who delivers and updates
  // tracking; on other deals you're the buyer who funds and confirms.
  const youAreSeller = dealType === 'milestone';
  const milestones =
    trackingOverrides[summary.id] ?? (dealType === 'milestone' ? milestonesFor(summary) : []);
  return {
    ...summary,
    title: overlay?.title ?? `Safe deal with ${summary.counterpartyName}`,
    description: overlay?.description ?? 'Protected transaction with agreed terms, evidence, and release conditions.',
    useCase: overlay?.useCase ?? 'supplier-orders',
    dealType,
    partyMode: 'b2b',
    deliveryDueDate: new Date(created + 10 * 86400000).toISOString().slice(0, 10),
    releaseConditions:
      overlay?.releaseConditions ?? 'Delivery confirmed by the buyer, or the auto-confirm window elapses without a dispute.',
    expiresAt: new Date(created + 14 * 86400000).toISOString(),
    recurring: overlay?.recurring ?? dealType === 'recurring',
    previousReference: overlay?.previousReference,
    parties: partiesFor(summary, youAreSeller),
    agreement: agreementFor(summary, overlay),
    funding: fundingFor(summary.status, summary.amountMinor, summary.currency),
    evidence: [...evidenceFor(summary), ...(evidenceExtra[summary.id] ?? [])],
    activity: activityFor(summary),
    milestones,
  };
}

/** Ensure a mutable milestone list exists for a deal (seeded from the base). */
function ensureTracking(id: string): DealMilestone[] {
  if (!trackingOverrides[id]) {
    const summary = summaries.find((s) => s.id === id || s.reference === id);
    trackingOverrides[id] = summary ? milestonesFor(summary) : [];
  }
  return trackingOverrides[id];
}

export const dealDetailApi = {
  /** GET /transactions/:id */
  getOne: async (id: string): Promise<ApiSuccess<SafeDealDetail | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const summary = summaries.find((s) => s.id === id || s.reference === id);
      return { success: true, data: summary ? buildDealDetail(summary) : null };
    }
    const response = await httpClient.get<SafeDealDetail>(endpoints.transactions.getOne(id));
    return response as ApiSuccess<SafeDealDetail | null>;
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
    const res = await httpClient.post<DealMilestone[]>(`${endpoints.transactions.getOne(id)}/tracking/advance`);
    return res as ApiSuccess<DealMilestone[]>;
  },

  /** Seller adds a custom tracking update (a logged, completed step). */
  addTrackingStep: async (
    id: string,
    step: { title: string; description?: string },
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
      // Insert just before the first not-done stage so it reads chronologically.
      const insertAt = list.findIndex((m) => m.status !== 'done');
      if (insertAt === -1) list.push(milestone);
      else list.splice(insertAt, 0, milestone);
      trackingOverrides[id] = [...list];
      return { success: true, data: trackingOverrides[id] };
    }
    const res = await httpClient.post<DealMilestone[]>(`${endpoints.transactions.getOne(id)}/tracking`, step);
    return res as ApiSuccess<DealMilestone[]>;
  },

  /** Add uploaded evidence (mock stores names only). */
  addEvidence: async (
    id: string,
    items: { fileName: string; kind: string; note?: string }[],
    uploadedByName: string,
  ): Promise<ApiSuccess<DealEvidenceItem[]>> => {
    if (appConfig.isMock) {
      await delay(300);
      const created = items.map((it) => ({
        id: `ev_${crypto.randomUUID()}`,
        fileName: it.fileName,
        kind: it.kind,
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
