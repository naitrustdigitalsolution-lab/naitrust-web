/**
 * useTrustProfile
 * React Query hook for the current user's Trust Profile summary.
 */

import { useQuery } from '@tanstack/react-query';
import { trustProfileApi } from '../libs/api/trust-profile.api';
import type { TrustProfile } from '../libs/store/types';

export const TRUST_PROFILE_QUERY_KEY = ['trust-profile'] as const;

export function useTrustProfile() {
  return useQuery<TrustProfile>({
    queryKey: TRUST_PROFILE_QUERY_KEY,
    queryFn: async () => (await trustProfileApi.getMine()).data,
  });
}
