/**
 * Verification Banner Logic
 * Pure derivation of the dashboard verification banner from the current user.
 * Uses only fields that already exist on `User` — richer verification tiers
 * arrive with the real `/verification/status` integration (future task).
 */

import type { User } from '../store/types';

export type VerificationBannerState =
  | { kind: 'verify-email'; title: string; message: string }
  | { kind: 'complete-kyc'; title: string; message: string }
  | { kind: 'none' };

export function getVerificationBannerState(user: User | null): VerificationBannerState {
  if (!user) return { kind: 'none' };

  if (!user.isEmailVerified) {
    return {
      kind: 'verify-email',
      title: 'Verify your email',
      message: 'Confirm your email address to unlock safe deals and protected funding.',
    };
  }

  if (!user.kycVerified) {
    return {
      kind: 'complete-kyc',
      title: 'Complete identity verification',
      message: 'Verify your identity to raise your transaction limits and build trust with counterparties.',
    };
  }

  return { kind: 'none' };
}
