/**
 * Secure client storage
 * Sensitive data (auth token, user identity, security flags) must NOT live in
 * localStorage — it is readable by any script and survives indefinitely.
 * Cookies with Secure + SameSite=Strict are the right client store for this.
 *
 * PRODUCTION NOTE: the auth token should be an httpOnly, Secure cookie SET BY
 * THE BACKEND so JavaScript can never read it at all. In this mock (no backend
 * setting headers) we set a JS-visible Secure/SameSite=Strict cookie, which is
 * the closest the frontend alone can do. The API layer and store read/write
 * through this module so switching to httpOnly is a one-file change.
 *
 * Use localStorage only for non-sensitive, convenience state (theme, dismissed
 * hints, cached public content).
 */

const DEFAULT_MAX_AGE_DAYS = 7;

function isHttps(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

export function setCookie(name: string, value: string, maxAgeDays = DEFAULT_MAX_AGE_DAYS): void {
  if (typeof document === 'undefined') return;
  const maxAge = Math.floor(maxAgeDays * 24 * 60 * 60);
  const secure = isHttps() ? '; Secure' : '';
  // SameSite=Strict blocks the cookie on cross-site requests (CSRF hardening).
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
}

/**
 * A zustand `persist` storage backed by cookies, for stores that hold
 * sensitive data. Keeps the same StateStorage shape zustand expects.
 */
export const cookieStorage = {
  getItem: (name: string): string | null => getCookie(name),
  setItem: (name: string, value: string): void => setCookie(name, value),
  removeItem: (name: string): void => removeCookie(name),
};
