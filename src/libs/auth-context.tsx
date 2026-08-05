/**
 * Auth Context (Wrapper for Zustand Store)
 * This maintains the same API for backward compatibility
 * but uses the new modular Zustand stores internally
 */

import React, { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
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

  // Existing mock sessions created before Naitrust IDs were introduced are
  // refreshed once so users receive their issued ID without signing out.
  useEffect(() => {
    if (!isHydrated || !user || user.naitrustId || refreshedLegacyUserId.current === user.id) return;
    refreshedLegacyUserId.current = user.id;
    void fetchProfile();
  }, [fetchProfile, isHydrated, user]);

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
