import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ApiSuccess } from './transactions.api';
import type { BusinessProfile } from '../store/types';
import mockBusinesses from '../../mocks/apis/businesses.json';

const MOCK_LATENCY_MS = 300;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface CreateBusinessData {
  name: string;
  description?: string;
  category: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  socialHandles?: Array<{ platform: string; value: string }>;
}

const mockList = (mockBusinesses as ApiSuccess<BusinessProfile[]>).data;
/** Session-scoped edits to a business, keyed by owner user ID (mock only). */
const overrides: Record<string, Partial<BusinessProfile>> = {};

export type BusinessUpdate = Partial<
  Pick<
    BusinessProfile,
    | 'name'
    | 'category'
    | 'rcNumber'
    | 'description'
    | 'email'
    | 'phone'
    | 'website'
    | 'address'
    | 'city'
    | 'state'
    | 'socialHandles'
  >
>;

function resolveBusiness(userId: string): BusinessProfile | null {
  const base = mockList.find((b) => b.ownerUserId === userId);
  if (!base) return null;
  return { ...base, ...overrides[userId] };
}

export const businessApi = {
  create: (data: CreateBusinessData) => httpClient.post(endpoints.businesses.create, data),
  getMyBusinesses: () => httpClient.get(endpoints.businesses.myBusinesses),
  getSavedBusinesses: () => httpClient.get(endpoints.businesses.savedBusinesses),

  /**
   * The business tied to the current account. Mock resolves by owner user ID.
   * Real endpoint: GET /businesses/my/businesses (first record).
   */
  getMine: async (userId: string): Promise<ApiSuccess<BusinessProfile | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return { success: true, data: resolveBusiness(userId) };
    }
    const response = await httpClient.get<BusinessProfile[]>(endpoints.businesses.myBusinesses);
    const list = (response as ApiSuccess<BusinessProfile[]>).data ?? [];
    return { success: true, data: list[0] ?? null };
  },

  /**
   * Update editable business details. Changing them means the business must be
   * re-verified (compliance requirement) — the caller handles the KYC reset.
   * Real endpoint: PATCH /businesses/:id.
   */
  update: async (userId: string, patch: BusinessUpdate): Promise<ApiSuccess<BusinessProfile | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      // The verification-critical fields (name, CAC/RC number) are locked once
      // verified, so editing contact/profile details doesn't change verification.
      overrides[userId] = { ...overrides[userId], ...patch };
      return { success: true, data: resolveBusiness(userId) };
    }
    const current = resolveBusiness(userId);
    const response = await httpClient.put(
      endpoints.businesses.update(current?.id ?? ''),
      patch,
    );
    return response as ApiSuccess<BusinessProfile | null>;
  },
};
