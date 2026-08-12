/**
 * useWallet
 * React Query hooks for the everyday wallet: balance, linked bank accounts,
 * activity feed, and the fund/withdraw mutations.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../libs/api/wallet.api';
import type { LinkedBankAccount, WalletAccount, WalletActivityEvent } from '../libs/store/types';

export const WALLET_QUERY_KEY = ['wallet'] as const;
export const WALLET_BANK_ACCOUNTS_QUERY_KEY = ['wallet', 'bank-accounts'] as const;
export const WALLET_ACTIVITY_QUERY_KEY = ['wallet', 'activity'] as const;

export function useWallet() {
  return useQuery<WalletAccount>({
    queryKey: WALLET_QUERY_KEY,
    queryFn: async () => (await walletApi.getMine()).data,
  });
}

export function useLinkedBankAccounts() {
  return useQuery<LinkedBankAccount[]>({
    queryKey: WALLET_BANK_ACCOUNTS_QUERY_KEY,
    queryFn: async () => (await walletApi.getLinkedBankAccounts()).data,
  });
}

export function useWalletActivity() {
  return useQuery<WalletActivityEvent[]>({
    queryKey: WALLET_ACTIVITY_QUERY_KEY,
    queryFn: async () => (await walletApi.getActivity()).data,
  });
}

export function useFundWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { linkedBankAccountId: string; amountMinor: number }) =>
      walletApi.fund(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY }),
  });
}

export function useFundBillsAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amountMinor: number) => walletApi.fundBillsAccount(amountMinor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALLET_ACTIVITY_QUERY_KEY });
    },
  });
}

export function useWithdrawFromWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { linkedBankAccountId: string; amountMinor: number }) =>
      walletApi.withdraw(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY }),
  });
}
