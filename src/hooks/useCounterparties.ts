/**
 * useCounterparties
 * React Query hooks for the Business Network — saved counterparties and
 * favourite/block toggles.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { counterpartiesApi } from '../libs/api/counterparties.api';
import type { CounterpartyProfile } from '../libs/store/types';

export const COUNTERPARTIES_QUERY_KEY = ['counterparties'] as const;

export function useCounterparties() {
  return useQuery<CounterpartyProfile[]>({
    queryKey: COUNTERPARTIES_QUERY_KEY,
    queryFn: async () => (await counterpartiesApi.list()).data,
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
