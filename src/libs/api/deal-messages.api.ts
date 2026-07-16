/**
 * Deal Chat API
 * Messages between the parties inside a transaction room. In mock mode the
 * thread is held in session module state (seeded per deal, reset on reload)
 * so sending a message reflects immediately, mirroring the mock-auth engine.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ApiSuccess } from './transactions.api';
import type { DealMessage } from '../store/types';

const MOCK_LATENCY_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Session-scoped threads keyed by deal id. */
const threads: Record<string, DealMessage[]> = {};

function seedThread(dealId: string, counterpartyName: string): DealMessage[] {
  const base = Date.now() - 3 * 3600_000;
  return [
    {
      id: `${dealId}_m1`,
      dealId,
      senderId: 'party_cp',
      senderName: counterpartyName,
      isYou: false,
      body: 'Hi — thanks for setting up the safe deal. I can start once funding is confirmed.',
      createdAt: new Date(base).toISOString(),
    },
    {
      id: `${dealId}_m2`,
      dealId,
      senderId: 'party_you',
      senderName: 'You',
      isYou: true,
      body: 'Great. Funding is on the way — please share progress here as you go.',
      createdAt: new Date(base + 900_000).toISOString(),
    },
  ];
}

export const dealMessagesApi = {
  /** GET /transactions/:id/messages */
  list: async (dealId: string, counterpartyName = 'Counterparty'): Promise<ApiSuccess<DealMessage[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      if (!threads[dealId]) threads[dealId] = seedThread(dealId, counterpartyName);
      return { success: true, data: threads[dealId].map((m) => ({ ...m })) };
    }
    const response = await httpClient.get<DealMessage[]>(endpoints.transactions.messages(dealId));
    return response as ApiSuccess<DealMessage[]>;
  },

  /** POST /transactions/:id/messages */
  send: async (dealId: string, body: string): Promise<ApiSuccess<DealMessage>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const message: DealMessage = {
        id: `${dealId}_${crypto.randomUUID()}`,
        dealId,
        senderId: 'party_you',
        senderName: 'You',
        isYou: true,
        body,
        createdAt: new Date().toISOString(),
      };
      if (!threads[dealId]) threads[dealId] = [];
      threads[dealId].push(message);
      return { success: true, data: message };
    }
    const response = await httpClient.post<DealMessage>(endpoints.transactions.sendMessage(dealId), {
      body,
    });
    return response as ApiSuccess<DealMessage>;
  },
};
