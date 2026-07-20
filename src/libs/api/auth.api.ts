/**
 * Authentication API
 * Handles all authentication-related API calls
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { getAuthToken, setAuthToken, setUserData, removeAuthToken, removeUserData } from './config';
import { appConfig } from '../../configs/env';
import { mockLogin, mockVerify2FALogin, mockRegister, mockGetProfile } from './mock-auth';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'business' | 'admin';
  phoneNumber?: string;
  businessName?: string;
  pendingBusinessData?: {
    name: string;
    description?: string;
    category?: string;
    email?: string;
    phoneNumber?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    socialHandles?: { platform: string; value: string }[];
    verificationType?: string;
    registrationNumber?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const authApi = {
  /**
   * Register a new user (idempotent — safe to retry on network failure)
   */
  register: async (data: RegisterData) => {
    if (appConfig.isMock) {
      const response = await mockRegister(data);
      if (response.data?.token) {
        setAuthToken(response.data.token);
        setUserData(response.data.user);
      }
      return response;
    }
    const idempotencyKey = `register:${data.email}:${crypto.randomUUID()}`;
    const response = await httpClient.post(endpoints.auth.register, data, {
      'Idempotency-Key': idempotencyKey,
    });
    if (response.data?.token) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }
    return response;
  },
  
  /**
   * Login user
   */
  login: async (data: LoginData) => {
    const response = appConfig.isMock
      ? await mockLogin(data.email, data.password)
      : await httpClient.post(endpoints.auth.login, data);
    // Only set token if login is complete (no 2FA required)
    if (response.data?.token && !response.data?.requires2FA) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }
    return response;
  },
  
  /**
   * Verify 2FA code during login
   */
  verify2FALogin: async (data: { userId?: string; email?: string; token: string }) => {
    const response = appConfig.isMock
      ? await mockVerify2FALogin(data.userId ?? data.email ?? '', data.token)
      : await httpClient.post(endpoints.auth.verify2FALogin, data);
    if (response.data?.token) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }
    return response;
  },
  
  /**
   * Logout user
   */
  logout: async () => {
    try {
      if (!appConfig.isMock) {
        await httpClient.post(endpoints.auth.logout);
      }
    } finally {
      removeAuthToken();
      removeUserData();
    }
  },
  
  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = appConfig.isMock
      ? await mockGetProfile(getAuthToken())
      : await httpClient.get(endpoints.auth.profile);
    if (response.data?.user) {
      setUserData(response.data.user);
    }
    return response;
  },
  
  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData) => {
    const response = await httpClient.put(endpoints.auth.updateProfile, data);
    if (response.data?.user) {
      setUserData(response.data.user);
    }
    return response;
  },
  
  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordData) => {
    return await httpClient.post(endpoints.auth.changePassword, data);
  },
  
  /**
   * Forgot password - send OTP
   */
  forgotPassword: async (email: string) => {
    return await httpClient.post(endpoints.auth.forgotPassword, { email });
  },

  /**
   * Verify OTP for password reset
   */
  verifyOtp: async (email: string, otp: string) => {
    return await httpClient.post(endpoints.auth.verifyOtp, { email, otp });
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    return await httpClient.post(endpoints.auth.resetPassword, { email, resetToken, newPassword });
  },

  /**
   * Verify email with OTP
   */
  verifyEmail: async (email: string, otp: string) => {
    const response = await httpClient.post(endpoints.auth.verifyEmail, { email, otp });
    if (response.data?.token) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }
    return response;
  },

  /**
   * Resend email verification OTP
   */
  resendVerificationOTP: async (email: string) => {
    return await httpClient.post(endpoints.auth.resendVerificationOTP, { email });
  },
  
};