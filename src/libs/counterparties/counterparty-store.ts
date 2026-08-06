import fixtureResponse from '../../mocks/apis/counterparties.json';
import transactionFixtures from '../../mocks/apis/counterparty-transactions.json';
import type { CounterpartyProfile } from '../store/types';
import type { CreateCounterpartyInput, CounterpartyTransaction } from './types';

const STORAGE_KEY = 'naitrust:counterparties:v1';

function fixtureCounterparties(): CounterpartyProfile[] {
  return (fixtureResponse.data as CounterpartyProfile[]).map((counterparty) => ({ ...counterparty }));
}

function writeCounterparties(counterparties: CounterpartyProfile[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(counterparties));
}

export function listMockCounterparties(): CounterpartyProfile[] {
  if (typeof window === 'undefined') return fixtureCounterparties();
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seeded = fixtureCounterparties();
    writeCounterparties(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(stored) as CounterpartyProfile[];
    return Array.isArray(parsed) ? parsed : fixtureCounterparties();
  } catch {
    const seeded = fixtureCounterparties();
    writeCounterparties(seeded);
    return seeded;
  }
}

export function getMockCounterparty(id: string): CounterpartyProfile | undefined {
  return listMockCounterparties().find((counterparty) => counterparty.id === id);
}

export function createMockCounterparty(input: CreateCounterpartyInput): CounterpartyProfile {
  const initials = input.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const counterparty: CounterpartyProfile = {
    id: `cp_mock_${crypto.randomUUID()}`,
    ...input,
    avatarInitials: initials || 'NS',
    identityVerified: false,
    businessVerified: false,
    memberSince: new Date().toISOString(),
    completedDealsCount: 0,
    hasPriorTransactionWithYou: false,
    resolvedDisputesCount: 0,
    isFavourite: false,
    isBlocked: false,
  };
  writeCounterparties([counterparty, ...listMockCounterparties()]);
  return counterparty;
}

export function removeMockCounterparty(id: string): void {
  writeCounterparties(listMockCounterparties().filter((counterparty) => counterparty.id !== id));
}

function updateMockCounterparty(
  id: string,
  update: (counterparty: CounterpartyProfile) => CounterpartyProfile,
): CounterpartyProfile | undefined {
  let changed: CounterpartyProfile | undefined;
  const next = listMockCounterparties().map((counterparty) => {
    if (counterparty.id !== id) return counterparty;
    changed = update(counterparty);
    return changed;
  });
  if (changed) writeCounterparties(next);
  return changed;
}

export function toggleMockCounterpartyFavourite(id: string): CounterpartyProfile | undefined {
  return updateMockCounterparty(id, (counterparty) => ({
    ...counterparty,
    isFavourite: !counterparty.isFavourite,
  }));
}

export function toggleMockCounterpartyBlocked(id: string): CounterpartyProfile | undefined {
  return updateMockCounterparty(id, (counterparty) => ({
    ...counterparty,
    isBlocked: !counterparty.isBlocked,
  }));
}

export function listMockCounterpartyTransactions(counterpartyId: string): CounterpartyTransaction[] {
  return (transactionFixtures as CounterpartyTransaction[])
    .filter((transaction) => transaction.counterpartyId === counterpartyId)
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt));
}
