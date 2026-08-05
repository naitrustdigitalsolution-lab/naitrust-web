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
import type { ApiSuccess } from './types';
import {
  createMockCounterparty,
  getMockCounterparty,
  listMockCounterparties,
  listMockCounterpartyTransactions,
  toggleMockCounterpartyBlocked,
  toggleMockCounterpartyFavourite,
} from '../counterparties/counterparty-store';
import type { CreateCounterpartyInput, CounterpartyTransaction } from '../counterparties/types';

const MOCK_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const counterpartiesApi = {
  /** Real endpoint (not yet implemented): GET /counterparties */
  list: async (): Promise<ApiSuccess<CounterpartyProfile[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return { success: true, data: listMockCounterparties() };
    }
    const response = await httpClient.get<CounterpartyProfile[]>(endpoints.counterparties.list);
    return response as ApiSuccess<CounterpartyProfile[]>;
  },

  /** Frontend mock only; no backend endpoint is introduced in this phase. */
  get: async (id: string): Promise<ApiSuccess<CounterpartyProfile>> => {
    await delay(200);
    const found = getMockCounterparty(id);
    if (!found) throw new Error('Customer or supplier not found.');
    return { success: true, data: found };
  },

  /** Frontend mock only; persists in this browser for product testing. */
  create: async (input: CreateCounterpartyInput): Promise<ApiSuccess<CounterpartyProfile>> => {
    await delay(300);
    return { success: true, data: createMockCounterparty(input) };
  },

  /** Frontend mock only; transaction rows are stored in a separate fixture. */
  listTransactions: async (counterpartyId: string): Promise<ApiSuccess<CounterpartyTransaction[]>> => {
    await delay(250);
    return { success: true, data: listMockCounterpartyTransactions(counterpartyId) };
  },

  /** Real endpoint (not yet implemented): POST /counterparties/:id/favourite */
  toggleFavourite: async (id: string): Promise<ApiSuccess<CounterpartyProfile>> => {
    if (appConfig.isMock) {
      await delay(250);
      const found = toggleMockCounterpartyFavourite(id);
      if (!found) throw new Error('Customer or supplier not found.');
      return { success: true, data: found };
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
      const found = toggleMockCounterpartyBlocked(id);
      if (!found) throw new Error('Customer or supplier not found.');
      return { success: true, data: found };
    }
    const response = await httpClient.post<CounterpartyProfile>(
      endpoints.counterparties.toggleBlocked(id),
    );
    return response as ApiSuccess<CounterpartyProfile>;
  },
};
