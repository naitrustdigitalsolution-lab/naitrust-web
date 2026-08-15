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
import authFixtures from '../../mocks/apis/auth-users.json';
import businessFixtures from '../../mocks/apis/businesses.json';
import { getMockDealRuntime, grantMockDealAccess, listMockCreatedDeals, patchMockDealRuntime } from './mock-protected-deal-store';
import { mockCreatedDealParticipantIndex, mockCreatedDealRoleContext } from './mock-deal-participants';
import { useAuthStore } from '../store/auth.store';
import { notificationsApi } from './notifications.api';
import { bindMockDealIdentityCapture, listMockDealIdentityCaptures } from './deal-identity-captures.mock';

const MOCK_LATENCY_MS = 400;
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockList = (mockInvitations as ApiSuccess<DealInvitation[]>).data;

function createdInvitationFor(deal: ReturnType<typeof listMockCreatedDeals>[number], userId: string): DealInvitation | null {
  const participantIndex = mockCreatedDealParticipantIndex(deal.summary.id, userId);
  if (participantIndex < 0) return null;
  const ownerId = (deal.summary as typeof deal.summary & { createdByUserId?: string }).createdByUserId;
  const owner = authFixtures.users.find((record) => record.user.id === ownerId)?.user;
  const ownerBusiness = businessFixtures.data.find((business) => business.id === deal.summary.businessId)
    ?? businessFixtures.data.find((business) => business.ownerUserId === ownerId);
  const runtime = getMockDealRuntime(deal.summary.id);
  // One-time compatibility migration: declines made before the confirmation
  // flow recorded a response timestamp are restored for another review.
  if (runtime?.invitationStatus === 'declined' && !runtime.invitationRespondedAt) {
    patchMockDealRuntime(deal.summary.id, { invitationStatus: 'pending', status: 'pending_counterparty' });
  }
  const currentRuntime = getMockDealRuntime(deal.summary.id);
  const runtimeStatus = currentRuntime?.invitationStatus;
  const legacyInput = deal.input as typeof deal.input & { expiresInDays?: number; actionLiveness?: typeof deal.input.actionLiveness };
  const expiresInDays = Number.isFinite(legacyInput.expiresInDays) && (legacyInput.expiresInDays ?? 0) > 0
    ? legacyInput.expiresInDays!
    : 14;
  const expiresAt = new Date(new Date(deal.summary.createdAt).getTime() + expiresInDays * 86400000).toISOString();
  const expired = Date.now() > new Date(expiresAt).getTime();
  const { creatorRole } = mockCreatedDealRoleContext(deal.summary.id);
  const storedCreatorCapture = listMockDealIdentityCaptures(deal.summary.id).find((capture) => capture.action === 'deal_created');
  const actionLiveness = legacyInput.actionLiveness;
  const creatorIdentityCapture = storedCreatorCapture ?? (actionLiveness ? {
    captureId: actionLiveness.captureId,
    subjectUserId: actionLiveness.actorUserId,
    representativeName: owner?.name ?? ownerBusiness?.name ?? 'Deal representative',
    businessName: ownerBusiness?.name,
    action: 'deal_created' as const,
    capturedAt: actionLiveness.verifiedAt,
    verificationStatus: 'passed' as const,
    encryptedEvidenceRef: `capture://${actionLiveness.captureId}`,
    photoAvailable: false,
    legalHold: false,
  } : undefined);
  return {
    id: deal.summary.id,
    publicToken: deal.summary.publicInvitePath?.split('/').pop(),
    recipientUserId: userId,
    reference: deal.summary.reference,
    inviterName: ownerBusiness?.name ?? owner?.name ?? 'Naitrust member',
    fromRole: creatorRole,
    yourRole: creatorRole === 'seller' ? 'buyer' : 'seller',
    partyMode: deal.input.partyMode,
    title: deal.summary.title,
    amountMinor: deal.summary.amountMinor,
    currency: deal.summary.currency,
    message: deal.input.description,
    agreement: deal.input.agreement,
    createdAt: deal.summary.createdAt,
    expiresAt,
    status: runtimeStatus ?? (expired ? 'expired' : 'pending'),
    responseReason: currentRuntime?.invitationResponseReason,
    creatorIdentityCapture,
  };
}

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
  const createdDeal = listMockCreatedDeals().find((deal) => deal.summary.publicInvitePath?.endsWith(`/${token}`));
  if (createdDeal) {
    const participant = createdDeal.input.participants[0];
    const contact = participant?.email ?? participant?.phone ?? participant?.identifier;
    const creatorUserId = (createdDeal.summary as typeof createdDeal.summary & { createdByUserId?: string }).createdByUserId;
    const creatorUser = authFixtures.users.find((record) => record.user.id === creatorUserId)?.user;
    const creatorBusiness = businessFixtures.data.find((business) => business.id === createdDeal.summary.businessId)
      ?? businessFixtures.data.find((business) => business.ownerUserId === creatorUserId);
    const { creatorRole } = mockCreatedDealRoleContext(createdDeal.summary.id);
    const actionLiveness = (createdDeal.input as typeof createdDeal.input & { actionLiveness?: typeof createdDeal.input.actionLiveness }).actionLiveness;
    return {
      token,
      invitationId: createdDeal.summary.id,
      reference: createdDeal.summary.reference,
      inviterName: creatorBusiness?.name ?? creatorUser?.name ?? 'Naitrust member',
      inviterVerified: true,
      inviterAccountType: creatorBusiness ? 'business' : 'customer',
      intendedAccountType: createdDeal.input.partyMode === 'b2b' ? 'business' : 'customer',
      yourRole: creatorRole === 'seller' ? 'buyer' : 'seller',
      title: createdDeal.summary.title,
      amountMinor: createdDeal.summary.amountMinor,
      currency: createdDeal.summary.currency,
      expiresAt: new Date(new Date(createdDeal.summary.createdAt).getTime() + 14 * 86400000).toISOString(),
      status: 'pending',
      maskedContact: maskContact(contact),
      inviterRepresentativeName: creatorUser?.name ?? creatorBusiness?.name ?? 'Deal representative',
      inviterLivenessConfirmed: Boolean(actionLiveness?.captureId),
      inviterLivenessCapturedAt: actionLiveness?.verifiedAt,
    };
  }
  const scenario = PUBLIC_SCENARIOS[token];
  if (!scenario) return null;
  const invitation = mockList[scenario.index];
  if (!invitation) return null;
  const intendedAccountType = token === 'nt-invite-business' ? 'business' : 'customer';
  return {
    token,
    invitationId: invitation.id,
    reference: invitation.reference,
    inviterName: invitation.inviterName,
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
    inviterRepresentativeName: invitation.inviterName,
    inviterLivenessConfirmed: false,
  };
}

