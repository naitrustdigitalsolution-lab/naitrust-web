import type { SafeDealSummary } from '../store/types';
import { getMockDealRuntime } from './mock-protected-deal-store';
import { mockCreatedDealParticipantIndex } from './mock-deal-participants';

// Seeded counterparties for the mock personas. The creator is always a member;
// these IDs model the invited or accepted participant on selected deals.
const SEEDED_PARTICIPANTS: Record<string, string[]> = {
  deal_adaeze_aisha_01: ['usr_mock_007'],
  deal_adaeze_aisha_02: ['usr_mock_007'],
  deal_adaeze_aisha_03: ['usr_mock_007'],
  deal_adaeze_aisha_04: ['usr_mock_007'],
  deal_adaeze_aisha_05: ['usr_mock_007'],
  deal_adaeze_emeka_01: ['usr_mock_004'],
  deal_adaeze_emeka_02: ['usr_mock_004'],
  deal_adaeze_emeka_03: ['usr_mock_004'],
  deal_adaeze_emeka_04: ['usr_mock_004'],
  deal_adaeze_emeka_05: ['usr_mock_004'],
  deal_aisha_business_01: ['usr_mock_003'],
  deal_aisha_business_02: ['usr_mock_003'],
  deal_aisha_person_01: ['usr_mock_002'],
  deal_aisha_business_03: ['usr_mock_003'],
  deal_emeka_customer_01: ['usr_mock_001'],
  deal_emeka_customer_02: ['usr_mock_002'],
  deal_emeka_business_01: ['usr_mock_003'],
  deal_emeka_business_02: ['usr_mock_003'],
  deal_amaka_01: ['usr_mock_003'],
  deal_amaka_02: ['usr_mock_002'],
  deal_chidi_01: ['usr_mock_006'],
  deal_chidi_02: ['usr_mock_004'],
  deal_tunde_01: ['usr_mock_004'],
  deal_tunde_02: ['usr_mock_003'],
};

export function mockDealParticipantUserIds(dealId: string): string[] {
  return SEEDED_PARTICIPANTS[dealId] ?? [];
}

export function canMockUserAccessDeal(summary: SafeDealSummary, userId: string | undefined): boolean {
  if (!userId) return false;
  // Targeted repair for the completed Adaeze ↔ Emeka deal whose older mock
  // participant record was saved without Emeka's runtime participant ID.
  const isEmekaChinaCarDeal = summary.reference === 'NT-2026-072249' && userId === 'usr_mock_004';
  const ownerId = (summary as SafeDealSummary & { createdByUserId?: string }).createdByUserId;
  const runtime = getMockDealRuntime(summary.id);
  const acceptedRuntimeParticipant = runtime?.invitationStatus === 'accepted'
    && (runtime.participantUserIds ?? []).includes(userId);
  // A completed dynamic deal remains part of every named participant's
  // history even if another participant performed the invitation acceptance.
  const effectiveStatus = runtime?.status ?? summary.status;
  const payoutCompleted = runtime?.delivery?.fundingReview.status === 'paid_out';
  const singlePaymentCompletionRecorded = !runtime?.activePaymentStage
    && (runtime?.activity ?? []).some((item) => item.kind === 'completed');
  const completedDynamicParticipant = (['paid_out', 'completed'].includes(effectiveStatus) || payoutCompleted || singlePaymentCompletionRecorded)
    && mockCreatedDealParticipantIndex(summary.id, userId) >= 0;
  return ownerId === userId
    || isEmekaChinaCarDeal
    || (SEEDED_PARTICIPANTS[summary.id] ?? []).includes(userId)
    || acceptedRuntimeParticipant
    || completedDynamicParticipant;
}
