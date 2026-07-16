/**
 * useInvitations / useInvitation
 * React Query hooks for incoming safe-deal invitations. Server state stays in
 * React Query — never copied into a store.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '../libs/api/invitations.api';
import type { DealInvitation, InvitationStatus } from '../libs/store/types';

export const INVITATIONS_QUERY_KEY = ['invitations'] as const;

export function useInvitations() {
  return useQuery<DealInvitation[]>({
    queryKey: INVITATIONS_QUERY_KEY,
    queryFn: async () => (await invitationsApi.list()).data,
  });
}

export function useInvitation(id: string | undefined) {
  return useQuery<DealInvitation | null>({
    queryKey: [...INVITATIONS_QUERY_KEY, id],
    enabled: !!id,
    queryFn: async () => (id ? (await invitationsApi.getOne(id)).data ?? null : null),
  });
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: Extract<InvitationStatus, 'accepted' | 'declined'>;
    }) => invitationsApi.respond(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
  });
}

/** Count of invitations still awaiting a response — for nav badges. */
export function usePendingInvitationCount(): number {
  const { data } = useInvitations();
  return data?.filter((inv) => inv.status === 'pending').length ?? 0;
}
