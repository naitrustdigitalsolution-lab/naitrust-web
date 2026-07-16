/**
 * useDispute and mutations
 * React Query hooks for a deal's dispute (open + message thread).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disputeApi } from '../libs/api/dispute.api';
import type { DealDispute } from '../libs/store/types';

export const DISPUTE_QUERY_KEY = ['dispute'] as const;

export function useDispute(dealId: string | undefined) {
  return useQuery<DealDispute | null>({
    queryKey: [...DISPUTE_QUERY_KEY, dealId],
    enabled: !!dealId,
    queryFn: async () => (dealId ? (await disputeApi.get(dealId)).data : null),
  });
}

export function useOpenDispute(dealId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { reason: string; description: string }) => disputeApi.open(dealId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...DISPUTE_QUERY_KEY, dealId] }),
  });
}

export function useDisputeMessage(dealId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => disputeApi.message(dealId!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...DISPUTE_QUERY_KEY, dealId] }),
  });
}
