/**
 * useNegotiation and mutations
 * React Query hooks for a deal's negotiation thread.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { negotiationApi } from '../libs/api/negotiation.api';
import type { DealNegotiation, ProposedChanges } from '../libs/store/types';

export const NEGOTIATION_QUERY_KEY = ['negotiation'] as const;

export function useNegotiation(dealId: string | undefined) {
  return useQuery<DealNegotiation | null>({
    queryKey: [...NEGOTIATION_QUERY_KEY, dealId],
    enabled: !!dealId,
    queryFn: async () => (dealId ? (await negotiationApi.get(dealId)).data : null),
  });
}

export function useProposeNegotiation(dealId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { message: string; changes: ProposedChanges }) =>
      negotiationApi.propose(dealId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...NEGOTIATION_QUERY_KEY, dealId] }),
  });
}

export function useRespondNegotiation(dealId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ proposalId, action }: { proposalId: string; action: 'accepted' | 'declined' }) =>
      negotiationApi.respond(dealId!, proposalId, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...NEGOTIATION_QUERY_KEY, dealId] }),
  });
}

export function useWithdrawNegotiation(dealId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => negotiationApi.withdraw(dealId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...NEGOTIATION_QUERY_KEY, dealId] }),
  });
}
