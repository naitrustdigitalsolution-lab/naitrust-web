import { create } from 'zustand';
import { businessApi } from '../api/business.api';
import type { BusinessProfile } from './types';

interface BusinessState {
  myBusinesses: BusinessProfile[];
  currentBusiness: BusinessProfile | null;
  isLoading: boolean;
  setCurrentBusiness: (business: BusinessProfile | null) => void;
  fetchMyBusinesses: () => Promise<void>;
}

function extractBusinesses(response: any): BusinessProfile[] {
  const value = response?.data?.businesses ?? response?.data ?? [];
  return Array.isArray(value) ? value : [];
}

export const useBusinessStore = create<BusinessState>((set) => ({
  myBusinesses: [],
  currentBusiness: null,
  isLoading: false,
  setCurrentBusiness: (currentBusiness) => set({ currentBusiness }),
  fetchMyBusinesses: async () => {
    set({ isLoading: true });
    try {
      const response = await businessApi.getMyBusinesses();
      const myBusinesses = extractBusinesses(response);
      set((state) => ({ myBusinesses, currentBusiness: state.currentBusiness ?? myBusinesses[0] ?? null }));
    } finally {
      set({ isLoading: false });
    }
  },
}));
