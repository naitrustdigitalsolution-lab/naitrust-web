import { create } from 'zustand';
import { homeApi, type PublicSubmissionPayload } from '../api/home.api';

interface HomeState {
  pendingType: PublicSubmissionPayload['type'] | null;
  error: string | null;
  submit: (payload: PublicSubmissionPayload) => ReturnType<typeof homeApi.submit>;
}

export const useHomeStore = create<HomeState>((set) => ({
  pendingType: null,
  error: null,
  submit: async (payload) => {
    set({ pendingType: payload.type, error: null });
    try {
      return await homeApi.submit(payload);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Submission failed.' });
      throw error;
    } finally {
      set({ pendingType: null });
    }
  },
}));
