/**
 * Beneficiaries API
 * Typed access to saved instant-payment recipients.
 *
 * No backend endpoint exists for this yet (see endpoints.ts) — every method
 * is mock-only for this phase.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { Beneficiary } from '../store/types';
import mockBeneficiaries from '../../mocks/apis/beneficiaries.json';
import type { ApiSuccess } from './types';

const MOCK_LATENCY_MS = 350;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const beneficiariesApi = {
  /** Real endpoint (not yet implemented): GET /beneficiaries */
  list: async (): Promise<ApiSuccess<Beneficiary[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return mockBeneficiaries as ApiSuccess<Beneficiary[]>;
    }
    const response = await httpClient.get<Beneficiary[]>(endpoints.beneficiaries.list);
    return response as ApiSuccess<Beneficiary[]>;
  },

  /** Real endpoint (not yet implemented): POST /beneficiaries */
  create: async (
    input: Omit<Beneficiary, 'id' | 'createdAt' | 'isFavourite'>,
  ): Promise<ApiSuccess<Beneficiary>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const beneficiary: Beneficiary = {
        ...input,
        id: `ben_mock_${crypto.randomUUID()}`,
        isFavourite: false,
        createdAt: new Date().toISOString(),
      };
      return { isSuccessful: true, data: beneficiary, message: 'Beneficiary saved' };
    }
    const response = await httpClient.post<Beneficiary>(endpoints.beneficiaries.create, input);
    return response as ApiSuccess<Beneficiary>;
  },

  /** Real endpoint (not yet implemented): DELETE /beneficiaries/:id */
  remove: async (id: string): Promise<ApiSuccess<null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return { isSuccessful: true, data: null, message: 'Beneficiary removed' };
    }
    const response = await httpClient.delete<null>(endpoints.beneficiaries.remove(id));
    return response as ApiSuccess<null>;
  },
};
