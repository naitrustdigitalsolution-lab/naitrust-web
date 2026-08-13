/**
 * Counterparties API
 * Typed access to the Business Network — saved suppliers, buyers,
 * contractors, customers and agents.
 *
 * No backend endpoint exists for this yet (see endpoints.ts) — every method
 * is mock-only for this phase.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { CounterpartyProfile } from '../store/types';
import mockCounterparties from '../../mocks/apis/counterparties.json';
import type { ApiSuccess } from './types';

const MOCK_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const counterpartiesApi = {
  /** Real endpoint (not yet implemented): GET /counterparties */
  list: async (): Promise<ApiSuccess<CounterpartyProfile[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return mockCounterparties as ApiSuccess<CounterpartyProfile[]>;
    }
    const response = await httpClient.get<CounterpartyProfile[]>(endpoints.counterparties.list);
    return response as ApiSuccess<CounterpartyProfile[]>;
  },

  /** Real endpoint (not yet implemented): POST /counterparties/:id/favourite */
  toggleFavourite: async (id: string): Promise<ApiSuccess<CounterpartyProfile>> => {
    if (appConfig.isMock) {
      await delay(250);
      const fixture = mockCounterparties as ApiSuccess<CounterpartyProfile[]>;
      const found = fixture.data.find((c) => c.id === id) ?? fixture.data[0];
      return { isSuccessful: true, data: { ...found, isFavourite: !found.isFavourite } };
    }
    const response = await httpClient.post<CounterpartyProfile>(
      endpoints.counterparties.toggleFavourite(id),
    );
    return response as ApiSuccess<CounterpartyProfile>;
  },

  /** Real endpoint (not yet implemented): POST /counterparties/:id/block */
  toggleBlocked: async (id: string): Promise<ApiSuccess<CounterpartyProfile>> => {
    if (appConfig.isMock) {
      await delay(250);
      const fixture = mockCounterparties as ApiSuccess<CounterpartyProfile[]>;
      const found = fixture.data.find((c) => c.id === id) ?? fixture.data[0];
      return { isSuccessful: true, data: { ...found, isBlocked: !found.isBlocked } };
    }
    const response = await httpClient.post<CounterpartyProfile>(
      endpoints.counterparties.toggleBlocked(id),
    );
    return response as ApiSuccess<CounterpartyProfile>;
  },
};
