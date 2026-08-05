import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBusinessBill,
  listBusinessBills,
  markBusinessBillPaid,
} from '../libs/business-bills/bill-store';
import type { CreateBusinessBillInput } from '../libs/business-bills/types';

const businessBillsQueryKey = (businessId: string | undefined) => ['business-bills', businessId] as const;

export function useBusinessBills(businessId: string | undefined) {
  return useQuery({
    queryKey: businessBillsQueryKey(businessId),
    queryFn: () => listBusinessBills(businessId),
    enabled: Boolean(businessId),
  });
}

export function useCreateBusinessBill(businessId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateBusinessBillInput, 'businessId'>) => {
      if (!businessId) throw new Error('Business profile is unavailable.');
      return Promise.resolve(createBusinessBill({ ...input, businessId }));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessBillsQueryKey(businessId) }),
  });
}

export function useMarkBusinessBillPaid(businessId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billId: string) => {
      if (!businessId) throw new Error('Business profile is unavailable.');
      return Promise.resolve(markBusinessBillPaid(businessId, billId));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessBillsQueryKey(businessId) }),
  });
}
