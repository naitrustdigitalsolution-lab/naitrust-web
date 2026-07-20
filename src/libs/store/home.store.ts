import { create } from 'zustand';
import { homeApi } from '../api/home.api';
import type {
  ContactUsInput,
  JoinWaitlistInput,
  ReportConcernInput,
  SubmitFeedbackInput,
  SubscribeInput,
} from '../api/types';

type PublicFormKind = 'waitlist' | 'contact' | 'subscription' | 'feedback' | 'concern';

interface HomeState {
  pendingType: PublicFormKind | null;
  error: string | null;
  joinWaitlist: (input: JoinWaitlistInput) => ReturnType<typeof homeApi.joinWaitlist>;
  contactUs: (input: ContactUsInput) => ReturnType<typeof homeApi.contactUs>;
  subscribe: (input: SubscribeInput) => ReturnType<typeof homeApi.subscribe>;
  submitFeedback: (input: SubmitFeedbackInput) => ReturnType<typeof homeApi.submitFeedback>;
  reportConcern: (input: ReportConcernInput) => ReturnType<typeof homeApi.reportConcern>;
}

export const useHomeStore = create<HomeState>((set) => {
  function run<TInput, TResult>(kind: PublicFormKind, fn: (input: TInput) => Promise<TResult>) {
    return async (input: TInput) => {
      set({ pendingType: kind, error: null });
      try {
        return await fn(input);
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Submission failed.' });
        throw error;
      } finally {
        set({ pendingType: null });
      }
    };
  }

  return {
    pendingType: null,
    error: null,
    joinWaitlist: run('waitlist', homeApi.joinWaitlist),
    contactUs: run('contact', homeApi.contactUs),
    subscribe: run('subscription', homeApi.subscribe),
    submitFeedback: run('feedback', homeApi.submitFeedback),
    reportConcern: run('concern', homeApi.reportConcern),
  };
});
