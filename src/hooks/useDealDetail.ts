/**
 * useDealDetail / useDealMessages / useSendDealMessage
 * React Query hooks for the transaction room: the full deal detail and the
 * chat thread between the parties. Server state stays in React Query.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealDetailApi } from '../libs/api/deal-detail.api';
import { dealMessagesApi } from '../libs/api/deal-messages.api';
import type { SafeDealDetail } from '../libs/store/types';
import type { DealMessage } from '../libs/store/types';

export const DEAL_DETAIL_QUERY_KEY = ['deal'] as const;
export const DEAL_MESSAGES_QUERY_KEY = ['deal-messages'] as const;

export function useDealDetail(id: string | undefined) {
  return useQuery<SafeDealDetail | null>({
    queryKey: [...DEAL_DETAIL_QUERY_KEY, id],
    enabled: !!id,
    queryFn: async () => (id ? (await dealDetailApi.getOne(id)).data : null),
  });
}

export function useDealMessages(id: string | undefined, counterpartyName?: string) {
  return useQuery<DealMessage[]>({
    queryKey: [...DEAL_MESSAGES_QUERY_KEY, id],
    enabled: !!id,
    queryFn: async () => (id ? (await dealMessagesApi.list(id, counterpartyName)).data : []),
  });
}

export function useSendDealMessage(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => dealMessagesApi.send(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEAL_MESSAGES_QUERY_KEY, id] });
    },
  });
}

function useDealDetailInvalidator(id: string | undefined) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [...DEAL_DETAIL_QUERY_KEY, id] });
}

export function useAdvanceTracking(id: string | undefined) {
  const invalidate = useDealDetailInvalidator(id);
  return useMutation({
    mutationFn: () => dealDetailApi.advanceTracking(id!),
    onSuccess: invalidate,
  });
}

export function useAddTrackingStep(id: string | undefined) {
  const invalidate = useDealDetailInvalidator(id);
  return useMutation({
    mutationFn: (input: { title: string; description?: string; afterStepId?: string | null }) =>
      dealDetailApi.addTrackingStep(id!, { title: input.title, description: input.description }, input.afterStepId),
    onSuccess: invalidate,
  });
}

export function useEditTrackingStep(id: string | undefined) {
  const invalidate = useDealDetailInvalidator(id);
  return useMutation({
    mutationFn: (input: { stepId: string; title: string; description?: string }) =>
      dealDetailApi.editTrackingStep(id!, input.stepId, { title: input.title, description: input.description }),
    onSuccess: invalidate,
  });
}

export function useRevertTracking(id: string | undefined) {
  const invalidate = useDealDetailInvalidator(id);
  return useMutation({
    mutationFn: () => dealDetailApi.revertTracking(id!),
    onSuccess: invalidate,
  });
}

export function useAddEvidence(id: string | undefined) {
  const invalidate = useDealDetailInvalidator(id);
  return useMutation({
    mutationFn: ({
      items,
      uploadedByName,
    }: {
      items: { fileName: string; kind: string; note?: string; fileUrl?: string; mimeType?: string }[];
      uploadedByName: string;
    }) => dealDetailApi.addEvidence(id!, items, uploadedByName),
    onSuccess: invalidate,
  });
}
