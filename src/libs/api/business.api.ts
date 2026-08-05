import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { ApiSuccess } from './types';
import type { BusinessProfile } from '../store/types';
import mockBusinesses from '../../mocks/apis/businesses.json';
import { getUserData } from './config';
import { generateNaitrustId } from '../identity/naitrust-id';

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

function slugifyBusinessName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function canonicalBusinessSlug(value: string) {
  return slugifyBusinessName(value)
    .split('-')
    .filter((part) => part && !['and', 'ltd', 'limited', 'plc', 'inc', 'incorporated'].includes(part))
    .join('-');
}
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
  create: async (data: CreateBusinessData): Promise<ApiSuccess<BusinessProfile>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const user = getUserData() as { id?: string; name?: string } | null;
      const business: BusinessProfile = {
        id: `biz_mock_${crypto.randomUUID()}`,
        ownerUserId: user?.id ?? 'usr_mock_unknown',
        name: data.name,
        slug: slugifyBusinessName(data.name),
        ntId: generateNaitrustId('business', mockList.map((item) => item.ntId)),
        rcNumber: '',
        category: data.category,
        description: data.description,
        ownerName: user?.name,
        email: data.email,
        phone: data.phoneNumber,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country ?? 'Nigeria',
        socialHandles: data.socialHandles ?? [],
        verified: false,
        createdAt: new Date().toISOString(),
      };
      mockList.push(business);
      return { success: true, data: business };
    }
    const response = await httpClient.post<BusinessProfile>(endpoints.businesses.create, data);
    return response as ApiSuccess<BusinessProfile>;
  },
  getMyBusinesses: () => httpClient.get(endpoints.businesses.myBusinesses),

  search: async (query: string): Promise<ApiSuccess<BusinessProfile[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const term = query.trim().toLowerCase();
      const verified = mockList.filter((business) => business.verified);
      const data = !term
        ? verified
        : verified.filter((business) =>
            [business.name, business.ntId, business.phone, business.category, business.city]
              .filter(Boolean)
              .some((value) => value!.toLowerCase().includes(term)),
          );
      return { success: true, data };
    }
    const response = await httpClient.get<BusinessProfile[]>(
      `${endpoints.businesses.search}?q=${encodeURIComponent(query)}`,
    );
    return response as ApiSuccess<BusinessProfile[]>;
  },

  getPublicProfile: async (slugOrId: string): Promise<ApiSuccess<BusinessProfile | null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const normalized = slugOrId.toLowerCase();
      const canonical = canonicalBusinessSlug(slugOrId);
      const found = mockList.find(
        (business) =>
          business.verified &&
          (business.id.toLowerCase() === normalized ||
            business.slug?.toLowerCase() === normalized ||
            slugifyBusinessName(business.name) === normalized ||
            canonicalBusinessSlug(business.slug ?? '') === canonical ||
            canonicalBusinessSlug(business.name) === canonical ||
            business.ntId?.toLowerCase() === normalized),
      );
      return { success: true, data: found ?? null };
    }
    const response = await httpClient.get<BusinessProfile>(
      endpoints.businesses.publicProfile(slugOrId),
    );
    return response as ApiSuccess<BusinessProfile | null>;
  },

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
