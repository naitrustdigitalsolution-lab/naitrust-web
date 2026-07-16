/**
 * Mock Auth Engine
 * In-memory simulation of the backend auth endpoints, consumed ONLY by the
 * `appConfig.isMock` branch of `auth.api.ts`.
 *
 * Design notes:
 * - Responses use the same `ApiResponse`-shaped envelope the real backend
 *   returns, so the auth store and screens run identical code paths.
 * - The user list is module-level and mutable: `register()` adds users for
 *   the current browser session only (resets on reload — the logged-in
 *   session itself still survives reload via the persisted auth store).
 * - Profile lookup is derived from the token (like a real backend), not from
 *   localStorage, keeping this module pure and unit-testable.
 * - Latency is injectable so unit tests can pass 0.
 *
 * Test personas and credentials are documented in `naitrust-web/MOCK_TESTING.md`.
 */

import fixtures from '../../mocks/apis/auth-users.json';
import type { RegisterData } from './auth.api';
import type { User } from '../store/types';

export const MOCK_2FA_CODE: string = fixtures.twoFactorCode;

const DEFAULT_LATENCY_MS = 400;
const TOKEN_PREFIX = 'mock-token';

interface MockUserRecord {
  password: string;
  twoFactorEnabled: boolean;
  user: User;
}

export interface MockAuthResponse {
  success: boolean;
  data?: {
    user: User;
    token?: string;
    requires2FA?: boolean;
  };
  message?: string;
  error?: string;
}

/** Session-scoped user list, seeded from the JSON fixture. */
const records: MockUserRecord[] = (fixtures.users as MockUserRecord[]).map((record) => ({
  ...record,
  user: { ...record.user },
}));

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findByEmail(email: string): MockUserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return records.find((record) => record.user.email.toLowerCase() === normalized);
}

function findByIdOrEmail(userIdOrEmail: string): MockUserRecord | undefined {
  return (
    records.find((record) => record.user.id === userIdOrEmail) ?? findByEmail(userIdOrEmail)
  );
}

/** Token format: `mock-token.<userId>.<random>` — lets getProfile resolve the user. */
function issueToken(userId: string): string {
  return `${TOKEN_PREFIX}.${userId}.${crypto.randomUUID()}`;
}

export function userIdFromToken(token: string | null): string | null {
  if (!token || !token.startsWith(`${TOKEN_PREFIX}.`)) return null;
  return token.split('.')[1] ?? null;
}

export async function mockLogin(
  email: string,
  password: string,
  latencyMs: number = DEFAULT_LATENCY_MS,
): Promise<MockAuthResponse> {
  await delay(latencyMs);

  const record = findByEmail(email);
  if (!record || record.password !== password) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (record.twoFactorEnabled) {
    // Matches the real flow: no token yet, complete login via verify2FALogin.
    return { success: true, data: { user: { ...record.user }, requires2FA: true } };
  }

  return {
    success: true,
    data: { user: { ...record.user }, token: issueToken(record.user.id) },
  };
}

export async function mockVerify2FALogin(
  userIdOrEmail: string,
  code: string,
  latencyMs: number = DEFAULT_LATENCY_MS,
): Promise<MockAuthResponse> {
  await delay(latencyMs);

  const record = findByIdOrEmail(userIdOrEmail);
  if (!record) {
    return { success: false, error: 'User not found' };
  }
  if (code !== MOCK_2FA_CODE) {
    return { success: false, error: 'Invalid code. Please try again.' };
  }

  return {
    success: true,
    data: { user: { ...record.user }, token: issueToken(record.user.id) },
  };
}

export async function mockRegister(
  data: RegisterData,
  latencyMs: number = DEFAULT_LATENCY_MS,
): Promise<MockAuthResponse> {
  await delay(latencyMs);

  if (findByEmail(data.email)) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const user: User = {
    id: `usr_mock_${crypto.randomUUID()}`,
    email: data.email.trim().toLowerCase(),
    firstName: data.firstName,
    lastName: data.lastName,
    name: `${data.firstName} ${data.lastName}`.trim(),
    role: data.role,
    phone: data.phoneNumber,
    kycLevel: 0,
    kycVerified: false,
    isEmailVerified: false,
    isPhoneVerified: false,
  };

  records.push({ password: data.password, twoFactorEnabled: false, user });

  return { success: true, data: { user: { ...user }, token: issueToken(user.id) } };
}

export async function mockGetProfile(
  token: string | null,
  latencyMs: number = DEFAULT_LATENCY_MS,
): Promise<MockAuthResponse> {
  await delay(latencyMs);

  const userId = userIdFromToken(token);
  const record = userId ? records.find((r) => r.user.id === userId) : undefined;
  if (!record) {
    return { success: false, error: 'Unauthorized - Please login again' };
  }

  return { success: true, data: { user: { ...record.user } } };
}

/** Test-only helper: number of registered mock users (seeded + session-registered). */
export function mockUserCount(): number {
  return records.length;
}
