/**
 * useSecurity
 * Single source of truth (client mirror) for the current user's verification &
 * security state, plus the derived gates the app enforces:
 * - canCreateDeal: email verified AND KYC verified AND a transaction PIN set
 *   (hard requirements before creating a deal).
 * - Soft nudges (phone, 2FA) don't block usage but surface as reminders.
 * State is seeded from the authenticated user's flags on first read.
 */

import { useEffect, useMemo } from 'react';
import { useAuth } from '../libs/auth-context';
import {
  DEFAULT_SECURITY,
  isLivenessFresh,
  useSecurityStore,
  type UserSecurity,
} from '../libs/store/security.store';

export interface SecurityView extends UserSecurity {
  userKey: string;
  livenessFresh: boolean;
  livenessPhoto?: string;
  /** Hard gate: everything required before a deal can be created. */
  canCreateDeal: boolean;
  /** What's still missing for deal creation, in order. */
  missingForDeal: Array<'email' | 'kyc' | 'pin'>;
  patch: (patch: Partial<UserSecurity>) => void;
  setLivenessPhoto: (dataUrl: string) => void;
}

export function useSecurity(): SecurityView {
  const { user } = useAuth();
  const userKey = user?.email ?? 'anon';

  const record = useSecurityStore((s) => s.byUser[userKey]);
  const photo = useSecurityStore((s) => s.livenessPhotoByUser[userKey]);
  const seed = useSecurityStore((s) => s.seed);
  const patchStore = useSecurityStore((s) => s.patch);
  const setPhotoStore = useSecurityStore((s) => s.setLivenessPhoto);

  // Seed once from the authenticated user's known flags.
  useEffect(() => {
    if (user && !record) {
      seed(userKey, {
        emailVerified: !!user.isEmailVerified,
        phoneVerified: !!user.isPhoneVerified,
        kycStatus: user.kycVerified ? 'verified' : 'none',
      });
    }
  }, [user, record, seed, userKey]);

  const sec = record ?? DEFAULT_SECURITY;

  return useMemo(() => {
    const missingForDeal: Array<'email' | 'kyc' | 'pin'> = [];
    if (!sec.emailVerified) missingForDeal.push('email');
    if (sec.kycStatus !== 'verified') missingForDeal.push('kyc');
    if (!sec.pinSet) missingForDeal.push('pin');

    return {
      ...sec,
      userKey,
      livenessFresh: isLivenessFresh(sec.livenessAt),
      livenessPhoto: photo,
      canCreateDeal: missingForDeal.length === 0,
      missingForDeal,
      patch: (patch: Partial<UserSecurity>) => patchStore(userKey, patch),
      setLivenessPhoto: (dataUrl: string) => setPhotoStore(userKey, dataUrl),
    };
  }, [sec, userKey, photo, patchStore, setPhotoStore]);
}
