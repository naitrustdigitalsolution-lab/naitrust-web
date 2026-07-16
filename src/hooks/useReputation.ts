/**
 * useReputation
 * React Query hook for the current user's reputation summary.
 */

import { useQuery } from '@tanstack/react-query';
import { reputationApi } from '../libs/api/reputation.api';
import type { ReputationSummary } from '../libs/store/types';

export const REPUTATION_QUERY_KEY = ['reputation', 'me'] as const;

export function useReputation() {
  return useQuery<ReputationSummary>({
    queryKey: REPUTATION_QUERY_KEY,
    queryFn: async () => (await reputationApi.getMine()).data,
  });
}
