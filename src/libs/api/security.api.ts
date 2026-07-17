/**
 * Security API
 * Mock backend for verification & security actions. In production these hit the
 * real endpoints (OTP delivery, KYC provider/QoreID, TOTP enrolment, PIN set/
 * verify server-side). The mock mirrors the request/response shape and latency
 * so the UI is production-ready — only the transport is stubbed.
 */

import { appConfig } from '../../configs/env';
import { httpClient } from './client';
import { endpoints } from './endpoints';
import type { ApiSuccess } from './transactions.api';

const MOCK_MS = 600;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Fixed OTP used across mock email/phone verification (documented for tests). */
export const MOCK_OTP = appConfig.mockOtp;

/** Base32 secret shown during mock authenticator enrolment. */
function mockTotpSecret(): string {
  if (!appConfig.mockTotpSecret) {
    throw new Error('VITE_MOCK_TOTP_SECRET is required while VITE_APP_MODE=mock');
  }
  return appConfig.mockTotpSecret;
}

export interface TwoFactorEnrolment {
  secret: string;
  otpauthUri: string;
}

export const securityApi = {
  /** Request an email verification OTP. */
  sendEmailOtp: async (email: string): Promise<ApiSuccess<null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      return { success: true, data: null, message: `OTP sent to ${email}` };
    }
    return (await httpClient.post(endpoints.security.sendEmailOtp, { email })) as ApiSuccess<null>;
  },

  /** Verify email with the OTP. */
  verifyEmail: async (code: string): Promise<ApiSuccess<{ verified: boolean }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      return { success: true, data: { verified: code === MOCK_OTP } };
    }
    return (await httpClient.post(endpoints.security.verifyEmail, { code })) as ApiSuccess<{ verified: boolean }>;
  },

  sendPhoneOtp: async (phone: string): Promise<ApiSuccess<null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      return { success: true, data: null, message: `OTP sent to ${phone}` };
    }
    return (await httpClient.post(endpoints.security.sendPhoneOtp, { phone })) as ApiSuccess<null>;
  },

  verifyPhone: async (code: string): Promise<ApiSuccess<{ verified: boolean }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      return { success: true, data: { verified: code === MOCK_OTP } };
    }
    return (await httpClient.post(endpoints.security.verifyPhone, { code })) as ApiSuccess<{ verified: boolean }>;
  },

  /** Begin authenticator-app (TOTP) enrolment — returns secret + otpauth URI. */
  start2FA: async (email: string): Promise<ApiSuccess<TwoFactorEnrolment>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      const secret = mockTotpSecret();
      const otpauthUri = `otpauth://totp/Naitrust:${encodeURIComponent(email)}?secret=${secret}&issuer=Naitrust`;
      return { success: true, data: { secret, otpauthUri } };
    }
    return (await httpClient.post(endpoints.security.start2FA, { email })) as ApiSuccess<TwoFactorEnrolment>;
  },

  /** Confirm authenticator enrolment with a generated 6-digit code. */
  verify2FA: async (code: string): Promise<ApiSuccess<{ enabled: boolean }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      // Mock accepts any 6-digit code; production validates the TOTP window.
      return { success: true, data: { enabled: /^\d{6}$/.test(code) } };
    }
    return (await httpClient.post(endpoints.security.verify2FA, { code })) as ApiSuccess<{ enabled: boolean }>;
  },

  /** Submit KYC (individual or business). Mock auto-approves after latency. */
  submitKyc: async (
    kind: 'individual' | 'business',
    payload: Record<string, string>,
  ): Promise<ApiSuccess<{ status: 'verified' }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS + 400);
      return { success: true, data: { status: 'verified' } };
    }
    return (await httpClient.post(endpoints.security.submitKyc, { kind, ...payload })) as ApiSuccess<{ status: 'verified' }>;
  },

  /** Set the 4-digit transaction PIN. */
  setPin: async (pin: string): Promise<ApiSuccess<{ set: boolean }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_MS);
      return { success: true, data: { set: /^\d{4}$/.test(pin) } };
    }
    return (await httpClient.post(endpoints.security.setPin, { pin })) as ApiSuccess<{ set: boolean }>;
  },

  /** Verify the PIN before a sensitive action. */
  verifyPin: async (pin: string): Promise<ApiSuccess<{ valid: boolean }>> => {
    if (appConfig.isMock) {
      await delay(300);
      return { success: true, data: { valid: /^\d{4}$/.test(pin) } };
    }
    return (await httpClient.post(endpoints.security.verifyPin, { pin })) as ApiSuccess<{ valid: boolean }>;
  },
};
