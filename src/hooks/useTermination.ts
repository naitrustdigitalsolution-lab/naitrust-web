/**
 * useTermination and mutations
 * React Query hooks for a deal's termination request (request + accept/reject).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { terminationApi } from '../libs/api/termination.api';
import type { DealTermination } from '../libs/store/types';

export const TERMINATION_QUERY_KEY = ['termination'] as const;

export function useTermination(dealId: string | undefined) {
  return useQuery<DealTermination | null>({
    queryKey: [...TERMINATION_QUERY_KEY, dealId],
    enabled: !!dealId,
    queryFn: async () => (dealId ? (await terminationApi.get(dealId)).data : null),
  });
}

export function useRequestTermination(dealId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => terminationApi.request(dealId!, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...TERMINATION_QUERY_KEY, dealId] }),
  });
}

export function useRespondTermination(dealId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { accept: boolean; reason?: string; byName?: string }) =>
      terminationApi.respond(dealId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...TERMINATION_QUERY_KEY, dealId] }),
  });
}
