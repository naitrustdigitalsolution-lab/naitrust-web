import type { SafeDealSummary } from '../store/types';
import { getMockDealRuntime } from './mock-protected-deal-store';

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

export function canMockUserAccessDeal(summary: SafeDealSummary, userId: string | undefined): boolean {
  if (!userId) return false;
  const ownerId = (summary as SafeDealSummary & { createdByUserId?: string }).createdByUserId;
  return ownerId === userId || (SEEDED_PARTICIPANTS[summary.id] ?? []).includes(userId) || (getMockDealRuntime(summary.id)?.participantUserIds ?? []).includes(userId);
}
