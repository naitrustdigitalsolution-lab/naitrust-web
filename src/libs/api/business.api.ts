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
/** Session-scoped edits to a business, keyed by owner email (mock only). */
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

function resolveBusiness(email: string): BusinessProfile | null {
  const base = mockList.find((b) => b.ownerEmail.toLowerCase() === email.toLowerCase());
  if (!base) return null;
  return { ...base, ...overrides[email.toLowerCase()] };
}

export const businessApi = {
  create: (data: CreateBusinessData) => httpClient.post(endpoints.businesses.create, data),
  getMyBusinesses: () => httpClient.get(endpoints.businesses.myBusinesses),
  getSavedBusinesses: () => httpClient.get(endpoints.businesses.savedBusinesses),

  /**
   * The business tied to the current account. Mock resolves by owner email.
   * Real endpoint: GET /businesses/my/businesses (first record).
   */
  getMine: async (email: string): Promise<ApiSuccess<BusinessProfile | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return { success: true, data: resolveBusiness(email) };
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
  update: async (email: string, patch: BusinessUpdate): Promise<ApiSuccess<BusinessProfile | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      // The verification-critical fields (name, CAC/RC number) are locked once
      // verified, so editing contact/profile details doesn't change verification.
      overrides[email.toLowerCase()] = { ...overrides[email.toLowerCase()], ...patch };
      return { success: true, data: resolveBusiness(email) };
    }
    const current = resolveBusiness(email);
    const response = await httpClient.put(
      endpoints.businesses.update(current?.id ?? ''),
      patch,
    );
    return response as ApiSuccess<BusinessProfile | null>;
  },
};
