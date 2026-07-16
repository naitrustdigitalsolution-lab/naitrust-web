/**
 * HTTP Client
 * Core HTTP request handler with error handling and JWT authentication
 */

import { API_CONFIG, getAuthToken } from './config';

// Flag to prevent multiple redirects (module-level singleton)
let isRedirecting = false;
let redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * HTTP request helper with proper error handling
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add JWT token to all requests if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let data;
    if (isJson) {
      data = cleanResponseData(await response.json());
    } else {
      const text = await response.text();
      data = { message: text };
    }
    
    // Handle 401 Unauthorized
    // Only redirect to login for protected routes, not public routes like business profiles
    if (response.status === 401) {
      console.error('❌ Unauthorized request - token may be invalid or expired');
      
      // Check if this is a public route that shouldn't redirect
      // Public routes: business profiles, search, business lists, reviews, analytics tracking
      // Also includes endpoints used on public business profile pages (even if backend requires auth, we don't redirect)
      const publicRoutes = [
        '/businesses/',  // Business endpoints (e.g., /businesses/:id)
        '/reviews/business/',  // Public reviews endpoint (/reviews/business/:businessId)
        '/search',  // Search endpoint
        '/ai/trust-score/',  // AI trust score (used on public business profiles)
        '/reported-handles/',  // Reported handles (used on public business profiles)
        '/digital-prints/shared/',  // Public Digital Print viewer
      ];
      
      // Analytics tracking endpoint is public (uses optionalAuthenticate)
      const isAnalyticsTracking = endpoint.includes('/analytics/businesses/') && endpoint.includes('/track/');
      
      // Exclude protected sub-routes
      const isProtectedSubRoute = 
        endpoint.includes('/businesses/save') || 
        endpoint.includes('/businesses/my') ||
        endpoint.includes('/businesses/:id/save') ||
        endpoint.includes('/reviews/my') ||
        (endpoint.includes('/reported-handles/') && endpoint.includes('/delete/')) || // Only exclude DELETE, allow GET /:businessId and GET /:businessId/stats
        (endpoint.includes('/analytics/business/') && !endpoint.includes('/track/')); // Analytics GET requires auth, but POST /track/ doesn't
      
      const isPublicRoute = (publicRoutes.some(route => endpoint.includes(route)) || isAnalyticsTracking) && !isProtectedSubRoute;
      
      if (!isPublicRoute) {
        // Prevent multiple redirects - check flag FIRST
        if (isRedirecting) {
          // Already redirecting, just throw the error without attempting another redirect
          const error: ApiError = {
            message: 'Unauthorized - Please login again',
            statusCode: 401,
          };
          throw error;
        }
        
        // Set redirect flag IMMEDIATELY (before any async operations)
        isRedirecting = true;
        
        // Clear any existing auth state IMMEDIATELY (synchronously)
        try {
          localStorage.removeItem('naitrust_token');
          localStorage.removeItem('naitrust_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('naitrust_selected_business_id');
          // Clear Zustand persisted auth store state (the store uses 'naitrust-auth' as the persist key)
          localStorage.removeItem('naitrust-auth');
        } catch (e) {
          // Ignore localStorage errors
        }
        
        // Use window.location.replace to redirect IMMEDIATELY (synchronously)
        // This will stop all JavaScript execution and redirect the page
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
          // Code after this won't execute, but TypeScript doesn't know that
          return; // This will never execute, but helps TypeScript
        } else {
          // If already on login page, reset flag after a delay
          if (redirectTimeoutId) {
            clearTimeout(redirectTimeoutId);
          }
          redirectTimeoutId = setTimeout(() => {
            isRedirecting = false;
            redirectTimeoutId = null;
          }, 2000);
        }
      }
      
      const error: ApiError = {
        message: 'Unauthorized - Please login again',
        statusCode: 401,
      };
      throw error;
    }
    
    if (!response.ok) {
      const error: ApiError = {
        message: data.error || data.message || `HTTP ${response.status}`,
        statusCode: response.status,
        errors: data.errors,
      };
      
      console.error('❌ API Request Error:', {
        url,
        status: response.status,
        error,
      });
      
      throw error;
    }
    
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw {
        message: 'Request timed out. Please check your connection and try again.',
        statusCode: 408,
      } as ApiError;
    }
    
    console.error('❌ API Request Failed:', {
      url,
      error: error.message || error,
    });
    
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw {
        message: 'Unable to reach the server. Please check your internet connection.',
        statusCode: 0,
      } as ApiError;
    }
    
    throw error;
  }
}

/**
 * HTTP Methods
 */
export const httpClient = {
  get: <T = any>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: 'GET', headers }),
    
  post: <T = any>(endpoint: string, data?: any, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    }),
    
  put: <T = any>(endpoint: string, data?: any, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers,
    }),
    
  patch: <T = any>(endpoint: string, data?: any, headers?: HeadersInit) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers,
    }),
    
  delete: <T = any>(endpoint: string, headers?: HeadersInit) =>
    request<T>(endpoint, { method: 'DELETE', headers }),
    
  upload: async <T = any>(endpoint: string, formData: FormData, extraHeaders?: HeadersInit) => {
    const token = getAuthToken();
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = { ...extraHeaders };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      const data = await response.json();
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('❌ Unauthorized upload - token may be invalid or expired');
        localStorage.removeItem('naitrust_token');
        localStorage.removeItem('naitrust_user');
        
        // Redirect to login page
        window.location.href = '/login';
        
        throw {
          message: 'Unauthorized - Please login again',
          statusCode: 401,
        } as ApiError;
      }
      
      if (!response.ok) {
        throw {
          message: data.error || data.message || 'Upload failed',
          statusCode: response.status,
        } as ApiError;
      }
      
      return data as ApiResponse<T>;
    } catch (error: any) {
      console.error('❌ Upload Failed:', error);
      throw error;
    }
  },
};