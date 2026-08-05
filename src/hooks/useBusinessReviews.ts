import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessReviewApi } from '../libs/business-reviews/business-review.api';
import type { SubmitBusinessReviewInput } from '../libs/business-reviews/types';
import type { User } from '../libs/store/types';

function reviewQueryKey(businessId: string | undefined, userId: string | undefined) {
  return ['business-reviews', businessId, userId ?? 'visitor'] as const;
}

export function useBusinessReviews(businessId: string | undefined, user: User | null) {
  return useQuery({
    queryKey: reviewQueryKey(businessId, user?.id),
    enabled: Boolean(businessId),
    queryFn: async () => (
      await businessReviewApi.getProfileData(
        businessId!,
        user ? { id: user.id, name: user.name, role: user.role } : null,
      )
    ).data,
  });
}

export function useSubmitBusinessReview(businessId: string | undefined, user: User | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Pick<SubmitBusinessReviewInput, 'transactionId' | 'rating' | 'comment'>) => {
      if (!businessId || !user) throw new Error('Sign in to review this business.');
      return businessReviewApi.submit({
        ...input,
        businessId,
        user: { id: user.id, name: user.name, role: user.role },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: reviewQueryKey(businessId, user?.id),
    }),
  });
}

