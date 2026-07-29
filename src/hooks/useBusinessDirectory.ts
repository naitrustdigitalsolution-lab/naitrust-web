import { useQuery } from '@tanstack/react-query';
import { businessApi } from '../libs/api/business.api';
import type { BusinessProfile } from '../libs/store/types';

export function useBusinessSearch(query: string) {
  return useQuery<BusinessProfile[]>({
    queryKey: ['business-directory', query],
    queryFn: async () => (await businessApi.search(query)).data,
    staleTime: 60_000,
  });
}

export function usePublicBusiness(slugOrId: string | undefined) {
  return useQuery<BusinessProfile | null>({
    queryKey: ['public-business', slugOrId],
    enabled: !!slugOrId,
    retry: false,
    queryFn: async () =>
      slugOrId ? (await businessApi.getPublicProfile(slugOrId)).data : null,
  });
}
