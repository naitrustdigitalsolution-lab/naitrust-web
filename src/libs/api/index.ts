/**
 * API Index
 * Central export for all API modules
 */

// Configuration
export * from './config';
export * from './client';
export * from './endpoints';

// API Modules
export * from './auth.api';
export * from './general.api';
export * from './business.api';
export * from './home.api';
export * from './transactions.api';
export * from './reputation.api';
export * from './invitations.api';
export * from './agreements.api';
export * from './notifications.api';
export * from './deal-detail.api';
export * from './deal-messages.api';
export * from './security.api';
export * from './negotiation.api';
export * from './dispute.api';

// Main API object for convenience
import { authApi } from './auth.api';
import { generalApi } from './general.api';
import { transactionsApi } from './transactions.api';
import { reputationApi } from './reputation.api';
import { invitationsApi } from './invitations.api';
import { agreementsApi } from './agreements.api';
import { notificationsApi } from './notifications.api';
import { dealDetailApi } from './deal-detail.api';
import { dealMessagesApi } from './deal-messages.api';

export const api = {
  auth: authApi,
  general: generalApi,
  transactions: transactionsApi,
  reputation: reputationApi,
  invitations: invitationsApi,
  agreements: agreementsApi,
  notifications: notificationsApi,
  dealDetail: dealDetailApi,
  dealMessages: dealMessagesApi
};

export default api;
