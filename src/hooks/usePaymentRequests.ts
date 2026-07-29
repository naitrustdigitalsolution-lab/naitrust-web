/**
 * usePaymentRequests
 * React Query hooks for requesting an Instant Payment from a counterparty.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentRequestsApi } from '../libs/api/payment-requests.api';
import type { PaymentRequest } from '../libs/store/types';

export const PAYMENT_REQUESTS_QUERY_KEY = ['payment-requests'] as const;

export function usePaymentRequests() {
  return useQuery<PaymentRequest[]>({
    queryKey: PAYMENT_REQUESTS_QUERY_KEY,
    queryFn: async () => (await paymentRequestsApi.list()).data,
  });
}

export function useCreatePaymentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      requestedFromName: string;
      amountMinor: number;
      currency: string;
      reason?: string;
    }) => paymentRequestsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENT_REQUESTS_QUERY_KEY }),
  });
}

export function useRespondToPaymentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'fulfil' | 'decline' }) =>
      paymentRequestsApi.respond(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENT_REQUESTS_QUERY_KEY }),
  });
}
