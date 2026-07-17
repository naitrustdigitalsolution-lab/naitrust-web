/** Browser-only deal draft repository until server-side drafts are available. */

import { appConfig } from '../../configs/env';
import mockDealDrafts from '../../mocks/apis/deal-drafts.json';

const PREFIX = 'naitrust:create-deal-drafts:';
const MOCK_SEEDED_PREFIX = 'naitrust:mock-deal-drafts-seeded:v2:';
export const DEAL_DRAFT_ABANDONED_MS = 7 * 24 * 60 * 60 * 1000;
export const DEAL_DRAFT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export type DealDraftStatus = 'draft' | 'abandoned';

export interface StoredDealDraft<T = unknown> {
  id: string;
  form: T;
  step: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealDraftListItem extends StoredDealDraft {
  status: DealDraftStatus;
  title: string;
  counterparty: string;
  amount: string;
}

function key(userId: string): string {
  return `${PREFIX}${userId}`;
}

function seedMockDrafts(userId: string): void {
  if (!appConfig.isMock || localStorage.getItem(`${MOCK_SEEDED_PREFIX}${userId}`)) return;
  try {
    const existing = JSON.parse(localStorage.getItem(key(userId)) ?? '[]') as StoredDealDraft[];
    const existingIds = new Set(Array.isArray(existing) ? existing.map((draft) => draft.id) : []);
    const fixtures = (mockDealDrafts as Array<StoredDealDraft & { ownerUserId?: string }>).filter(
      (draft) => (!draft.ownerUserId || draft.ownerUserId === userId) && !existingIds.has(draft.id),
    );
    localStorage.setItem(key(userId), JSON.stringify([...fixtures, ...(Array.isArray(existing) ? existing : [])]));
  } catch {
    localStorage.setItem(key(userId), JSON.stringify(mockDealDrafts));
  }
  localStorage.setItem(`${MOCK_SEEDED_PREFIX}${userId}`, 'true');
}

function read<T>(userId?: string): StoredDealDraft<T>[] {
  if (!userId || typeof window === 'undefined') return [];
  try {
    seedMockDrafts(userId);
    const parsed = JSON.parse(localStorage.getItem(key(userId)) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    const retained = (parsed as StoredDealDraft<T>[]).filter((draft) => {
      const updated = Date.parse(draft.updatedAt);
      return draft.id && draft.form && Number.isFinite(updated) && now - updated < DEAL_DRAFT_RETENTION_MS;
    });
    if (retained.length !== parsed.length) localStorage.setItem(key(userId), JSON.stringify(retained));
    return retained;
  } catch {
    localStorage.removeItem(key(userId));
    return [];
  }
}

export function listDealDrafts(userId?: string): DealDraftListItem[] {
  const now = Date.now();
  return read<Record<string, unknown>>(userId)
    .map((draft) => {
      const participants = Array.isArray(draft.form.participants) ? draft.form.participants : [];
      const first = participants[0] as Record<string, unknown> | undefined;
      return {
        ...draft,
        status: now - Date.parse(draft.updatedAt) >= DEAL_DRAFT_ABANDONED_MS ? 'abandoned' as const : 'draft' as const,
        title: String(draft.form.title || 'Untitled deal'),
        counterparty: String(first?.name || first?.email || 'No counterparty yet'),
        amount: String(draft.form.amount || ''),
      };
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function loadDealDraft<T>(userId: string | undefined, draftId: string | null): StoredDealDraft<T> | null {
  if (!draftId) return null;
  return read<T>(userId).find((draft) => draft.id === draftId) ?? null;
}

export function saveDealDraft<T>(
  userId: string | undefined,
  draftId: string,
  form: T,
  step: number,
): void {
  if (!userId || typeof window === 'undefined') return;
  const drafts = read<T>(userId);
  const existing = drafts.find((draft) => draft.id === draftId);
  const now = new Date().toISOString();
  const next: StoredDealDraft<T> = {
    id: draftId,
    form,
    step,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  localStorage.setItem(
    key(userId),
    JSON.stringify([next, ...drafts.filter((draft) => draft.id !== draftId)]),
  );
}

export function clearDealDraft(userId: string | undefined, draftId: string): void {
  if (!userId || typeof window === 'undefined') return;
  localStorage.setItem(key(userId), JSON.stringify(read(userId).filter((draft) => draft.id !== draftId)));
}