export const invitationsApi = {
  /** GET /invitations/public/:token: intentionally excludes agreement/documents. */
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

  /** POST /invitations/public/:token/claim: binds token to authenticated account. */
  claim: async (
    token: string,
    user: Pick<User, 'id' | 'email' | 'phone' | 'naitrustId' | 'role' | 'kycVerified'>,
  ): Promise<ApiSuccess<{ invitationId: string; destination: string }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const preview = publicPreview(token);
      if (!preview) throw new Error('This invitation cannot be claimed.');
      if (preview.status === 'wrong_recipient') throw new Error('This invitation belongs to another recipient.');
      if (preview.status !== 'pending') throw new Error('This invitation cannot be claimed.');
      const createdDeal = listMockCreatedDeals().find((deal) => deal.summary.publicInvitePath?.endsWith(`/${token}`));
      if (createdDeal) {
        // Use the same recipient resolution as the authenticated invitation
        // list. It understands verified business profiles, payment account
        // numbers, and compatibility names on older locally-created deals.
        if (mockCreatedDealParticipantIndex(createdDeal.summary.id, user.id, [user.email, user.phone, user.naitrustId]) < 0) {
          throw new Error('Sign in with the person or verified business account this invitation was sent to.');
        }
        if (
          createdDeal.input.partyMode === 'b2b' &&
          ((user.role !== 'business' && user.role !== 'business-member') || !user.kycVerified)
        ) {
          throw new Error('This invitation requires a verified business account.');
        }
        grantMockDealAccess(createdDeal.summary.id, user.id);
        return { success: true, data: { invitationId: createdDeal.summary.id, destination: `/app/invitations/${createdDeal.summary.id}` } };
      }
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
      const userId = useAuthStore.getState().user?.id;
      if (!userId) return { success: true, data: [] };
      const created = listMockCreatedDeals()
        .map((deal) => createdInvitationFor(deal, userId))
        .filter((invitation): invitation is DealInvitation => Boolean(invitation));
      const seeded = mockList
        .filter((invitation) => !invitation.recipientUserId || invitation.recipientUserId === userId)
        .map((invitation) => invitation.status === 'pending' && Date.now() > new Date(invitation.expiresAt).getTime()
          ? { ...invitation, status: 'expired' as const }
          : invitation);
      return { success: true, data: [...created, ...seeded].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
    }
    const response = await httpClient.get<DealInvitation[]>(endpoints.invitations.list);
    return response as ApiSuccess<DealInvitation[]>;
  },

  /** GET /invitations/:id */
  getOne: async (id: string): Promise<ApiSuccess<DealInvitation>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const userId = useAuthStore.getState().user?.id;
      const createdDeal = userId ? listMockCreatedDeals().find((deal) => deal.summary.id === id) : undefined;
      const rawFound = createdDeal && userId
        ? createdInvitationFor(createdDeal, userId)
        : mockList.find((inv) => inv.id === id && (!inv.recipientUserId || inv.recipientUserId === userId));
      const found = rawFound?.status === 'pending' && Date.now() > new Date(rawFound.expiresAt).getTime()
        ? { ...rawFound, status: 'expired' as const }
        : rawFound;
      if (!found) {
        return { success: true, data: undefined as unknown as DealInvitation };
      }
      return { success: true, data: found };
    }
    const response = await httpClient.get<DealInvitation>(endpoints.invitations.getOne(id));
    return response as ApiSuccess<DealInvitation>;
  },

  /** POST /invitations/:id/resend */
  resend: async (id: string): Promise<ApiSuccess<{ publicInvitePath?: string }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const userId = useAuthStore.getState().user?.id;
      const createdDeal = listMockCreatedDeals().find((deal) => deal.summary.id === id);
      if (!createdDeal || createdDeal.summary.createdByUserId !== userId) throw new Error('Only the deal creator can resend this invitation.');
      const runtime = getMockDealRuntime(id);
      if (!['pending_counterparty', 'terms_negotiation'].includes(runtime?.status ?? createdDeal.summary.status)) throw new Error('This invitation is no longer pending.');
      const now = new Date().toISOString();
      patchMockDealRuntime(id, { activity: [...(runtime?.activity ?? []), { id: `invite_resent_${crypto.randomUUID()}`, kind: 'message', message: 'You resent the deal invitation.', createdAt: now }] });
      return { success: true, data: { publicInvitePath: createdDeal.summary.publicInvitePath } };
    }
    const response = await httpClient.post<{ publicInvitePath?: string }>(endpoints.invitations.resend(id));
    return response as ApiSuccess<{ publicInvitePath?: string }>;
  },

  /** POST /invitations/:id/accept | /decline */
  respond: async (
    id: string,
    action: Extract<InvitationStatus, 'accepted' | 'changes_requested' | 'declined'>,
    reason?: string,
    livenessVerifiedAt?: string,
    livenessCaptureId?: string,
  ): Promise<ApiSuccess<{ id: string; status: InvitationStatus }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const userId = useAuthStore.getState().user?.id;
      const createdDeal = listMockCreatedDeals().find((deal) => deal.summary.id === id);
      if (createdDeal && userId && mockCreatedDealParticipantIndex(id, userId) >= 0) {
        const ownerUserId = createdDeal.summary.createdByUserId;
        const currentRuntime = getMockDealRuntime(id);
        const responseAt = new Date().toISOString();
        patchMockDealRuntime(id, {
          invitationStatus: action,
          status: action === 'accepted' ? 'awaiting_funding' : action === 'changes_requested' ? 'terms_negotiation' : 'cancelled',
          invitationResponseReason: reason?.trim() || undefined,
          invitationRespondedAt: responseAt,
          invitationLivenessVerifiedAt: action === 'accepted' ? livenessVerifiedAt : undefined,
          activity: action === 'changes_requested'
            ? [
                ...(currentRuntime?.activity ?? []),
                {
                  id: `invite_changes_${crypto.randomUUID()}`,
                  kind: 'message',
                  message: `Invitee requested changes${reason?.trim() ? `: ${reason.trim()}` : '.'}`,
                  createdAt: responseAt,
                },
              ]
            : currentRuntime?.activity,
        });
        if (action === 'accepted') grantMockDealAccess(id, userId);
        if (action === 'accepted' && livenessCaptureId) bindMockDealIdentityCapture(livenessCaptureId, id);
        if (ownerUserId && action === 'changes_requested') {
          notificationsApi.pushLocal({ userId: ownerUserId, type: 'deal', title: 'Invitation changes requested', message: `${createdDeal.summary.counterpartyName} requested changes to ${createdDeal.summary.title}${reason?.trim() ? `: ${reason.trim()}` : '.'}`, link: `/app/deals/${id}` });
        }
        if (ownerUserId && action === 'declined') {
          notificationsApi.pushLocal({ userId: ownerUserId, type: 'deal', title: 'Deal invitation declined', message: `${createdDeal.summary.counterpartyName} declined ${createdDeal.summary.title}${reason?.trim() ? `: ${reason.trim()}` : '.'}`, link: `/app/deals/${id}` });
        }
      }
      return { success: true, data: { id, status: action } };
    }
    const endpoint = action === 'accepted'
      ? endpoints.invitations.accept(id)
      : action === 'changes_requested'
        ? endpoints.negotiations.propose(id)
        : endpoints.invitations.decline(id);
    const response = await httpClient.post<{ id: string; status: InvitationStatus }>(endpoint, {
      action,
      reason: reason?.trim() || undefined,
      livenessVerifiedAt: action === 'accepted' ? livenessVerifiedAt : undefined,
      livenessCaptureId: action === 'accepted' ? livenessCaptureId : undefined,
    });
    return response as ApiSuccess<{ id: string; status: InvitationStatus }>;
  },
};
