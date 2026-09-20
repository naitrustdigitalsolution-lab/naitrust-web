import { assertActiveAccount } from '../../features/legal/access';
/**
 * Deal Chat API
 * Messages between the parties inside a transaction room. In mock mode the
 * thread persists in the current browser, with authors resolved for each viewer.
 * Activity updates use the same shared message endpoint.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ApiSuccess } from './types';
import { useAuthStore } from '../store/auth.store';
import { findMockCreatedDeal } from './mock-protected-deal-store';
import type { DealMessage } from '../store/types';

const MOCK_LATENCY_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Browser-local preview threads keyed by deal id. */
const threadKey = (id: string) => `naitrust:deal-messages:${id}`;
export const ACTIVITY_UPDATE_PREFIX = 'Activity update: ';
function readThread(id: string, name: string): DealMessage[] {
  try { const saved = JSON.parse(localStorage.getItem(threadKey(id)) ?? 'null'); if (Array.isArray(saved)) return saved; } catch { /* Ignore invalid preview data. */ }
  return findMockCreatedDeal(id) ? [] : seedThread(id, name);
}
async function assertParticipant(id: string) {
  const { dealDetailApi } = await import('./deal-detail.api');
  if (!(await dealDetailApi.getOne(id)).data) throw new Error('This deal is unavailable.');
}

function seedThread(dealId: string, counterpartyName: string): DealMessage[] {
  const base = Date.now() - 3 * 3600_000;
  return [
    {
      id: `${dealId}_m1`,
      dealId,
      senderId: 'party_cp',
      senderName: counterpartyName,
      isYou: false,
      body: 'Hi, thanks for setting up the Protected Deal. I can start once funding is confirmed.',
      createdAt: new Date(base).toISOString(),
    },
    {
      id: `${dealId}_m2`,
      dealId,
      senderId: 'party_you',
      senderName: 'You',
      isYou: true,
      body: 'Great. Funding is on the way: please share progress here as you go.',
      createdAt: new Date(base + 900_000).toISOString(),
    },
  ];
}

export const dealMessagesApi = {
  /** GET /transactions/:id/messages */
  list: async (dealId: string, counterpartyName = 'Counterparty'): Promise<ApiSuccess<DealMessage[]>> => {
    assertActiveAccount();
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      await assertParticipant(dealId);
      const viewerId = useAuthStore.getState().user?.id;
      return { success: true, data: readThread(dealId, counterpartyName).map(m => ({ ...m, isYou: m.senderId === viewerId })) };
    }
    const response = await httpClient.get<DealMessage[]>(endpoints.transactions.messages(dealId));
    return response as ApiSuccess<DealMessage[]>;
  },

  /** POST /transactions/:id/messages */
  send: async (dealId: string, body: string): Promise<ApiSuccess<DealMessage>> => {
    assertActiveAccount();
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      await assertParticipant(dealId);
      const user = useAuthStore.getState().user;
      if (!user || !body.trim()) throw new Error('Write an update before posting.');
      const message: DealMessage = {
        id: `${dealId}_${crypto.randomUUID()}`,
        dealId,
        senderId: user.id,
        senderName: user.name,
        isYou: true,
        body,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(threadKey(dealId), JSON.stringify([...readThread(dealId, 'Counterparty'), message]));
      return { success: true, data: message };
    }
    const response = await httpClient.post<DealMessage>(endpoints.transactions.sendMessage(dealId), {
      body,
    });
    return response as ApiSuccess<DealMessage>;
  },
};
