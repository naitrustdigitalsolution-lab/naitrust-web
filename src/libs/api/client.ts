/**
 * HTTP Client
 * Core HTTP request handler with error handling and JWT authentication
 */

import { API_CONFIG, getAuthToken, removeAuthToken, removeUserData } from './config';

// Flag to prevent multiple redirects (module-level singleton)
let isRedirecting = false;
let redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface RequestExtras {
  /** Skip attaching the Authorization header — for genuinely public/anonymous endpoints. */
  skipAuth?: boolean;
}

/**
 * Build a thrown value that is both a real `Error` (so `error instanceof Error`
 * checks work and the backend's message reaches the UI) and still carries the
 * ApiError fields (`statusCode`, `errors`) for callers that need them.
 */
function apiError({ message, statusCode, errors }: ApiError): Error & ApiError {
  return Object.assign(new Error(message), { statusCode, errors });
}

/**
 * Decode HTML entities that were incorrectly stored by the old xssSanitizer.
 * Applied to all API responses so every screen displays clean text.
 */
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function cleanResponseData(data: unknown): unknown {
  if (typeof data === 'string') return decodeHtmlEntities(data);
  if (Array.isArray(data)) return data.map(cleanResponseData);
  if (data && typeof data === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      cleaned[key] = cleanResponseData(val);
    }
    return cleaned;
  }
  return data;
}

/** Attach the bearer token (if any) to a header bag. Shared by request() and upload(). */
function withAuthHeader(headers: Record<string, string>): Record<string, string> {
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Runs on any 401 response: clears the session (Secure auth cookies — never
 * localStorage) and sends the browser to /login. Returns `true` when the
 * browser is being navigated away, so the caller should resolve quietly
 * instead of throwing (the page is about to unload); `false` otherwise,
 * meaning the caller should throw the usual "Unauthorized" ApiError.
 *
 * There are currently no public-but-optionally-authenticated endpoints in
 * the API surface (see libs/api/endpoints.ts) — every endpoint that can
 * 401 today requires a logged-in user, so every 401 redirects. If a public
 * endpoint that tolerates a missing/expired token is added later, exempt it
 * here rather than redirecting.
 */
function handleUnauthorized(): boolean {
  console.error('❌ Unauthorized request - token may be invalid or expired');

  if (isRedirecting) return false; // Already navigating; this caller just throws.

  isRedirecting = true;
  removeAuthToken();
  removeUserData();
  try {
    // Non-sensitive UI state (which business is selected) — fine in localStorage.
    localStorage.removeItem('naitrust_selected_business_id');
  } catch {
    // Ignore storage errors (private browsing, etc.)
  }

  if (window.location.pathname === '/login') {
    if (redirectTimeoutId) clearTimeout(redirectTimeoutId);
    redirectTimeoutId = setTimeout(() => {
      isRedirecting = false;
      redirectTimeoutId = null;
    }, 2000);
    return false;
  }

  window.location.replace('/login');
  return true;
}

/**
 * HTTP request helper with proper error handling
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
  extras: RequestExtras = {}
): Promise<ApiResponse<T>> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const headers = extras.skipAuth ? baseHeaders : withAuthHeader(baseHeaders);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const data: any = isJson
      ? cleanResponseData(await response.json())
      : { message: await response.text() };

    if (response.status === 401) {
      // Browser is navigating away to /login — resolving quietly is harmless;
      // throwing would only surface a flash of "Unauthorized" before unload.
      if (handleUnauthorized()) return undefined as unknown as ApiResponse<T>;
      throw apiError({ message: 'Unauthorized - Please login again', statusCode: 401 });
    }

    if (!response.ok) {
      const error = apiError({
        message: data.error || data.message || `HTTP ${response.status}`,
        statusCode: response.status,
        errors: data.errors,
      });
      console.error('❌ API Request Error:', { url, status: response.status, error });
      throw error;
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw apiError({
        message: 'Request timed out. Please check your connection and try again.',
        statusCode: 408,
      });
    }

    console.error('❌ API Request Failed:', { url, error: error.message || error });

    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw apiError({
        message: 'Unable to reach the server. Please check your internet connection.',
        statusCode: 0,
      });
    }

    throw error;
  }
}

/**
 * HTTP Methods
 */
export const httpClient = {
  get: <T = any>(endpoint: string, headers?: HeadersInit, extras?: RequestExtras) =>
    request<T>(endpoint, { method: 'GET', headers }, extras),

  post: <T = any>(endpoint: string, data?: any, headers?: HeadersInit, extras?: RequestExtras) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data), headers }, extras),

  put: <T = any>(endpoint: string, data?: any, headers?: HeadersInit, extras?: RequestExtras) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data), headers }, extras),

  patch: <T = any>(endpoint: string, data?: any, headers?: HeadersInit, extras?: RequestExtras) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data), headers }, extras),

  delete: <T = any>(endpoint: string, headers?: HeadersInit, extras?: RequestExtras) =>
    request<T>(endpoint, { method: 'DELETE', headers }, extras),

  upload: async <T = any>(
    endpoint: string,
    formData: FormData,
    extraHeaders?: HeadersInit
  ): Promise<ApiResponse<T>> => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = withAuthHeader({ ...(extraHeaders as Record<string, string> | undefined) });

    try {
      const response = await fetch(url, { method: 'POST', headers, body: formData });
      const data: any = await response.json();

      if (response.status === 401) {
        if (handleUnauthorized()) return undefined as unknown as ApiResponse<T>;
        throw apiError({ message: 'Unauthorized - Please login again', statusCode: 401 });
      }

      if (!response.ok) {
        throw apiError({
          message: data.error || data.message || 'Upload failed',
          statusCode: response.status,
        });
      }

      return data as ApiResponse<T>;
    } catch (error: any) {
      console.error('❌ Upload Failed:', error);
      throw error;
    }
  },
};
