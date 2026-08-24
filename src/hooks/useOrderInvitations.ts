import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderInvitationsApi } from '../libs/marketplace/order-invitations.api';
import type { CustomOrderLink } from '../libs/marketplace/types';

export const ORDER_INVITATIONS_QUERY_KEY = ['order-invitations'] as const;

export function useOrderInvitations(orderId: string | undefined) {
  return useQuery({
    queryKey: [...ORDER_INVITATIONS_QUERY_KEY, 'for-order', orderId],
    enabled: !!orderId,
    queryFn: () => orderInvitationsApi.listForOrder(orderId!),
  });
}

export function useInviteAgentToOrder(orderId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { orderReference: string; orderSummary: string; destination?: string; links: CustomOrderLink[]; contact: string; invitedByName: string }) =>
      orderInvitationsApi.create({ ...input, orderId: orderId! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...ORDER_INVITATIONS_QUERY_KEY, 'for-order', orderId] }),
  });
}

/** A sourcing agent inviting a buyer to an order the agent found products for. */
export function useInviteBuyerToOrder() {
  return useMutation({
    mutationFn: (input: { orderSummary: string; destination?: string; links: CustomOrderLink[]; contact: string; invitedByName: string }) =>
      orderInvitationsApi.createBuyerRequest(input),
  });
}

export function useSentOrderInvitations(invitedByName: string | undefined) {
  return useQuery({
    queryKey: [...ORDER_INVITATIONS_QUERY_KEY, 'sent-by', invitedByName],
    enabled: !!invitedByName,
    queryFn: () => orderInvitationsApi.listSentByName(invitedByName!),
  });
}

export function usePublicOrderInvitation(token: string | undefined) {
  return useQuery({
    queryKey: [...ORDER_INVITATIONS_QUERY_KEY, 'public', token],
    enabled: !!token,
    retry: false,
    queryFn: () => (token ? orderInvitationsApi.getPublicPreview(token) : null),
  });
}

export function useClaimOrderInvitation() {
  return useMutation({
    mutationFn: ({ token, user }: { token: string; user: { id: string; name: string } }) => orderInvitationsApi.claim(token, user),
  });
}
