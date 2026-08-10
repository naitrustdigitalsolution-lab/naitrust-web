/**
 * Dispute API
 * Open and follow a dispute on a deal. In mock mode disputes live in session
 * module state keyed by deal id; opening one pauses release and starts an
 * evidence-based admin review (mirrors the backend dispute flow). The disputed
 * mock deal (Bright Homes Realty) is seeded so a dispute room is visible.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ApiSuccess } from './types';
import type { DealDispute, DisputeMessage } from '../store/types';
import { blockDeliveryRelease } from './delivery-review.mock';
import { addBusinessDays } from 'date-fns';

const MOCK_MS = 350;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const disputes: Record<string, DealDispute> = {};

export function activateDisputeWithEvidence(dealId: string): void {
  const dispute = disputes[dealId];
  if (!dispute || dispute.status !== 'awaiting_evidence') return;
  disputes[dealId] = {
    ...dispute,
    status: 'under_review',
    messages: [...dispute.messages, {
      id: `${dealId}_dm_${crypto.randomUUID()}`,
      byName: 'Naitrust Support',
      byYou: false,
      body: 'Buyer evidence was received. Automatic payment release is now frozen while the dispute is reviewed.',
      createdAt: new Date().toISOString(),
    }],
  };
  blockDeliveryRelease(dealId);
}

/** Deals that already have an open dispute in the mock. */
const SEEDS: Record<string, Omit<DealDispute, 'dealId'>> = {
  txn_mock_004: {
    status: 'under_review',
    reason: 'Item not as described',
    description:
      'The keys were handed over but the tenancy agreement differs from what we agreed. Requesting a review before release.',
    openedByName: 'You',
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    messages: [
      {
        id: 'txn_mock_004_dm1',
        byName: 'Naitrust Support',
        byYou: false,
        body: 'Thanks for the details. Please upload the signed agreement and any messages so we can review.',
        createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
      },
    ],
  },
};

function ensure(dealId: string): DealDispute | null {
  if (!disputes[dealId] && SEEDS[dealId]) {
    disputes[dealId] = { dealId, ...SEEDS[dealId] };
  }
  return disputes[dealId] ?? null;
}

export const disputeApi = {
  /** GET current dispute (or null). */
  get: async (dealId: string): Promise<ApiSuccess<DealDispute | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const d = ensure(dealId);
      return { success: true, data: d ? structuredClone(d) : null };
    }
    const res = await httpClient.get<DealDispute | null>(endpoints.disputes.get(dealId));
    return res as ApiSuccess<DealDispute | null>;
  },

  /** Open a dispute: pauses release, starts admin review. */
  open: async (
    dealId: string,
    input: { reason: string; description: string; hasEvidence?: boolean },
  ): Promise<ApiSuccess<DealDispute>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const openedAt = new Date();
      const dispute: DealDispute = {
        dealId,
        status: input.hasEvidence ? 'under_review' : 'awaiting_evidence',
        reason: input.reason,
        description: input.description,
        openedByName: 'You',
        createdAt: openedAt.toISOString(),
        initialDecisionDueAt: addBusinessDays(openedAt, 2).toISOString(),
        messages: [
          {
            id: `${dealId}_dm_${crypto.randomUUID()}`,
            byName: 'Naitrust Support',
            byYou: false,
            body: input.hasEvidence
              ? 'Your report and evidence were received. Automatic payment release is frozen while the dispute is reviewed.'
              : 'Your report was received without evidence. Payment is not frozen yet. Upload relevant evidence as soon as possible; insufficient evidence may affect the final decision.',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      disputes[dealId] = dispute;
      if (input.hasEvidence) blockDeliveryRelease(dealId);
      return { success: true, data: structuredClone(dispute) };
    }
    const res = await httpClient.post<DealDispute>(endpoints.disputes.open(dealId), input);
    return res as ApiSuccess<DealDispute>;
  },

  /** Add a message/evidence note to the dispute thread. */
  message: async (dealId: string, body: string): Promise<ApiSuccess<DealDispute>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const d = ensure(dealId);
      if (!d) throw new Error('No dispute');
      const msg: DisputeMessage = {
        id: `${dealId}_dm_${crypto.randomUUID()}`,
        byName: 'You',
        byYou: true,
        body,
        createdAt: new Date().toISOString(),
      };
      disputes[dealId] = { ...d, messages: [...d.messages, msg] };
      return { success: true, data: structuredClone(disputes[dealId]) };
    }
    const res = await httpClient.post<DealDispute>(endpoints.disputes.message(dealId), { body });
    return res as ApiSuccess<DealDispute>;
  },
};
