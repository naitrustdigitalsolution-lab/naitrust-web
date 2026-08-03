import type { CreateTrustCheckoutInput, TrustCheckout } from '../store/types';
import type { ApiSuccess } from './types';
import fixture from '../../mocks/apis/trust-checkouts.json';

const STORAGE_KEY = 'naitrust_mock_trust_checkouts';
const EVENT_STORAGE_KEY = 'naitrust_mock_trust_checkout_events';
const seededCheckouts = (fixture as ApiSuccess<TrustCheckout[]>).data;

function readCheckouts(): TrustCheckout[] {
  if (typeof window === 'undefined') return seededCheckouts;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as TrustCheckout[] : seededCheckouts;
  } catch {
    return seededCheckouts;
  }
}

function writeCheckouts(checkouts: TrustCheckout[]) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(checkouts));
}

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const trustCheckoutsApi = {
  list: async (): Promise<ApiSuccess<TrustCheckout[]>> => ({ success: true, data: readCheckouts() }),

  create: async (input: CreateTrustCheckoutInput): Promise<ApiSuccess<TrustCheckout>> => {
    const now = new Date();
    const id = makeId();
    const checkout: TrustCheckout = {
      id,
      publicId: id.replace(/-/g, '').slice(0, 20),
      ...input,
      evidenceRequirements: input.evidenceRequirements ?? [],
      milestones: input.milestones ?? [],
      status: 'active',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + input.expiresInMinutes * 60_000).toISOString(),
    };
    writeCheckouts([checkout, ...readCheckouts()]);
    return { success: true, data: checkout, message: 'Trust Checkout created with mock data' };
  },

  getPublic: async (publicId: string): Promise<ApiSuccess<TrustCheckout | null>> => {
    const checkout = readCheckouts().find((item) => item.publicId === publicId) ?? null;
    if (checkout && checkout.status === 'active' && new Date(checkout.expiresAt).getTime() <= Date.now()) {
      checkout.status = 'expired';
    }
    return { success: true, data: checkout };
  },

  recordEvent: async (publicId: string, eventType: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    let events: Array<{ id: string; publicId: string; eventType: string; createdAt: string }> = [];
    try { events = JSON.parse(localStorage.getItem(EVENT_STORAGE_KEY) || '[]'); } catch { /* use empty mock event list */ }
    events.push({ id: makeId(), publicId, eventType, createdAt: new Date().toISOString() });
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events.slice(-250)));
  },

  confirmTransfer: async (publicId: string): Promise<ApiSuccess<TrustCheckout>> => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const checkouts = readCheckouts();
    const index = checkouts.findIndex((item) => item.publicId === publicId);
    if (index < 0) throw new Error('Trust Checkout not found');
    checkouts[index] = {
      ...checkouts[index],
      status: 'paid',
      paidAt: new Date().toISOString(),
      paymentReference: `NT-MOCK-${Date.now().toString().slice(-8)}`,
    };
    writeCheckouts(checkouts);
    return { success: true, data: checkouts[index], message: 'Mock transfer confirmed' };
  },
};
