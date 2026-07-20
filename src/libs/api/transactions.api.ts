/**
 * Transactions (Safe Deal) API
 * Typed access to the safe-deal transaction endpoints.
 *
 * In mock mode (`VITE_APP_MODE=mock`) methods resolve fixture data from
 * `src/mocks/apis/` with simulated latency, using the exact same response
 * envelope the real backend returns — screens and hooks are unaware of the
 * difference. Flip the env var to `dev`/`prod` to hit the real API.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { CreateSafeDealInput, SafeDealSummary } from '../store/types';
import mockTransactions from '../../mocks/apis/transactions.json';
import type { ApiSuccess } from './types';

const MOCK_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const transactionsApi = {
  /**
   * Get the current user's safe deals.
   * Real endpoint: GET /transactions/my
   */
  getMyTransactions: async (): Promise<ApiSuccess<SafeDealSummary[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return mockTransactions as ApiSuccess<SafeDealSummary[]>;
    }
    const response = await httpClient.get<SafeDealSummary[]>(
      endpoints.transactions.getMyTransactions,
    );
    return response as ApiSuccess<SafeDealSummary[]>;
  },

  /**
   * Create a safe deal and invite the counterparty.
   * Real endpoint: POST /transactions
   * In mock mode returns a freshly-created summary in `pending_counterparty`.
   */
  createTransaction: async (input: CreateSafeDealInput): Promise<ApiSuccess<SafeDealSummary>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const now = new Date();
      const first = input.participants[0];
      const counterpartyName =
        input.participants.length > 1
          ? `${first?.name ?? 'Counterparty'} +${input.participants.length - 1}`
          : (first?.name ?? 'Counterparty');
      const summary: SafeDealSummary = {
        id: `txn_${crypto.randomUUID()}`,
        reference: `NT-${now.getFullYear()}-${String(Math.floor(now.getTime() / 1000) % 1000000).padStart(6, '0')}`,
        title: input.title,
        counterpartyName,
        amountMinor: input.amountMinor,
        currency: input.currency,
        status: 'pending_counterparty',
        createdAt: now.toISOString(),
      };
      return { success: true, data: summary, message: 'Safe deal created' };
    }
    const response = await httpClient.post<SafeDealSummary>(endpoints.transactions.create, input);
    return response as ApiSuccess<SafeDealSummary>;
  },
};
