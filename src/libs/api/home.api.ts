import { httpClient } from './client';
import { endpoints } from './endpoints';
import type { ApiSuccess } from './types';
import type {
  JoinWaitlistInput,
  ContactUsInput,
  SubscribeInput,
  SubmitFeedbackInput,
  ReportConcernInput
} from './types';

export const homeApi = {
  /** POST /Public/joinWaitlist */
  joinWaitlist: async (input: JoinWaitlistInput): Promise<ApiSuccess<JoinWaitlistInput>> => {
    const res = await httpClient.post(endpoints.public.joinWaitlist, input);
    return res as ApiSuccess<JoinWaitlistInput>;
  },

  /** POST /Public/contactUs */
  contactUs: async (input: ContactUsInput): Promise<ApiSuccess<ContactUsInput>> => {
    const res = await httpClient.post(endpoints.public.contactUs, input);
    return res as ApiSuccess<ContactUsInput>;
  },

  /** POST /Public/subscribe */
  subscribe: async (input: SubscribeInput): Promise<ApiSuccess<SubscribeInput>> => {
    const res = await httpClient.post(endpoints.public.subscribe, input);
    return res as ApiSuccess<SubscribeInput>;
  },

  /** POST /Public/submitFeedback */
  submitFeedback: async (input: SubmitFeedbackInput): Promise<ApiSuccess<SubmitFeedbackInput>> => {
    const res = await httpClient.post(endpoints.public.submitFeedback, input);
     return res as ApiSuccess<SubmitFeedbackInput>;
  },

  /** POST /Public/reportConcern */
  reportConcern: async (input: ReportConcernInput): Promise<ApiSuccess<ReportConcernInput>> => {
    const res = await httpClient.post(endpoints.public.reportConcern, input);
    return res as ApiSuccess<ReportConcernInput>;
  },
};
