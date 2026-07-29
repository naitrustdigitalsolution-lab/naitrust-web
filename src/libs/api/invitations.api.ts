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
import type {
  DealInvitation,
  InvitationStatus,
  PublicInvitationPreview,
  User,
} from '../store/types';
import type { ApiSuccess } from './types';
import mockInvitations from '../../mocks/apis/invitations.json';

const MOCK_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockList = (mockInvitations as ApiSuccess<DealInvitation[]>).data;

const PUBLIC_SCENARIOS: Record<string, { index: number; status?: PublicInvitationPreview['status']; intendedContact?: string }> = {
  'nt-invite-live': { index: 0, status: 'pending' },
  'nt-invite-business': { index: 1, status: 'pending', intendedContact: 'business@example.com' },
  'nt-invite-expired': { index: 2, status: 'expired' },
  'nt-invite-withdrawn': { index: 0, status: 'withdrawn' },
  'nt-invite-claimed': { index: 6, status: 'already_claimed' },
  'nt-invite-wrong-recipient': { index: 0, status: 'wrong_recipient', intendedContact: 'another@example.com' },
};

function maskContact(contact?: string): string | undefined {
  if (!contact) return undefined;
  const [name, domain] = contact.split('@');
  if (!domain) return contact.replace(/.(?=.{3})/g, '•');
  return `${name.slice(0, 2)}•••@${domain}`;
}

function publicPreview(token: string): PublicInvitationPreview | null {
  const scenario = token.startsWith('nt-invite-new-')
    ? { index: 0, status: 'pending' as const, intendedContact: 'invited@example.com' }
    : PUBLIC_SCENARIOS[token];
  if (!scenario) return null;
  const invitation = mockList[scenario.index];
  if (!invitation) return null;
  const intendedAccountType = token === 'nt-invite-business' ? 'business' : 'customer';
  return {
    token,
    invitationId: invitation.id,
    reference: invitation.reference,
    inviterName: invitation.fromName,
    inviterVerified: true,
    inviterAccountType: invitation.fromRole === 'seller' ? 'business' : 'customer',
    intendedAccountType,
    yourRole: invitation.yourRole,
    title: invitation.title,
    amountMinor: invitation.amountMinor,
    currency: invitation.currency,
    expiresAt:
      (scenario.status ?? invitation.status) === 'pending'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : invitation.expiresAt,
    status: scenario.status ?? invitation.status,
    maskedContact: maskContact(scenario.intendedContact),
  };
}

export const invitationsApi = {
  /** GET /invitations/public/:token — intentionally excludes agreement/documents. */
  getPublicPreview: async (token: string): Promise<ApiSuccess<PublicInvitationPreview | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return { success: true, data: publicPreview(token) };
    }
    const response = await httpClient.get<PublicInvitationPreview>(
      endpoints.invitations.publicPreview(token),
    );
    return response as ApiSuccess<PublicInvitationPreview | null>;
  },

  /** POST /invitations/public/:token/claim — binds token to authenticated account. */
  claim: async (
    token: string,
    user: Pick<User, 'id' | 'email' | 'role' | 'kycVerified'>,
  ): Promise<ApiSuccess<{ invitationId: string; destination: string }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const preview = publicPreview(token);
      if (!preview) throw new Error('This invitation cannot be claimed.');
      if (preview.status === 'wrong_recipient') throw new Error('This invitation belongs to another recipient.');
      if (preview.status !== 'pending') throw new Error('This invitation cannot be claimed.');
      if (
        preview.intendedAccountType === 'business' &&
        ((user.role !== 'business' && user.role !== 'business-member') || !user.kycVerified)
      ) {
        throw new Error('This invitation requires a verified business account.');
      }
      return {
        success: true,
        data: {
          invitationId: preview.invitationId,
          destination: `/app/invitations/${preview.invitationId}`,
        },
      };
    }
    const response = await httpClient.post<{ invitationId: string; destination: string }>(
      endpoints.invitations.claim(token),
    );
    return response as ApiSuccess<{ invitationId: string; destination: string }>;
  },

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
