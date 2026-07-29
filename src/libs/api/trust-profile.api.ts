/**
 * Trust Profile API
 * Typed access to the current user's observable platform-activity summary.
 * Never a credit score — informational only (see TrustProfilePage copy).
 *
 * No backend endpoint exists for this yet (see endpoints.ts) — mock-only for
 * this phase.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { TrustProfile } from '../store/types';
import mockTrustProfile from '../../mocks/apis/trust-profile.json';
import type { ApiSuccess } from './types';

const MOCK_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const trustProfileApi = {
  /** Real endpoint (not yet implemented): GET /trust-profile/me */
  getMine: async (): Promise<ApiSuccess<TrustProfile>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return mockTrustProfile as ApiSuccess<TrustProfile>;
    }
    const response = await httpClient.get<TrustProfile>(endpoints.trustProfile.getMine);
    return response as ApiSuccess<TrustProfile>;
  },
};
