/**
 * Dashboard Store
 * Tracks global dashboard state like initial load status
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DashboardState {
  // Track if dashboards have been initially loaded
  hasInitiallyLoaded: {
    customer: boolean;
    business: boolean;
    savedBusinesses: boolean;
    admin: boolean;
  };
  
  // Actions
  setCustomerDashboardLoaded: (loaded: boolean) => void;
  setBusinessDashboardLoaded: (loaded: boolean) => void;
  setSavedBusinessesLoaded: (loaded: boolean) => void;
  setAdminDashboardLoaded: (loaded: boolean) => void;
  resetDashboardState: () => void;
}

const initialState = {
  hasInitiallyLoaded: {
    customer: false,
    business: false,
    savedBusinesses: false,
    admin: false,
  },
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      ...initialState,

      setCustomerDashboardLoaded: (loaded) =>
        set((state) => ({
          hasInitiallyLoaded: {
            ...state.hasInitiallyLoaded,
            customer: loaded,
          },
        })),

      setBusinessDashboardLoaded: (loaded) =>
        set((state) => ({
          hasInitiallyLoaded: {
            ...state.hasInitiallyLoaded,
            business: loaded,
          },
        })),

      setSavedBusinessesLoaded: (loaded) =>
        set((state) => ({
          hasInitiallyLoaded: {
            ...state.hasInitiallyLoaded,
            savedBusinesses: loaded,
          },
        })),

      setAdminDashboardLoaded: (loaded) =>
        set((state) => ({
          hasInitiallyLoaded: {
            ...state.hasInitiallyLoaded,
            admin: loaded,
          },
        })),

      resetDashboardState: () => set(initialState),
    }),
    { name: 'DashboardStore' }
  )
);
