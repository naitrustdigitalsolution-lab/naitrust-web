/**
 * useInstantTransfer
 * React Query hooks for everyday Instant Payments — recipient validation,
 * sending a transfer, and the transfer history list/detail.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { instantTransferApi } from '../libs/api/instant-transfer.api';
import { WALLET_QUERY_KEY } from './useWallet';
import type { CreateInstantTransferInput, InstantTransfer, TransferRecipient } from '../libs/store/types';

export const INSTANT_TRANSFERS_QUERY_KEY = ['instant-transfers'] as const;

export function useInstantTransfers() {
  return useQuery<InstantTransfer[]>({
    queryKey: INSTANT_TRANSFERS_QUERY_KEY,
    queryFn: async () => (await instantTransferApi.getMyTransfers()).data,
  });
}

export function useInstantTransfer(id: string | undefined) {
  return useQuery<InstantTransfer>({
    queryKey: [...INSTANT_TRANSFERS_QUERY_KEY, id],
    queryFn: async () => (await instantTransferApi.getTransfer(id as string)).data,
    enabled: Boolean(id),
  });
}

export function useValidateRecipient() {
  return useMutation({
    mutationFn: (recipient: TransferRecipient) => instantTransferApi.validateRecipient(recipient),
  });
}

export function useCreateInstantTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInstantTransferInput) => instantTransferApi.createTransfer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTANT_TRANSFERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
    },
  });
}
