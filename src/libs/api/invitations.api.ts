/**
 * Deal Invitations API
 * Typed access to incoming safe-deal invitations.
 *
 * In mock mode (`VITE_APP_MODE=mock`) resolves fixture data from
 * `src/mocks/apis/invitations.json` with simulated latency; accept/decline
 * echo the updated status without persisting (session-only), matching the
 * real backend's response envelope.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { DealInvitation, InvitationStatus } from '../store/types';
import type { ApiSuccess } from './types';
import mockInvitations from '../../mocks/apis/invitations.json';

const MOCK_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockList = (mockInvitations as ApiSuccess<DealInvitation[]>).data;

export const invitationsApi = {
  /** GET /invitations */
  list: async (): Promise<ApiSuccess<DealInvitation[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return mockInvitations as ApiSuccess<DealInvitation[]>;
    }
    const response = await httpClient.get<DealInvitation[]>(endpoints.invitations.list);
    return response as ApiSuccess<DealInvitation[]>;
  },

  /** GET /invitations/:id */
  getOne: async (id: string): Promise<ApiSuccess<DealInvitation>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const found = mockList.find((inv) => inv.id === id);
      if (!found) {
        return { success: true, data: undefined as unknown as DealInvitation };
      }
      return { success: true, data: found };
    }
    const response = await httpClient.get<DealInvitation>(endpoints.invitations.getOne(id));
    return response as ApiSuccess<DealInvitation>;
  },

  /** POST /invitations/:id/accept | /decline */
  respond: async (
    id: string,
    action: Extract<InvitationStatus, 'accepted' | 'declined'>,
  ): Promise<ApiSuccess<{ id: string; status: InvitationStatus }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return { success: true, data: { id, status: action } };
    }
    const endpoint =
      action === 'accepted' ? endpoints.invitations.accept(id) : endpoints.invitations.decline(id);
    const response = await httpClient.post<{ id: string; status: InvitationStatus }>(endpoint);
    return response as ApiSuccess<{ id: string; status: InvitationStatus }>;
  },
};
