import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trustCheckoutsApi } from '../libs/api/trust-checkouts.api';
import type { CreateTrustCheckoutInput } from '../libs/store/types';

export function useTrustCheckout(publicId?: string | null) {
  return useQuery({
    queryKey: ['trust-checkout', publicId],
    enabled: Boolean(publicId),
    retry: false,
    queryFn: async () => (await trustCheckoutsApi.getPublic(publicId!)).data,
  });
}

export function useCreateTrustCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTrustCheckoutInput) => trustCheckoutsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trust-checkouts'] }),
  });
}

export function useConfirmTrustCheckoutTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => trustCheckoutsApi.confirmTransfer(publicId),
    onSuccess: (response) => queryClient.setQueryData(['trust-checkout', response.data.publicId], response.data),
  });
}
