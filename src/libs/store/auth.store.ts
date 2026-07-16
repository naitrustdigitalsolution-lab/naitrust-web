/**
 * Auth Store
 * Manages authentication state and user data
 * API-ONLY MODE - No Demo Data
 */

import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { authApi } from '../api';
import { setAuthToken, removeAuthToken, setUserData, removeUserData } from '../api/config';
import { cookieStorage } from '../utils/secure-storage';
import { logDataMode } from './config';
import type { User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<boolean | { requires2FA: boolean; user: User }>;
  verify2FALogin: (userIdOrEmail: string, token: string) => Promise<boolean>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  reset: () => void;
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setUser: (user) => {
          set({ user, isAuthenticated: !!user });
          if (user) {
            setUserData(user);
          } else {
            removeUserData();
          }
        },
        
        setToken: (token) => {
          set({ token });
          if (token) {
            setAuthToken(token);
          } else {
            removeAuthToken();
          }
        },

        login: async (email, password) => {
          try {
            set({ isLoading: true });
            logDataMode('Auth/Login');
            
            console.log('🔐 Attempting login:', { email });
            
            const response = await authApi.login({ email, password });
            
            console.log('📥 Login response:', response);
            
            if (response.success && response.data) {
              const { user, token, requires2FA } = response.data;
              
              // If 2FA is required, return the user data but don't complete login yet
              if (requires2FA) {
                console.log('🔐 2FA required for login');
                set({ 
                  user, 
                  isLoading: false,
                  // Don't set token or isAuthenticated yet - wait for 2FA verification
                });
                return { requires2FA: true, user };
              }
              
              console.log('✅ Login successful:', { 
                userId: user.id, 
                email: user.email, 
                role: user.role,
                tokenLength: token?.length 
              });
              
              // Store token and user data
              setAuthToken(token);
              setUserData(user);
              
              // Clear persisted business selection on new login (will use default)
              localStorage.removeItem('naitrust_selected_business_id');
              
              set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
              });
              
              return true;
            } else {
              console.error('❌ Login failed:', response.error || response.message);
              set({ isLoading: false });
              throw new Error(response.error || response.message || 'Login failed');
            }
          } catch (error: any) {
            console.error('❌ [AUTH STORE] Login error:', error);
            set({ isLoading: false });
            throw error;
          }
        },

        verify2FALogin: async (userIdOrEmail, token) => {
          try {
            set({ isLoading: true });
            logDataMode('Auth/Verify2FALogin');
            
            console.log('🔐 Verifying 2FA for login:', { userIdOrEmail });
            
            // Check if it's a UUID (userId) or email
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrEmail);
            const response = await authApi.verify2FALogin({ 
              [isUUID ? 'userId' : 'email']: userIdOrEmail, 
              token 
            });
            
            console.log('📥 2FA verification response:', response);
            
            if (response.success && response.data) {
              const { user, token: jwtToken } = response.data;
              
              console.log('✅ 2FA verification successful:', { 
                userId: user.id, 
                email: user.email, 
                role: user.role,
                tokenLength: jwtToken?.length 
              });
              
              // Store token and user data
              setAuthToken(jwtToken);
              setUserData(user);
              
              // Clear persisted business selection on new login (will use default)
              localStorage.removeItem('naitrust_selected_business_id');
              
              set({
                user,
                token: jwtToken,
                isAuthenticated: true,
                isLoading: false,
              });
              
              return true;
            } else {
              console.error('❌ 2FA verification failed:', response.error || response.message);
              set({ isLoading: false });
              throw new Error(response.error || response.message || '2FA verification failed');
            }
          } catch (error: any) {
            console.error('❌ [AUTH STORE] 2FA verification error:', error);
            set({ isLoading: false });
            throw error;
          }
        },

        register: async (data) => {
          try {
            set({ isLoading: true });
            logDataMode('Auth/Register');
            
            console.log('📝 Attempting registration:', data.email);
            
            const response = await authApi.register(data);
            
            console.log('📥 Registration response:', response);
            
            if (response.success && response.data) {
              const { user, token } = response.data;
              
              console.log('✅ Registration successful:', { 
                userId: user.id, 
                email: user.email, 
                role: user.role 
              });
              
              // Store token and user data
              setAuthToken(token);
              setUserData(user);
              
              set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              console.error('❌ Registration failed:', response.error || response.message);
              throw new Error(response.error || response.message || 'Registration failed');
            }
          } catch (error: any) {
            console.error('❌ [AUTH STORE] Register error:', error);
            set({ isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          try {
            logDataMode('Auth/Logout');
            console.log('👋 Logging out...');
            await authApi.logout();
          } catch (error) {
            console.error('❌ [AUTH STORE] Logout error:', error);
          } finally {
            // Clear all auth data
            removeAuthToken();
            removeUserData();
            // Clear persisted business selection on logout
            localStorage.removeItem('naitrust_selected_business_id');
            set(initialState);
            console.log('✅ Logged out successfully');
          }
        },

        fetchProfile: async () => {
          try {
            logDataMode('Auth/Profile');
            
            const response = await authApi.getProfile();
            
            if (response.success && response.data) {
              setUserData(response.data);
              set({ user: response.data });
            }
          } catch (error) {
            console.error('❌ [AUTH STORE] Fetch profile error:', error);
            // If 401, clear auth state
            if ((error as any).statusCode === 401) {
              get().logout();
            }
          }
        },

        updateProfile: async (data) => {
          try {
            logDataMode('Auth/UpdateProfile');
            
            const response = await authApi.updateProfile(data);
            
            if (response.success && response.data) {
              setUserData(response.data);
              set({ user: response.data });
            }
          } catch (error) {
            console.error('❌ [AUTH STORE] Update profile error:', error);
            throw error;
          }
        },

        changePassword: async (data) => {
          try {
            logDataMode('Auth/ChangePassword');
            
            await authApi.changePassword(data);
          } catch (error) {
            console.error('❌ [AUTH STORE] Change password error:', error);
            throw error;
          }
        },

        reset: () => {
          removeAuthToken();
          removeUserData();
          set(initialState);
        },
      }),
      {
        name: 'naitrust-auth',
        // Auth identity is sensitive → persist to Secure cookies, not localStorage.
        storage: createJSONStorage(() => cookieStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
