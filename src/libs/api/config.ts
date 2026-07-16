/**
 * API Configuration
 * Central configuration for all API calls
 */

// API base URL: VITE_API_BASE_URL should be the domain only (e.g. http://localhost:5000)
// The /api prefix is appended here in code
const baseUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL 
  : 'http://localhost:5000';

export const API_CONFIG = {
  ORIGIN_URL: baseUrl,
  BASE_URL: `${baseUrl}/api`,
  TIMEOUT: 30000,
};

console.log('🔧 API Configuration:', {
  baseUrl: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Sensitive auth state lives in Secure/SameSite cookies, never localStorage.
// See libs/utils/secure-storage.ts for the production httpOnly note.
import { getCookie, removeCookie, setCookie } from '../utils/secure-storage';

const TOKEN_KEY = 'naitrust_token';
const USER_KEY = 'naitrust_user';

/** Get auth token from the secure cookie. */
export function getAuthToken(): string | null {
  return getCookie(TOKEN_KEY);
}

/** Store the auth token in a secure cookie. */
export function setAuthToken(token: string): void {
  setCookie(TOKEN_KEY, token);
}

/** Remove the auth token cookie. */
export function removeAuthToken(): void {
  removeCookie(TOKEN_KEY);
}

/** Get the cached user identity from the secure cookie. */
export function getUserData(): any | null {
  const userData = getCookie(USER_KEY);
  try {
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

/** Store the user identity in a secure cookie. */
export function setUserData(user: any): void {
  setCookie(USER_KEY, JSON.stringify(user));
}

/** Remove the user identity cookie. */
export function removeUserData(): void {
  removeCookie(USER_KEY);
}
