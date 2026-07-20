import { appConfig } from "../configs/env";
import type { WaitlistPayload, WaitlistResponse } from '../types/global';
import { homeApi } from '../libs/api/home.api';

export async function submitWaitlist(payload: WaitlistPayload): Promise<WaitlistResponse> {
  // NOTE: the live /api/Public/joinWaitlist endpoint only accepts name, email,
  // phone, and source. businessName, userType, transactionRange,
  // transactionNeed, and expectations are collected by the modal but have no
  // field to go into on this endpoint, so they are not sent.
  const result = await homeApi.joinWaitlist({
    name: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    source: payload.source,
  });

  return {
    message: result.message || "Waitlist request sent.",
    mode: appConfig.mode,
  };
}
