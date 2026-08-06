import type {
  CreateSafeDealInput,
  CreateSafeDealResult,
  DealActivityEvent,
  DealDeliveryLifecycle,
  SafeDealStatus,
} from '../store/types';

const STORAGE_KEY = 'naitrust:protected-deal-runtime:v1';

export interface MockCreatedDeal {
  summary: CreateSafeDealResult;
  input: CreateSafeDealInput;
}

interface MockDealRuntime {
  delivery?: DealDeliveryLifecycle;
  status?: SafeDealStatus;
  activity?: DealActivityEvent[];
  participantUserIds?: string[];
}

export function grantMockDealAccess(dealId: string, userId: string): void {
  const current = getMockDealRuntime(dealId);
  patchMockDealRuntime(dealId, {
    participantUserIds: Array.from(new Set([...(current?.participantUserIds ?? []), userId])),
  });
}

interface MockProtectedDealState {
  version: 1;
  createdDeals: MockCreatedDeal[];
  deals: Record<string, MockDealRuntime>;
}

const EMPTY_STATE: MockProtectedDealState = { version: 1, createdDeals: [], deals: {} };

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readState(): MockProtectedDealState {
  if (!canUseStorage()) return structuredClone(EMPTY_STATE);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(EMPTY_STATE);
    const parsed = JSON.parse(raw) as Partial<MockProtectedDealState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.createdDeals) || !parsed.deals) {
      return structuredClone(EMPTY_STATE);
    }
    return {
      version: 1,
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
