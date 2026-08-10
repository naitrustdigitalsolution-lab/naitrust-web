/**
 * useInvitations / useInvitation
 * React Query hooks for incoming safe-deal invitations. Server state stays in
 * React Query: never copied into a store.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '../libs/api/invitations.api';
import type { DealInvitation, InvitationStatus, PublicInvitationPreview, User } from '../libs/store/types';
import { useAuthStore } from '../libs/store/auth.store';
import { TRANSACTIONS_QUERY_KEY } from './useTransactions';

export const INVITATIONS_QUERY_KEY = ['invitations'] as const;

export function useInvitations() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery<DealInvitation[]>({
    queryKey: [...INVITATIONS_QUERY_KEY, userId],
    enabled: !!userId,
    queryFn: async () => (await invitationsApi.list()).data,
  });
}

export function useInvitation(id: string | undefined) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery<DealInvitation | null>({
    queryKey: [...INVITATIONS_QUERY_KEY, id, userId],
    enabled: !!id && !!userId,
    queryFn: async () => (id ? (await invitationsApi.getOne(id)).data ?? null : null),
  });
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
      livenessVerifiedAt,
    }: {
      id: string;
      action: Extract<InvitationStatus, 'accepted' | 'changes_requested' | 'declined'>;
      reason?: string;
      livenessVerifiedAt?: string;
    }) => invitationsApi.respond(id, action, reason, livenessVerifiedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
}

export function usePublicInvitation(token: string | undefined) {
  return useQuery<PublicInvitationPreview | null>({
    queryKey: ['public-invitation', token],
    enabled: !!token,
    retry: false,
    queryFn: async () => (token ? (await invitationsApi.getPublicPreview(token)).data : null),
  });
}

export function useClaimInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, user }: { token: string; user: Pick<User, 'id' | 'email' | 'phone' | 'naitrustId' | 'role' | 'kycVerified'> }) =>
      invitationsApi.claim(token, user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY }),
  });
}

/** Count of invitations still awaiting a response: for nav badges. */
export function usePendingInvitationCount(): number {
  const { data } = useInvitations();
  return data?.filter((inv) => inv.status === 'pending').length ?? 0;
}
