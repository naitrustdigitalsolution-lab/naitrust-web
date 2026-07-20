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

const MOCK_MS = 350;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const disputes: Record<string, DealDispute> = {};

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

  /** Open a dispute — pauses release, starts admin review. */
  open: async (
    dealId: string,
    input: { reason: string; description: string },
  ): Promise<ApiSuccess<DealDispute>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const dispute: DealDispute = {
        dealId,
        status: 'under_review',
        reason: input.reason,
        description: input.description,
        openedByName: 'You',
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: `${dealId}_dm_${crypto.randomUUID()}`,
            byName: 'Naitrust Support',
            byYou: false,
            body: 'Your dispute has been received. Add any evidence and we will review it shortly.',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      disputes[dealId] = dispute;
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
