/**
 * Auth Context (Wrapper for Zustand Store)
 * This maintains the same API for backward compatibility
 * but uses the new modular Zustand stores internally
 */

import React, { createContext, useContext, type ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use individual stores
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const verify2FALogin = useAuthStore((state) => state.verify2FALogin);
  const logout = useAuthStore((state) => state.logout);

  return (
    <AuthContext.Provider value={{ user, token, login, verify2FALogin, logout, isAuthenticated, isLoading }}>
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
