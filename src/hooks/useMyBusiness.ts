/**
 * useMyBusiness
 * The business profile tied to the current account (business accounts only).
 * Returns null for customer/admin accounts. Server state via React Query.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessApi, type BusinessUpdate } from '../libs/api/business.api';
import { useAuth } from '../libs/auth-context';
import { isBusinessAccount } from '../libs/utils/account';
import type { BusinessProfile } from '../libs/store/types';

export function useMyBusiness() {
  const { user } = useAuth();
  const enabled = isBusinessAccount(user) && !!user?.id;
  return useQuery<BusinessProfile | null>({
    queryKey: ['my-business', user?.id],
    enabled,
    queryFn: async () => (user?.id ? (await businessApi.getMine(user.id)).data : null),
  });
}

export function useUpdateBusiness() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: BusinessUpdate) => businessApi.update(user!.id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-business', user?.id] }),
  });
}
