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
import type { ApiSuccess } from './transactions.api';
import type { DealTermination } from '../store/types';

const MOCK_MS = 350;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const terminations: Record<string, DealTermination> = {};

export const terminationApi = {
  /** GET the current termination request for a deal (or null). */
  get: async (dealId: string): Promise<ApiSuccess<DealTermination | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const t = terminations[dealId];
      return { success: true, data: t ? structuredClone(t) : null };
    }
    const res = await httpClient.get<DealTermination | null>(endpoints.transactions.termination(dealId));
    return res as ApiSuccess<DealTermination | null>;
  },

  /** Request termination — anyone on the deal can start this. */
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
      return { success: true, data: structuredClone(t) };
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
      return { success: true, data: structuredClone(next) };
    }
    const res = await httpClient.post<DealTermination>(endpoints.transactions.respondToTermination(dealId), input);
    return res as ApiSuccess<DealTermination>;
  },
};
