/**
 * useTransactions / useCreateDeal
 * React Query hooks for the current user's safe deals.
 * Server state stays in React Query: never copied into a client store.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../libs/api/transactions.api';
import type { CreateSafeDealInput, SafeDealSummary } from '../libs/store/types';
import { useAuthStore } from '../libs/store/auth.store';

export const TRANSACTIONS_QUERY_KEY = ['transactions', 'my'] as const;

export function useTransactions() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery<SafeDealSummary[]>({
    queryKey: [...TRANSACTIONS_QUERY_KEY, userId],
    enabled: !!userId,
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

export function useUpdateDeal(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSafeDealInput) => transactionsApi.updateTransaction(id!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['deal'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
