import reviewFixture from '../../mocks/apis/transaction-reviews.json';
import transactionFixture from '../../mocks/apis/customer-business-transactions.json';
import type { ApiSuccess } from '../api/types';
import type {
  BusinessReviewProfileData,
  BusinessTransactionReview,
  CompletedCustomerBusinessTransaction,
  SubmitBusinessReviewInput,
} from './types';

const REVIEW_STORAGE_KEY = 'naitrust-business-transaction-reviews-v1';
const MOCK_LATENCY_MS = 200;

const fixtureReviews = (reviewFixture as ApiSuccess<BusinessTransactionReview[]>).data;
const completedTransactions = (
  transactionFixture as ApiSuccess<CompletedCustomerBusinessTransaction[]>
).data;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readSubmittedReviews(): BusinessTransactionReview[] {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(REVIEW_STORAGE_KEY);
    return value ? (JSON.parse(value) as BusinessTransactionReview[]) : [];
  } catch {
    return [];
  }
}

function saveSubmittedReviews(reviews: BusinessTransactionReview[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
}

function publicReviewerName(name: string): string {
  const [firstName = 'Verified', lastName] = name.trim().split(/\s+/);
  return lastName ? `${firstName} ${lastName.charAt(0).toUpperCase()}.` : firstName;
}

function reviewableTransactions(
  businessId: string,
  user: SubmitBusinessReviewInput['user'] | null,
  reviews: BusinessTransactionReview[],
): CompletedCustomerBusinessTransaction[] {
  if (!user || user.role !== 'customer') return [];

  const reviewedTransactionIds = new Set(
    reviews
      .filter((review) => review.reviewerUserId === user.id)
      .map((review) => review.transactionId),
  );

  return completedTransactions.filter(
    (transaction) =>
      transaction.userId === user.id &&
      transaction.businessId === businessId &&
      transaction.status === 'completed' &&
      !reviewedTransactionIds.has(transaction.id),
  );
}

export const businessReviewApi = {
  getProfileData: async (
    businessId: string,
    user: SubmitBusinessReviewInput['user'] | null,
  ): Promise<ApiSuccess<BusinessReviewProfileData>> => {
    await delay(MOCK_LATENCY_MS);
    const submitted = readSubmittedReviews();
    const reviews = [...submitted, ...fixtureReviews]
      .filter(
        (review) =>
          review.businessId === businessId &&
          review.status === 'published' &&
          review.transactionCompleted,
      )
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

    return {
      success: true,
      data: {
        reviews,
        eligibleTransactions: reviewableTransactions(businessId, user, reviews),
      },
    };
  },

  submit: async (
    input: SubmitBusinessReviewInput,
  ): Promise<ApiSuccess<BusinessTransactionReview>> => {
    await delay(MOCK_LATENCY_MS);

    if (input.user.role !== 'customer') {
      throw new Error('Only personal customers can review a business.');
    }
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new Error('Choose a rating from 1 to 5 stars.');
    }

    const comment = input.comment?.trim();
    if (comment && comment.length > 500) {
      throw new Error('Keep your review within 500 characters.');
    }

    const submitted = readSubmittedReviews();
    const allReviews = [...submitted, ...fixtureReviews];
    const transaction = reviewableTransactions(input.businessId, input.user, allReviews)
      .find((candidate) => candidate.id === input.transactionId);

    if (!transaction) {
      throw new Error('This completed transaction is not eligible for another review.');
    }

    const review: BusinessTransactionReview = {
      id: `review_${crypto.randomUUID()}`,
      businessId: input.businessId,
      transactionId: transaction.id,
      reviewerUserId: input.user.id,
      reviewerName: publicReviewerName(input.user.name),
      rating: input.rating,
      tags: [],
      comment,
      status: 'published',
      transactionCompleted: true,
      transactionKind: transaction.kind,
      createdAt: new Date().toISOString(),
    };

    saveSubmittedReviews([review, ...submitted]);
    return { success: true, data: review, message: 'Your review is now public.' };
  },
};

