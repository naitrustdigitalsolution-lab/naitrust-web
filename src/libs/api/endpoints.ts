/**
 * Naitrust API contract used by the current safe-deal application.
 *
 * Paths are relative to API_CONFIG.BASE_URL (`VITE_API_BASE_URL` + `/api`).
 * Keep this file aligned with the remote .NET controllers: API clients and
 * the mock/backend hand-off registry both consume this same object.
 */
export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    verify2FALogin: '/auth/login/verify-2fa',
    logout: '/auth/logout',
    profile: '/auth/profile',
    updateProfile: '/auth/profile',
    verifyEmail: '/auth/verify-email',
    resendVerificationOTP: '/auth/resend-verification-otp',
    forgotPassword: '/auth/forgot-password',
    verifyOtp: '/auth/verify-otp',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
  },

  security: {
    sendEmailOtp: '/security/email/send-otp',
    verifyEmail: '/security/email/verify',
    sendPhoneOtp: '/security/phone/send-otp',
    verifyPhone: '/security/phone/verify',
    start2FA: '/security/2fa/start',
    verify2FA: '/security/2fa/verify',
    submitKyc: '/security/kyc',
    setPin: '/security/pin/set',
    verifyPin: '/security/pin/verify',
  },

  businesses: {
    create: '/businesses',
    update: (id: string) => `/businesses/${id}`,
    myBusinesses: '/businesses/my/businesses',
  },

  transactions: {
    create: '/transactions',
    getOne: (id: string) => `/transactions/${id}`,
    getMyTransactions: '/transactions/my',
    messages: (id: string) => `/transactions/${id}/messages`,
    sendMessage: (id: string) => `/transactions/${id}/messages`,
    tracking: (id: string) => `/transactions/${id}/tracking`,
    advanceTracking: (id: string) => `/transactions/${id}/tracking/advance`,
    revertTracking: (id: string) => `/transactions/${id}/tracking/revert`,
    termination: (id: string) => `/transactions/${id}/termination`,
    respondToTermination: (id: string) => `/transactions/${id}/termination/respond`,
  },

  agreements: {
    draft: '/agreements/draft',
  },

  disputes: {
    get: (dealId: string) => `/transactions/${dealId}/dispute`,
    open: (dealId: string) => `/transactions/${dealId}/dispute`,
    message: (dealId: string) => `/transactions/${dealId}/dispute/messages`,
  },

  negotiations: {
    get: (dealId: string) => `/transactions/${dealId}/negotiation`,
    propose: (dealId: string) => `/transactions/${dealId}/negotiation/propose`,
    respond: (dealId: string, proposalId: string) =>
      `/transactions/${dealId}/negotiation/proposals/${proposalId}`,
    withdraw: (dealId: string) => `/transactions/${dealId}/negotiation/withdraw`,
  },

  invitations: {
    list: '/invitations',
    getOne: (id: string) => `/invitations/${id}`,
    accept: (id: string) => `/invitations/${id}/accept`,
    decline: (id: string) => `/invitations/${id}/decline`,
  },

  notifications: {
    list: '/notifications',
    markAsRead: (id: string) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
  },

  reputation: {
    getMine: '/reputation/me',
  },

  upload: {
    verificationDocument: '/upload/verification-document',
  },
} as const;

export type ApiEndpoints = typeof endpoints;
