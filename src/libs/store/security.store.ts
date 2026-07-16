/**
 * Security Store
 * The user's own security & verification state: email/phone verification, 2FA
 * (authenticator), KYC (individual or business), a 4-digit transaction PIN, and
 * liveness freshness. This gates sensitive actions across the app.
 *
 * SECURITY NOTES (mock vs production):
 * - Persisted to Secure cookies (not localStorage) because it is account-
 *   sensitive. In production the backend is the source of truth and returns
 *   these flags; the client never stores the PIN or 2FA secret.
 * - The mock keeps a PIN value here ONLY so the demo can verify it offline.
 *   Production sends the entered PIN to the backend for verification and never
 *   persists it client-side.
 * - The liveness photo is held in memory only (never persisted) — it is
 *   personal data and would exceed cookie limits.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { cookieStorage } from '../utils/secure-storage';
import { LIVENESS_FRESHNESS_DAYS } from './types';

export type KycStatus = 'none' | 'pending' | 'verified';

export interface UserSecurity {
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  kycStatus: KycStatus;
  pinSet: boolean;
  /** MOCK ONLY — see file header. Never persist a real PIN client-side. */
  pin?: string;
  livenessAt?: string; // ISO of last passed liveness check
}

export const DEFAULT_SECURITY: UserSecurity = {
  emailVerified: false,
  phoneVerified: false,
  twoFactorEnabled: false,
  kycStatus: 'none',
  pinSet: false,
};

interface SecurityStoreState {
  byUser: Record<string, UserSecurity>;
  /** In-memory only (not persisted): last liveness photo per user. */
  livenessPhotoByUser: Record<string, string>;
  seed: (userKey: string, seed: Partial<UserSecurity>) => void;
  patch: (userKey: string, patch: Partial<UserSecurity>) => void;
  setLivenessPhoto: (userKey: string, dataUrl: string) => void;
}

export const useSecurityStore = create<SecurityStoreState>()(
  persist(
    (set) => ({
      byUser: {},
      livenessPhotoByUser: {},
      seed: (userKey, seed) =>
        set((state) => {
          if (state.byUser[userKey]) return state; // already initialised
          return { byUser: { ...state.byUser, [userKey]: { ...DEFAULT_SECURITY, ...seed } } };
        }),
      patch: (userKey, patch) =>
        set((state) => ({
          byUser: {
            ...state.byUser,
            [userKey]: { ...DEFAULT_SECURITY, ...state.byUser[userKey], ...patch },
          },
        })),
      setLivenessPhoto: (userKey, dataUrl) =>
        set((state) => ({
          livenessPhotoByUser: { ...state.livenessPhotoByUser, [userKey]: dataUrl },
        })),
    }),
    {
      name: 'naitrust-security',
      storage: createJSONStorage(() => cookieStorage),
      // Never persist the liveness photo (personal data, too large for a cookie).
      partialize: (state) => ({ byUser: state.byUser }),
    },
  ),
);

export function isLivenessFresh(iso: string | undefined): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return (Date.now() - t) / 86_400_000 <= LIVENESS_FRESHNESS_DAYS;
}
