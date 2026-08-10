/**
 * Transactions (Safe Deal) API
 * Typed access to the safe-deal transaction endpoints.
 *
 * In mock mode (`VITE_APP_MODE=mock`) methods resolve fixture data from
 * `src/mocks/apis/` with simulated latency, using the exact same response
 * envelope the real backend returns: screens and hooks are unaware of the
 * difference. Flip the env var to `dev`/`prod` to hit the real API.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { CreateSafeDealInput, CreateSafeDealResult, SafeDealSummary } from '../store/types';
import mockTransactions from '../../mocks/apis/transactions.json';
import type { ApiSuccess } from './types';
import { getMockDealRuntime, listMockCreatedDeals, patchMockDealRuntime, saveMockCreatedDeal, updateMockCreatedDeal } from './mock-protected-deal-store';
import { notificationsApi } from './notifications.api';
import { mockCreatedDealRoleContext, mockDealPartyLabel, mockParticipantUserId } from './mock-deal-participants';
import { useAuthStore } from '../store/auth.store';
import { canMockUserAccessDeal } from './mock-deal-access';

const MOCK_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const transactionsApi = {
  updateTransaction: async (id: string, input: CreateSafeDealInput): Promise<ApiSuccess<CreateSafeDealResult>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const userId = useAuthStore.getState().user?.id;
      const existing = listMockCreatedDeals().find((deal) => deal.summary.id === id);
      if (!existing || !userId || existing.summary.createdByUserId !== userId) throw new Error('Only the deal creator can edit this invitation.');
      const { selfParticipantIndex } = mockCreatedDealRoleContext(id);
      const inviteeUserIds = input.participants.filter((_, index) => index !== selfParticipantIndex).map(mockParticipantUserId).filter((value): value is string => Boolean(value));
      const first = input.participants.filter((_, index) => index !== selfParticipantIndex)[0];
      const updated = updateMockCreatedDeal(id, (deal) => ({
        input,
        summary: {
          ...deal.summary,
          title: input.title,
          counterpartyName: first?.name ?? deal.summary.counterpartyName,
          amountMinor: input.amountMinor,
          initialPaymentMinor: input.initialPaymentMinor,
          remainingPaymentMinor: input.remainingPaymentMinor,
          nextPaymentReleaseConditions: input.nextPaymentReleaseConditions,
          status: 'pending_counterparty',
        },
      }))!;
      patchMockDealRuntime(id, { invitationStatus: 'pending', status: 'pending_counterparty', invitationResponseReason: undefined, invitationRespondedAt: undefined });
      inviteeUserIds.forEach((inviteeUserId) => notificationsApi.pushLocal({ userId: inviteeUserId, type: 'deal', title: 'Deal invitation updated', message: `${input.title} was updated and is ready for your review.`, link: `/app/invitations/${id}` }));
      return { success: true, data: updated.summary, message: 'Deal invitation updated' };
    }
    return await httpClient.patch<CreateSafeDealResult>(`/transactions/${id}`, input) as ApiSuccess<CreateSafeDealResult>;
  },
  /**
   * Get the current user's safe deals.
   * Real endpoint: GET /transactions/my
   */
  getMyTransactions: async (): Promise<ApiSuccess<SafeDealSummary[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const fixture = (mockTransactions as ApiSuccess<SafeDealSummary[]>).data;
      const created = listMockCreatedDeals().map((deal) => deal.summary);
      const userId = useAuthStore.getState().user?.id;
      const visibleDeals = [...created, ...fixture]
        .filter((deal) => canMockUserAccessDeal(deal, userId))
        .map((deal) => {
          const runtime = getMockDealRuntime(deal.id);
          const singlePaymentCompletionRecorded = !runtime?.activePaymentStage
            && (runtime?.activity ?? []).some((item) => item.kind === 'completed');
          const recoveredStatus = runtime?.delivery?.fundingReview.status === 'paid_out' || singlePaymentCompletionRecorded
            ? 'paid_out' as const
            : runtime?.status;
          if (recoveredStatus === 'paid_out' && runtime?.status !== 'paid_out') {
            patchMockDealRuntime(deal.id, { status: 'paid_out', invitationStatus: 'accepted' });
          }
          return {
            ...deal,
            counterpartyName: mockDealPartyLabel(deal, userId),
            status: recoveredStatus ?? deal.status,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { success: true, data: visibleDeals };
    }
    const response = await httpClient.get<SafeDealSummary[]>(
      endpoints.transactions.getMyTransactions,
    );
    return response as ApiSuccess<SafeDealSummary[]>;
  },

  /**
   * Create a safe deal and invite the counterparty.
   * Real endpoint: POST /transactions
   * In mock mode returns a freshly-created summary in `pending_counterparty`.
   */
  createTransaction: async (input: CreateSafeDealInput): Promise<ApiSuccess<CreateSafeDealResult>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const now = new Date();
      const first = input.participants[0];
      const counterpartyName =
        input.participants.length > 1
          ? `${first?.name ?? 'Counterparty'} +${input.participants.length - 1}`
          : (first?.name ?? 'Counterparty');
      const token = `nt-invite-new-${crypto.randomUUID()}`;
      const creator = useAuthStore.getState().user;
      const selectedBusinessId = creator?.role === 'business' || creator?.role === 'business-member'
        ? localStorage.getItem('naitrust_selected_business_id') ?? undefined
        : undefined;
      const summary: CreateSafeDealResult & { createdByUserId?: string } = {
        id: `txn_${crypto.randomUUID()}`,
        reference: `NT-${now.getFullYear()}-${String(Math.floor(now.getTime() / 1000) % 1000000).padStart(6, '0')}`,
        title: input.title,
        counterpartyName,
        amountMinor: input.amountMinor,
        initialPaymentMinor: input.initialPaymentMinor,
        remainingPaymentMinor: input.remainingPaymentMinor,
        nextPaymentReleaseConditions: input.nextPaymentReleaseConditions,
        currency: input.currency,
        status: 'pending_counterparty',
        createdAt: now.toISOString(),
        createdByUserId: creator?.id,
        businessId: selectedBusinessId,
        publicInvitePath: `/invite/${token}`,
      };
      saveMockCreatedDeal({ summary, input });
      return { success: true, data: summary, message: 'Safe deal created' };
    }
    const response = await httpClient.post<CreateSafeDealResult>(endpoints.transactions.create, input);
    return response as ApiSuccess<CreateSafeDealResult>;
  },
};
