/**
 * Mock API contract and seed-data registry.
 *
 * This is the frontend's hand-off point for the backend implementation. Route
 * paths come from the same endpoint object used by the HTTP clients, while the
 * fixtures model database-style primary and foreign keys.
 */
import { endpoints } from '../../libs/api/endpoints';
import authUsers from './auth-users.json';
import businesses from './businesses.json';
import dealDrafts from './deal-drafts.json';
import invitations from './invitations.json';
import notifications from './notifications.json';
import reputation from './reputation.json';
import transactions from './transactions.json';

/** VITE_API_BASE_URL is the origin; the frontend appends this API prefix. */
export const MOCK_API_PREFIX = '/api' as const;

/** Every API URL/path the frontend currently expects. */
export const mockApiEndpoints = endpoints;

/** Every mock response/seed currently used by the frontend. */
export const mockApiFixtures = {
  authUsers,
  businesses,
  dealDrafts,
  invitations,
  notifications,
  reputation,
  transactions,
} as const;

export const mockApi = {
  prefix: MOCK_API_PREFIX,
  endpoints: mockApiEndpoints,
  fixtures: mockApiFixtures,
} as const;

export {
  authUsers as mockAuthUsers,
  businesses as mockBusinesses,
  dealDrafts as mockDealDrafts,
  invitations as mockInvitations,
  notifications as mockNotifications,
  reputation as mockReputation,
  transactions as mockTransactions,
};

/**
 * Reports dangling foreign keys without crashing the app. Useful in tests and
 * before handing fixture changes to the backend team.
 */
export function validateMockForeignKeys(): string[] {
  const issues: string[] = [];
  const userIds = new Set(authUsers.users.map(({ user }) => user.id));
  const businessIds = new Set(businesses.data.map(({ id }) => id));
  const transactionIds = new Set(transactions.data.map(({ id }) => id));
  const invitationIds = new Set(invitations.data.map(({ id }) => id));

  businesses.data.forEach((business) => {
    if (!userIds.has(business.ownerUserId)) {
      issues.push(`businesses.${business.id}.ownerUserId -> ${business.ownerUserId}`);
    }
  });
  dealDrafts.forEach((draft) => {
    if (!userIds.has(draft.ownerUserId)) {
      issues.push(`dealDrafts.${draft.id}.ownerUserId -> ${draft.ownerUserId}`);
    }
  });
  transactions.data.forEach((transaction) => {
    if (!userIds.has(transaction.createdByUserId)) {
      issues.push(`transactions.${transaction.id}.createdByUserId -> ${transaction.createdByUserId}`);
    }
    if (!businessIds.has(transaction.businessId)) {
      issues.push(`transactions.${transaction.id}.businessId -> ${transaction.businessId}`);
    }
  });
  invitations.data.forEach((invitation) => {
    if (!userIds.has(invitation.recipientUserId)) {
      issues.push(`invitations.${invitation.id}.recipientUserId -> ${invitation.recipientUserId}`);
    }
  });
  notifications.data.forEach((notification) => {
    if (!userIds.has(notification.userId)) {
      issues.push(`notifications.${notification.id}.userId -> ${notification.userId}`);
    }
    const transactionId = notification.transactionId;
    if (typeof transactionId === 'string' && !transactionIds.has(transactionId)) {
      issues.push(`notifications.${notification.id}.transactionId -> ${transactionId}`);
    }
    const invitationId = notification.invitationId;
    if (typeof invitationId === 'string' && !invitationIds.has(invitationId)) {
      issues.push(`notifications.${notification.id}.invitationId -> ${invitationId}`);
    }
  });
  if (!userIds.has(reputation.data.userId)) {
    issues.push(`reputation.userId -> ${reputation.data.userId}`);
  }
  if (!businessIds.has(reputation.data.businessId)) {
    issues.push(`reputation.businessId -> ${reputation.data.businessId}`);
  }

  return issues;
}

export default mockApi;
