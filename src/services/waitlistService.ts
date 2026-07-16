import { appConfig } from "../configs/env";
import type { WaitlistPayload, WaitlistResponse } from '../types/global';
import { homeApi } from '../libs/api/home.api';

export async function submitWaitlist(payload: WaitlistPayload): Promise<WaitlistResponse> {
  const result = await homeApi.submit({ type: 'waitlist', name: payload.fullName, email: payload.email, phone: payload.phone, category: payload.userType, message: payload.transactionNeed, metadata: { businessName: payload.businessName, transactionRange: payload.transactionRange, expectations: payload.expectations }, consent: payload.consent, source: payload.source });

  return {
    message: result.message || "Waitlist request sent.",
    mode: appConfig.mode,
  };
}
