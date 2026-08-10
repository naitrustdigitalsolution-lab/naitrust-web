/**
 * Auth Context (Wrapper for Zustand Store)
 * This maintains the same API for backward compatibility
 * but uses the new modular Zustand stores internally
 */

import React, { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from './store/auth.store';
import type { User } from './store/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean | { requires2FA: boolean; user: User }>;
  verify2FALogin: (email: string, token: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
const ACTIVITY_KEY_PREFIX = 'naitrust:last-authenticated-activity:';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use individual stores
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const login = useAuthStore((state) => state.login);
  const verify2FALogin = useAuthStore((state) => state.verify2FALogin);
  const logout = useAuthStore((state) => state.logout);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const refreshedLegacyUserId = useRef<string | null>(null);
  const inactivityLogoutStarted = useRef(false);

  // Existing mock sessions created before Naitrust IDs were introduced are
  // refreshed once so users receive their issued ID without signing out.
  useEffect(() => {
    if (!isHydrated || !user || user.naitrustId || refreshedLegacyUserId.current === user.id) return;
    refreshedLegacyUserId.current = user.id;
    void fetchProfile();
  }, [fetchProfile, isHydrated, user]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !user) return;
    const activityKey = `${ACTIVITY_KEY_PREFIX}${user.id}`;
    const existing = Number(localStorage.getItem(activityKey));
    if (!Number.isFinite(existing) || existing <= 0) localStorage.setItem(activityKey, String(Date.now()));

    let lastRecorded = 0;
    const recordActivity = () => {
      const now = Date.now();
      // Mouse and touch events can fire rapidly; one shared write every second is sufficient.
      if (now - lastRecorded < 1_000) return;
      lastRecorded = now;
      localStorage.setItem(activityKey, String(now));
    };
    const enforceExpiry = () => {
      const lastActivity = Number(localStorage.getItem(activityKey));
      if (!Number.isFinite(lastActivity) || Date.now() - lastActivity < INACTIVITY_LIMIT_MS) return;
      if (inactivityLogoutStarted.current) return;
      inactivityLogoutStarted.current = true;
      localStorage.removeItem(activityKey);
      toast.warning('For your security, you were signed out after 5 minutes of inactivity.');
      void logout().finally(() => {
        inactivityLogoutStarted.current = false;
      });
    };

    const activityEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    window.addEventListener('focus', enforceExpiry);
    document.addEventListener('visibilitychange', enforceExpiry);
    const interval = window.setInterval(enforceExpiry, 15_000);

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, recordActivity));
      window.removeEventListener('focus', enforceExpiry);
      document.removeEventListener('visibilitychange', enforceExpiry);
      window.clearInterval(interval);
      if (!useAuthStore.getState().isAuthenticated) localStorage.removeItem(activityKey);
    };
  }, [isAuthenticated, isHydrated, logout, user]);

  return (
    <AuthContext.Provider value={{ user, token, login, verify2FALogin, logout, isAuthenticated, isLoading, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Export User type for backward compatibility
export type { User };
