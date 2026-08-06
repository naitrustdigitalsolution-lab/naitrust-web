import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '../libs/api/bills.api';
import type { CreateBillPaymentInput } from '../libs/store/types';
import { WALLET_ACTIVITY_QUERY_KEY, WALLET_QUERY_KEY } from './useWallet';

export const BILL_PROVIDERS_QUERY_KEY = ['bill-providers'] as const;
export const BILL_PAYMENTS_QUERY_KEY = ['bill-payments'] as const;

export function useBillProviders() {
  return useQuery({ queryKey: BILL_PROVIDERS_QUERY_KEY, queryFn: async () => (await billsApi.listProviders()).data });
}
export function useBillPayments() {
  return useQuery({ queryKey: BILL_PAYMENTS_QUERY_KEY, queryFn: async () => (await billsApi.listPayments()).data });
}
export function usePayBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBillPaymentInput) => billsApi.purchase(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILL_PAYMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALLET_ACTIVITY_QUERY_KEY });
    },
  });
}
