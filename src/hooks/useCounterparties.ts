/**
 * useCounterparties
 * React Query hooks for the Business Network: saved counterparties and
 * favourite/block toggles.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { counterpartiesApi } from '../libs/api/counterparties.api';
import type { CounterpartyProfile } from '../libs/store/types';
import type { CreateCounterpartyInput, CounterpartyTransaction } from '../libs/counterparties/types';

export const COUNTERPARTIES_QUERY_KEY = ['counterparties'] as const;

export function useCounterparties(enabled = true) {
  return useQuery<CounterpartyProfile[]>({
    queryKey: COUNTERPARTIES_QUERY_KEY,
    queryFn: async () => (await counterpartiesApi.list()).data,
    enabled,
  });
}

export function useCounterparty(id: string | undefined) {
  return useQuery<CounterpartyProfile>({
    queryKey: [...COUNTERPARTIES_QUERY_KEY, id],
    queryFn: async () => (await counterpartiesApi.get(id!)).data,
    enabled: Boolean(id),
  });
}

export function useCounterpartyTransactions(id: string | undefined) {
  return useQuery<CounterpartyTransaction[]>({
    queryKey: [...COUNTERPARTIES_QUERY_KEY, id, 'transactions'],
    queryFn: async () => (await counterpartiesApi.listTransactions(id!)).data,
    enabled: Boolean(id),
  });
}

export function useCreateCounterparty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCounterpartyInput) => counterpartiesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUNTERPARTIES_QUERY_KEY }),
  });
}

export function useRemoveCounterparty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => counterpartiesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUNTERPARTIES_QUERY_KEY }),
  });
}

export function useToggleFavouriteCounterparty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => counterpartiesApi.toggleFavourite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUNTERPARTIES_QUERY_KEY }),
  });
}

export function useToggleBlockedCounterparty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => counterpartiesApi.toggleBlocked(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COUNTERPARTIES_QUERY_KEY }),
  });
}
