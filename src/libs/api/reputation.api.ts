/**
 * Reputation API
 * Typed access to the current user's reputation summary.
 *
 * In mock mode (`VITE_APP_MODE=mock`) resolves fixture data from
 * `src/mocks/apis/reputation.json` with simulated latency, using the same
 * response envelope the real backend returns.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ReputationSummary } from '../store/types';
import mockReputation from '../../mocks/apis/reputation.json';
import type { ApiSuccess } from './transactions.api';

const MOCK_LATENCY_MS = 350;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const reputationApi = {
  /**
   * Get the current user's reputation summary.
   * Real endpoint: GET /reputation/me
   */
  getMine: async (): Promise<ApiSuccess<ReputationSummary>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return mockReputation as ApiSuccess<ReputationSummary>;
    }
    const response = await httpClient.get<ReputationSummary>(endpoints.reputation.getMine);
    return response as ApiSuccess<ReputationSummary>;
  },
};
