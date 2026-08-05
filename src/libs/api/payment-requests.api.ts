/**
 * Payment Requests API
 * Typed access to requesting an instant payment from a counterparty.
 *
 * No backend endpoint exists for this yet (see endpoints.ts): every method
 * is mock-only for this phase.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { PaymentRequest } from '../store/types';
import mockPaymentRequests from '../../mocks/apis/payment-requests.json';
import type { ApiSuccess } from './types';

const MOCK_LATENCY_MS = 350;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const paymentRequestsApi = {
  /** Real endpoint (not yet implemented): GET /payment-requests */
  list: async (): Promise<ApiSuccess<PaymentRequest[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return mockPaymentRequests as ApiSuccess<PaymentRequest[]>;
    }
    const response = await httpClient.get<PaymentRequest[]>(endpoints.paymentRequests.list);
    return response as ApiSuccess<PaymentRequest[]>;
  },

  /** Real endpoint (not yet implemented): POST /payment-requests */
  create: async (input: {
    requestedFromName: string;
    amountMinor: number;
    currency: string;
    reason?: string;
  }): Promise<ApiSuccess<PaymentRequest>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const now = new Date();
      const request: PaymentRequest = {
        id: `preq_mock_${crypto.randomUUID()}`,
        reference: `PR-${now.getFullYear()}-${String(Math.floor(now.getTime() / 1000) % 1000000).padStart(6, '0')}`,
        requestedFromName: input.requestedFromName,
        amountMinor: input.amountMinor,
        currency: input.currency,
        reason: input.reason,
        status: 'pending',
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      return { success: true, data: request, message: 'Sandbox payment request sent' };
    }
    const response = await httpClient.post<PaymentRequest>(
      endpoints.paymentRequests.create,
      input,
    );
    return response as ApiSuccess<PaymentRequest>;
  },

  /** Real endpoint (not yet implemented): POST /payment-requests/:id/respond */
  respond: async (
    id: string,
    action: 'fulfil' | 'decline',
  ): Promise<ApiSuccess<PaymentRequest>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const fixture = mockPaymentRequests as ApiSuccess<PaymentRequest[]>;
      const found = fixture.data.find((request) => request.id === id) ?? fixture.data[0];
      return {
        success: true,
        data: { ...found, status: action === 'fulfil' ? 'fulfilled' : 'declined' },
      };
    }
    const response = await httpClient.post<PaymentRequest>(
      endpoints.paymentRequests.respond(id),
      { action },
    );
    return response as ApiSuccess<PaymentRequest>;
  },
};
