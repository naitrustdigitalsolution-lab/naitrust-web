import type { User } from '../store/types';

export type BusinessReviewTransactionKind = 'instant_transfer' | 'protected_deal';

export interface CompletedCustomerBusinessTransaction {
  id: string;
  userId: string;
  businessId: string;
  reference: string;
  title: string;
  kind: BusinessReviewTransactionKind;
  status: 'completed';
  completedAt: string;
}

export interface BusinessTransactionReview {
  id: string;
  businessId: string;
  transactionId: string;
  reviewerUserId?: string;
  reviewerName: string;
  rating: number;
  tags: string[];
  comment?: string;
  status: 'published';
  transactionCompleted: true;
  transactionKind?: BusinessReviewTransactionKind;
  createdAt: string;
}

export interface BusinessReviewProfileData {
  reviews: BusinessTransactionReview[];
  eligibleTransactions: CompletedCustomerBusinessTransaction[];
}

export interface SubmitBusinessReviewInput {
  businessId: string;
  transactionId: string;
  rating: number;
  comment?: string;
  user: Pick<User, 'id' | 'name' | 'role'>;
}

