/**
 * useBeneficiaries
 * React Query hooks for saved Instant Payment recipients.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { beneficiariesApi } from '../libs/api/beneficiaries.api';
import type { Beneficiary } from '../libs/store/types';

export const BENEFICIARIES_QUERY_KEY = ['beneficiaries'] as const;

export function useBeneficiaries() {
  return useQuery<Beneficiary[]>({
    queryKey: BENEFICIARIES_QUERY_KEY,
    queryFn: async () => (await beneficiariesApi.list()).data,
  });
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Beneficiary, 'id' | 'createdAt' | 'isFavourite'>) =>
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
