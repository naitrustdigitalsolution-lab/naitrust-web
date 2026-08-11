/**
 * Termination API
 * Either party can request ending a deal early with a reason; the counterparty
 * accepts or rejects (rejection carries its own reason). In mock mode the
 * request lives in session module state keyed by deal id and every outcome is
 * kept as a record. The real backend mirrors this at /transactions/:id/termination.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ApiSuccess } from './types';
import type { DealTermination } from '../store/types';
import { patchMockDealRuntime } from './mock-protected-deal-store';
import { useAuthStore } from '../store/auth.store';

const MOCK_MS = 350;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const terminations: Record<string, DealTermination> = {};
const terminationRequesterIds: Record<string, string | undefined> = {};

function forCurrentViewer(termination: DealTermination): DealTermination {
  return { ...termination, requestedByYou: terminationRequesterIds[termination.dealId] === useAuthStore.getState().user?.id };
}

export const terminationApi = {
  /** GET the current termination request for a deal (or null). */
  get: async (dealId: string): Promise<ApiSuccess<DealTermination | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const t = terminations[dealId];
      return { success: true, data: t ? structuredClone(forCurrentViewer(t)) : null };
    }
    const res = await httpClient.get<DealTermination | null>(endpoints.transactions.termination(dealId));
    return res as ApiSuccess<DealTermination | null>;
  },

  /** Request termination: anyone on the deal can start this. */
  request: async (dealId: string, reason: string): Promise<ApiSuccess<DealTermination>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const t: DealTermination = {
        dealId,
        status: 'requested',
        reason,
        requestedByName: 'You',
        requestedByYou: true,
        createdAt: new Date().toISOString(),
      };
      terminations[dealId] = t;
      terminationRequesterIds[dealId] = useAuthStore.getState().user?.id;
      return { success: true, data: structuredClone(forCurrentViewer(t)) };
    }
    const res = await httpClient.post<DealTermination>(endpoints.transactions.termination(dealId), { reason });
    return res as ApiSuccess<DealTermination>;
  },

  /**
   * The counterparty responds. Accepting terminates the deal; rejecting keeps
   * it active and records the rejection reason.
   */
  respond: async (
    dealId: string,
    input: { accept: boolean; reason?: string; byName?: string },
  ): Promise<ApiSuccess<DealTermination>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const current = terminations[dealId];
      if (!current) throw new Error('No termination request');
      const next: DealTermination = {
        ...current,
        status: input.accept ? 'accepted' : 'rejected',
        respondedByName: input.byName ?? 'Counterparty',
        respondedAt: new Date().toISOString(),
        responseReason: input.accept ? undefined : input.reason,
      };
      terminations[dealId] = next;
      if (input.accept) patchMockDealRuntime(dealId, { status: 'cancelled' });
      return { success: true, data: structuredClone(forCurrentViewer(next)) };
    }
    const res = await httpClient.post<DealTermination>(endpoints.transactions.respondToTermination(dealId), input);
    return res as ApiSuccess<DealTermination>;
  },
};
