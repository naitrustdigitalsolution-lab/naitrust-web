/**
 * Public Service
 * Thin, typed functions for every public-facing form — waitlist, contact,
 * newsletter subscription, feedback, and report a concern. Each wraps the
 * matching route in src/libs/api/home.api.ts.
 */
import { homeApi } from '../libs/api/home.api';
import type {
  ContactUsInput,
  ReportConcernInput,
  SubmitFeedbackInput,
  SubscribeInput,
} from '../libs/api/types';
import type { WaitlistPayload, WaitlistResponse } from '../types/global';

export async function joinWaitlist(payload: WaitlistPayload): Promise<WaitlistResponse> {
  const result = await homeApi.joinWaitlist({
    name: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    source: payload.source,
    businessName: payload.businessName,
    userType: payload.userType,
    transactionRange: payload.transactionRange,
    transactionNeed: payload.transactionNeed,
    expectations: payload.expectations,
    consent: payload.consent,
    submittedAt: payload.submittedAt,
  });

  return { message: result.message || 'Waitlist request sent.' };
}

export function contactUs(input: ContactUsInput) {
  return homeApi.contactUs(input);
}

export function subscribe(input: SubscribeInput) {
  return homeApi.subscribe(input);
}

export function submitFeedback(input: SubmitFeedbackInput) {
  return homeApi.submitFeedback(input);
}

export function reportConcern(input: ReportConcernInput) {
  return homeApi.reportConcern(input);
}
