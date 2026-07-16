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
  const enabled = isBusinessAccount(user) && !!user?.email;
  return useQuery<BusinessProfile | null>({
    queryKey: ['my-business', user?.email],
    enabled,
    queryFn: async () => (user?.email ? (await businessApi.getMine(user.email)).data : null),
  });
}

export function useUpdateBusiness() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: BusinessUpdate) => businessApi.update(user!.email, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-business', user?.email] }),
  });
}
