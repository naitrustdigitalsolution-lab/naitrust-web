import type {
  CreateSafeDealInput,
  CreateSafeDealResult,
  DealActivityEvent,
  DealDeliveryLifecycle,
  SafeDealStatus,
  InvitationStatus,
} from '../store/types';

const STORAGE_KEY = 'naitrust:protected-deal-runtime:v2';

export interface MockCreatedDeal {
  summary: CreateSafeDealResult;
  input: CreateSafeDealInput;
}

interface MockDealRuntime {
  delivery?: DealDeliveryLifecycle;
  status?: SafeDealStatus;
  activity?: DealActivityEvent[];
  participantUserIds?: string[];
  invitationStatus?: Extract<InvitationStatus, 'pending' | 'changes_requested' | 'accepted' | 'declined'>;
  invitationResponseReason?: string;
  invitationRespondedAt?: string;
  invitationLivenessVerifiedAt?: string;
  activePaymentStage?: 1 | 2;
  remainingPaymentMinor?: number;
  firstPaymentReleasedAt?: string;
}

export function grantMockDealAccess(dealId: string, userId: string): void {
  const current = getMockDealRuntime(dealId);
  patchMockDealRuntime(dealId, {
    participantUserIds: Array.from(new Set([...(current?.participantUserIds ?? []), userId])),
  });
}

interface MockProtectedDealState {
  version: 4;
  createdDeals: MockCreatedDeal[];
  deals: Record<string, MockDealRuntime>;
}

const EMPTY_STATE: MockProtectedDealState = { version: 4, createdDeals: [], deals: {} };

type StoredMockProtectedDealState = Omit<Partial<MockProtectedDealState>, 'version'> & { version?: number };

function migrateBuyerReviewState(parsed: StoredMockProtectedDealState): MockProtectedDealState {
  const deals = { ...(parsed.deals ?? {}) };
  for (const [dealId, runtime] of Object.entries(deals)) {
    const delivery = runtime.delivery;
    if (!delivery || (delivery.handover.status === 'not_started' && delivery.fundingReview.status === 'not_started')) continue;
    const now = new Date();
    deals[dealId] = {
      ...runtime,
      status: 'buyer_review',
      delivery: {
        ...delivery,
        card: delivery.card ? {
          ...delivery.card,
          status: 'active',
          usedAt: undefined,
          invalidatedAt: undefined,
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1_000).toISOString(),
        } : undefined,
        handover: { status: 'not_started' },
        fundingReview: {
          status: 'not_started',
          extendedProductTestingDays: delivery.fundingReview.extendedProductTestingDays,
        },
      },
    };
  }
  return { version: 4, createdDeals: parsed.createdDeals ?? [], deals };
}

function migrateChinaCarDealToBuyerVerification(parsed: StoredMockProtectedDealState): MockProtectedDealState {
  const createdDeals = parsed.createdDeals ?? [];
  const deals = { ...(parsed.deals ?? {}) };
  const chinaCarDeal = createdDeals.find((deal) => deal.summary.reference === 'NT-2026-072249');

  if (chinaCarDeal) {
    const current = deals[chinaCarDeal.summary.id] ?? {};
    deals[chinaCarDeal.summary.id] = {
      ...current,
      status: 'buyer_review',
      invitationStatus: 'accepted',
      delivery: undefined,
      activity: (current.activity ?? []).filter(
        (item) => !['completed', 'released', 'delivery', 'review'].includes(item.kind),
      ),
    };
  }

  return { version: 4, createdDeals, deals };
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readState(): MockProtectedDealState {
  if (!canUseStorage()) return structuredClone(EMPTY_STATE);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(EMPTY_STATE);
    const parsed = JSON.parse(raw) as StoredMockProtectedDealState;
    if (!Array.isArray(parsed.createdDeals) || !parsed.deals) {
      return structuredClone(EMPTY_STATE);
    }
    if (parsed.version === 2) {
      const migrated = migrateBuyerReviewState(parsed);
      writeState(migrated);
      return migrated;
    }
    if (parsed.version === 3) {
      const migrated = migrateChinaCarDealToBuyerVerification(parsed);
      writeState(migrated);
      return migrated;
    }
    if (parsed.version !== 4) return structuredClone(EMPTY_STATE);
    return {
      version: 4,
      createdDeals: parsed.createdDeals,
      deals: parsed.deals,
    };
  } catch {
    return structuredClone(EMPTY_STATE);
  }
}

function writeState(state: MockProtectedDealState): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function listMockCreatedDeals(): MockCreatedDeal[] {
  return readState().createdDeals;
}

export function findMockCreatedDeal(id: string): MockCreatedDeal | undefined {
  return readState().createdDeals.find(
    (deal) => deal.summary.id === id || deal.summary.reference === id,
  );
}

export function saveMockCreatedDeal(deal: MockCreatedDeal): void {
  const state = readState();
  state.createdDeals = [
    deal,
    ...state.createdDeals.filter((item) => item.summary.id !== deal.summary.id),
  ];
  writeState(state);
}

export function updateMockCreatedDeal(dealId: string, update: (deal: MockCreatedDeal) => MockCreatedDeal): MockCreatedDeal | undefined {
  const state = readState();
  const index = state.createdDeals.findIndex((deal) => deal.summary.id === dealId);
  if (index < 0) return undefined;
  const updated = update(state.createdDeals[index]);
  state.createdDeals[index] = updated;
  writeState(state);
  return updated;
}

export function getMockDealRuntime(dealId: string): MockDealRuntime | undefined {
  return readState().deals[dealId];
}

export function patchMockDealRuntime(
  dealId: string,
  patch: Partial<MockDealRuntime>,
): MockDealRuntime {
  const state = readState();
  const current = state.deals[dealId] ?? {};
  const next = { ...current, ...patch };
  state.deals[dealId] = next;
  writeState(state);
  return next;
}

export function findMockDealByDeliveryToken(
  token: string,
): { dealId: string; runtime: MockDealRuntime } | null {
  const deals = Object.entries(readState().deals);
  const match = deals.find(([, runtime]) => runtime.delivery?.card?.token === token);
  return match ? { dealId: match[0], runtime: match[1] } : null;
}
