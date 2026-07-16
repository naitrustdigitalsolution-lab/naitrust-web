/**
 * useTransactions / useCreateDeal
 * React Query hooks for the current user's safe deals.
 * Server state stays in React Query — never copied into a client store.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../libs/api/transactions.api';
import type { CreateSafeDealInput, SafeDealSummary } from '../libs/store/types';

export const TRANSACTIONS_QUERY_KEY = ['transactions', 'my'] as const;

export function useTransactions() {
  return useQuery<SafeDealSummary[]>({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: async () => (await transactionsApi.getMyTransactions()).data,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSafeDealInput) => transactionsApi.createTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}
