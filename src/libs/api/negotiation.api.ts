/**
 * Deal Negotiation API
 * Bidirectional proposals to change a deal's terms/agreement before it freezes.
 * In mock mode negotiations live in session module state (seeded per deal),
 * so proposing, countering, accepting, and declining reflect immediately. The
 * counterparty's initial proposal is seeded for a couple of deals to
 * demonstrate the "other party requested a review" flow.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ApiSuccess } from './transactions.api';
import type {
  DealNegotiation,
  NegotiationProposal,
  ProposedChanges,
} from '../store/types';

const MOCK_MS = 350;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Session-scoped negotiations keyed by deal id. */
const negotiations: Record<string, DealNegotiation> = {};
/** Deals that start with a counterparty-initiated negotiation. */
const SEEDS: Record<string, { byName: string; message: string; changes: ProposedChanges }> = {
  txn_mock_007: {
    byName: 'Ibrahim Musa',
    message:
      "Thanks for the offer. Before I accept, can we lower the amount slightly and extend the delivery date? I'd also like the release to depend on an on-site inspection.",
    changes: {
      amountMinor: 2800000,
      deliveryDueDate: '2026-08-05',
      releaseConditions: 'Goods delivered and inspected on-site by the buyer before release.',
      agreementNote: 'Please reflect the on-site inspection requirement in the release clause.',
    },
  },
};

function seedFor(dealId: string): DealNegotiation | null {
  const seed = SEEDS[dealId];
  if (!seed) return null;
  return {
    dealId,
    status: 'open',
    proposals: [
      {
        id: `${dealId}_p1`,
        byName: seed.byName,
        byYou: false,
        message: seed.message,
        changes: seed.changes,
        status: 'proposed',
        createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      },
    ],
  };
}

function ensure(dealId: string): DealNegotiation | null {
  if (!negotiations[dealId]) {
    const seeded = seedFor(dealId);
    if (seeded) negotiations[dealId] = seeded;
  }
  return negotiations[dealId] ?? null;
}

export const negotiationApi = {
  /** GET current negotiation (or null). */
  get: async (dealId: string): Promise<ApiSuccess<DealNegotiation | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const n = ensure(dealId);
      return { success: true, data: n ? structuredClone(n) : null };
    }
    const res = await httpClient.get<DealNegotiation | null>(endpoints.negotiations.get(dealId));
    return res as ApiSuccess<DealNegotiation | null>;
  },

  /** Propose changes (opens a negotiation if none, or counters the last one). */
  propose: async (
    dealId: string,
    input: { message: string; changes: ProposedChanges },
  ): Promise<ApiSuccess<DealNegotiation>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const existing = ensure(dealId);
      const proposal: NegotiationProposal = {
        id: `${dealId}_${crypto.randomUUID()}`,
        byName: 'You',
        byYou: true,
        message: input.message,
        changes: input.changes,
        status: 'proposed',
        createdAt: new Date().toISOString(),
      };
      const next: DealNegotiation = existing
        ? {
            ...existing,
            status: 'open',
            proposals: [
              ...existing.proposals.map((p) =>
                p.status === 'proposed' ? { ...p, status: 'superseded' as const } : p,
              ),
              proposal,
            ],
          }
        : { dealId, status: 'open', proposals: [proposal] };
      negotiations[dealId] = next;
      return { success: true, data: structuredClone(next) };
    }
    const res = await httpClient.post<DealNegotiation>(endpoints.negotiations.propose(dealId), input);
    return res as ApiSuccess<DealNegotiation>;
  },

  /** Accept or decline a specific proposal. */
  respond: async (
    dealId: string,
    proposalId: string,
    action: 'accepted' | 'declined',
  ): Promise<ApiSuccess<DealNegotiation>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const n = ensure(dealId);
      if (!n) throw new Error('No negotiation');
      const proposals = n.proposals.map((p) =>
        p.id === proposalId ? { ...p, status: action } : p,
      );
      const next: DealNegotiation = {
        ...n,
        proposals,
        status: action === 'accepted' ? 'accepted' : 'open',
      };
      negotiations[dealId] = next;
      return { success: true, data: structuredClone(next) };
    }
    const res = await httpClient.post<DealNegotiation>(
      endpoints.negotiations.respond(dealId, proposalId),
      { action },
    );
    return res as ApiSuccess<DealNegotiation>;
  },

  /** Withdraw the negotiation entirely. */
  withdraw: async (dealId: string): Promise<ApiSuccess<DealNegotiation | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const n = ensure(dealId);
      if (n) {
        negotiations[dealId] = { ...n, status: 'withdrawn' };
        return { success: true, data: structuredClone(negotiations[dealId]) };
      }
      return { success: true, data: null };
    }
    const res = await httpClient.post<DealNegotiation | null>(endpoints.negotiations.withdraw(dealId));
    return res as ApiSuccess<DealNegotiation | null>;
  },
};
