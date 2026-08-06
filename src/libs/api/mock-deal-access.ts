import type { SafeDealSummary } from '../store/types';
import { getMockDealRuntime } from './mock-protected-deal-store';

// Seeded counterparties for the mock personas. The creator is always a member;
// these IDs model the invited or accepted participant on selected deals.
const SEEDED_PARTICIPANTS: Record<string, string[]> = {
  txn_mock_001: ['usr_mock_001'],
  txn_mock_002: ['usr_mock_002'],
  txn_mock_003: ['usr_mock_007'],
  txn_mock_004: ['usr_mock_001'],
  txn_mock_005: ['usr_mock_002'],
  txn_mock_029: ['usr_mock_002'],
  txn_mock_031: ['usr_mock_007'],
  txn_mock_032: ['usr_mock_002'],
  txn_mock_033: ['usr_mock_003'],
  txn_mock_034: ['usr_mock_001'],
  txn_mock_036: ['usr_mock_001'],
  txn_mock_037: ['usr_mock_007'],
  txn_mock_039: ['usr_mock_002'],
  txn_mock_041: ['usr_mock_007'],
  txn_mock_035: ['usr_mock_006'],
  txn_mock_038: ['usr_mock_003'],
  txn_mock_040: ['usr_mock_006'],
  txn_mock_042: ['usr_mock_003'],
  txn_mock_044: ['usr_mock_002'],
  txn_mock_045: ['usr_mock_006'],
  txn_mock_047: ['usr_mock_001'],
};

export function canMockUserAccessDeal(summary: SafeDealSummary, userId: string | undefined): boolean {
  if (!userId) return false;
  const ownerId = (summary as SafeDealSummary & { createdByUserId?: string }).createdByUserId;
  return ownerId === userId || (SEEDED_PARTICIPANTS[summary.id] ?? []).includes(userId) || (getMockDealRuntime(summary.id)?.participantUserIds ?? []).includes(userId);
}
