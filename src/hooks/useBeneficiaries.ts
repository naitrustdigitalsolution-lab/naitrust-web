/**
 * useBeneficiaries
 * React Query hooks for saved Instant Payment recipients.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { beneficiariesApi } from '../libs/api/beneficiaries.api';
import type { Beneficiary } from '../libs/store/types';
import type { CreateBeneficiaryInput } from '../libs/beneficiaries/recipient-beneficiary';
import { useAuth } from '../libs/auth-context';

export const BENEFICIARIES_QUERY_KEY = ['beneficiaries'] as const;

export function useBeneficiaries() {
  const { user } = useAuth();
  return useQuery<Beneficiary[]>({
    queryKey: [...BENEFICIARIES_QUERY_KEY, user?.id],
    queryFn: async () => (await beneficiariesApi.list()).data,
    enabled: Boolean(user?.id),
  });
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBeneficiaryInput) =>
      beneficiariesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BENEFICIARIES_QUERY_KEY }),
  });
}

export function useRemoveBeneficiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => beneficiariesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BENEFICIARIES_QUERY_KEY }),
  });
}
