/**
 * API Endpoints
 * Centralized endpoint definitions for easy maintenance
 */

export const endpoints = {
  // Authentication
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    verify2FALogin: '/auth/login/verify-2fa',
    logout: '/auth/logout',
    verifyEmail: '/auth/verify-email',
    resendVerificationOTP: '/auth/resend-verification-otp',
    forgotPassword: '/auth/forgot-password',
    verifyOtp: '/auth/verify-otp',
    resetPassword: '/auth/reset-password',
    profile: '/auth/profile',
    updateProfile: '/auth/profile',
    changePassword: '/auth/change-password',
    loginHistory: '/auth/login-history',
    searchUsers: '/auth/search-users',
    notificationPreferences: '/auth/notification-preferences',
    securitySettings: '/auth/security-settings',
    generate2FA: '/auth/2fa/generate',
    verify2FA: '/auth/2fa/verify',
    disable2FA: '/auth/2fa/disable',
  },
  
  // Businesses
  businesses: {
    list: '/businesses',
    search: '/businesses/search',
    create: '/businesses',
    getOne: (id: string) => `/businesses/${id}`,
    getBySlug: (slug: string) => `/businesses/slug/${slug}`,
    update: (id: string) => `/businesses/${id}`,
    delete: (id: string) => `/businesses/${id}`,
    myBusinesses: '/businesses/my/businesses',
    addMember: (id: string) => `/businesses/${id}/members`,
    addPaymentMethod: (id: string) => `/businesses/${id}/payment-methods`,
    save: (id: string) => `/businesses/${id}/save`,
    unsave: (id: string) => `/businesses/${id}/save`,
    savedBusinesses: '/businesses/saved/all',
    uploadLogo: (id: string) => `/businesses/${id}/upload-logo`,
    
    // Team member management (business-member role)
    getMembers: (id: string) => `/businesses/${id}/team-members`,
    addBusinessMember: (id: string) => `/businesses/${id}/team-members`,
    updateMemberPermissions: (memberId: string) => `/business-members/${memberId}/permissions`,
    removeMember: (memberId: string) => `/business-members/${memberId}`,
    
    // Default business
    setDefaultBusiness: (id: string) => `/businesses/${id}/set-default`,
  },
  
  // Verification
  verification: {
    initializePayment: '/verification/payment/initialize',
    getStatus: (businessId: string) => `/verification/status/${businessId}`,
    getAuditTrail: (businessId: string) => `/verification/audit/${businessId}`,
    requestReVerification: (businessId: string) => `/verification/re-verify/${businessId}`,
    upgradeTier: (businessId: string) => `/verification/upgrade/${businessId}`,
    downgradeTier: (businessId: string) => `/verification/downgrade/${businessId}`,
    getDowngradeRestrictions: (businessId: string) => `/verification/downgrade-restrictions/${businessId}`,
    verifyCode: '/verification/verify-code',
    getRequestStatus: (businessId: string) => `/verification/request/${businessId}`,
    startInstantVerification: (requestId: string) => `/verification/${requestId}/verify`,
    submitManualVerification: (requestId: string) => `/verification/${requestId}/manual`,
    // Admin endpoints
    adminPendingReviews: '/verification/admin/pending-reviews',
    adminApproveRequest: (requestId: string) => `/verification/admin/${requestId}/approve`,
    adminRejectRequest: (requestId: string) => `/verification/admin/${requestId}/reject`,
    adminRunFaceMatch: (requestId: string) => `/verification/admin/${requestId}/face-match`,
    adminApprove: (businessId: string) => `/verification/admin/approve/${businessId}`,
    adminReject: (businessId: string) => `/verification/admin/reject/${businessId}`,
  },
  
  // Transactions
  transactions: {
    create: '/transactions',
    getOne: (id: string) => `/transactions/${id}`,
    getMyTransactions: '/transactions/my',
    getStatistics: '/transactions/statistics',
    verify: (reference: string) => `/transactions/verify/${reference}`,
    updateStatus: '/transactions/webhook/update',
    messages: (id: string) => `/transactions/${id}/messages`,
    sendMessage: (id: string) => `/transactions/${id}/messages`,
  },

  // Deal agreements
  agreements: {
    draft: '/agreements/draft',
  },

  // Deal disputes
  disputes: {
    get: (dealId: string) => `/transactions/${dealId}/dispute`,
    open: (dealId: string) => `/transactions/${dealId}/dispute`,
    message: (dealId: string) => `/transactions/${dealId}/dispute/messages`,
  },

  // Deal negotiations
  negotiations: {
    get: (dealId: string) => `/transactions/${dealId}/negotiation`,
    propose: (dealId: string) => `/transactions/${dealId}/negotiation/propose`,
    respond: (dealId: string, proposalId: string) =>
      `/transactions/${dealId}/negotiation/proposals/${proposalId}`,
    withdraw: (dealId: string) => `/transactions/${dealId}/negotiation/withdraw`,
  },

  // Deal invitations
  invitations: {
    list: '/invitations',
    getOne: (id: string) => `/invitations/${id}`,
    accept: (id: string) => `/invitations/${id}/accept`,
    decline: (id: string) => `/invitations/${id}/decline`,
  },
  
  // Reputation
  reputation: {
    getMine: '/reputation/me',
  },

  // Notifications
  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread/count',
    markAsRead: (id: string) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    delete: (id: string) => `/notifications/${id}`,
    deleteAll: '/notifications',
  },
  
  // Messages
  messages: {
    send: '/messages',
    conversations: '/messages/conversations',
    list: '/messages',
    unreadCount: '/messages/unread-count', // Fixed: matches backend route
    markAsRead: (id: string) => `/messages/${id}/read`,
    markConversationAsRead: (businessId: string) => `/messages/conversations/${businessId}/read`,
    updateMessage: (id: string) => `/messages/${id}`,
    deleteMessage: (id: string) => `/messages/${id}`,
  },
  
  // Reviews
  reviews: {
    create: '/reviews',
    getBusinessReviews: (businessId: string) => `/reviews/business/${businessId}`,
    getMyReviews: '/reviews/my',
    update: (id: string) => `/reviews/${id}`,
    delete: (id: string) => `/reviews/${id}`,
    respond: (id: string) => `/reviews/${id}/respond`,
    toggleVisibility: (id: string) => `/reviews/${id}/visibility`,
  },
  
  // Fraud
  fraud: {
    submitReport: '/fraud/reports',
    getMyReports: '/fraud/reports/my',
    getReport: (id: string) => `/fraud/reports/${id}`,
    getAllReports: '/fraud/reports',
    updateStatus: (id: string) => `/fraud/reports/${id}/status`,
    resolve: (id: string) => `/fraud/reports/${id}/resolve`,
    assign: (id: string) => `/fraud/reports/${id}/assign`,
    deleteReport: (id: string) => `/fraud/reports/${id}`,
    getAnalysis: (businessId: string) => `/fraud/analysis/${businessId}`,
  },
  
  // Analytics
  analytics: {
    trackView: (businessId: string) => `/analytics/businesses/${businessId}/track/view`,
    trackEvent: '/analytics/track/event',
    trackSearch: '/analytics/track/search',
    getBusinessAnalytics: (businessId: string) => `/analytics/business/${businessId}`,
    getProfileViews: (businessId: string) => `/analytics/business/${businessId}/views`,
    getSearchAnalytics: '/analytics/search',
  },
  
  // File Upload
  upload: {
    businessLogo: '/upload/business-logo',
    verificationDocument: '/upload/verification-document',
    businessDocument: '/upload/business-document',
    profilePhoto: '/upload/profile-photo',
    messageAttachment: '/upload/message-attachment',
    getAuthParams: '/upload/auth-params',
  },

  // Reported Handles
  reportedHandles: {
    report: '/reported-handles',
    list: (businessId: string) => `/reported-handles/${businessId}`,
    stats: (businessId: string) => `/reported-handles/${businessId}/stats`,
    delete: (id: string) => `/reported-handles/${id}`,
  },

  // Statistics
  statistics: {
    platform: '/statistics',
    customer: '/statistics/customer',
    business: (businessId: string) => `/statistics/business/${businessId}`,
  },

  // User Statistics
  userStatistics: {
    me: '/user-statistics/me',
    byUserId: (userId: string) => `/user-statistics/${userId}`,
  },

  // App
  app: {
    version: '/app/version',
  },
  
  // AI Features
  ai: {
    getTrustScore: (businessId: string) => `/ai/trust-score/${businessId}`,
    getBusinessInsights: (businessId: string) => `/ai/insights/${businessId}`,
    getSavedInsights: (businessId: string) => `/ai/insights/${businessId}/saved`,
    summarizeReviews: (businessId: string) => `/ai/reviews/summarize/${businessId}`,
    matchBusinesses: '/ai/match',
    detectFraud: '/ai/fraud-detection',
  },
  
  // Tier Configuration (Admin)
  tierConfig: {
    getAll: '/tier-config',
    getOne: (tierId: string) => `/tier-config/${tierId}`,
    update: (tierId: string) => `/tier-config/${tierId}`,
    getStats: '/tier-config/stats/overview',
  },
  
  // Discount Codes
  discountCodes: {
    validate: '/discount-codes/validate',
    generateCode: '/discount-codes/generate-code',
    list: '/discount-codes',
    create: '/discount-codes',
    getOne: (id: string) => `/discount-codes/${id}`,
    update: (id: string) => `/discount-codes/${id}`,
    deactivate: (id: string) => `/discount-codes/${id}`,
  },

  // Subscription Renewal
  subscriptionRenewal: {
    getDetails: (businessId: string) => `/subscription-renewal/${businessId}`,
    initialize: '/subscription-renewal/initialize',
    verify: '/subscription-renewal/verify',
    toggleAutoRenew: '/subscription-renewal/toggle-auto-renew',
  },

  // Digital Prints
  digitalPrints: {
    create: '/digital-prints',
    list: '/digital-prints',
    getOne: (id: string) => `/digital-prints/${id}`,
    update: (id: string) => `/digital-prints/${id}`,
    remove: (id: string) => `/digital-prints/${id}`,
    report: (id: string) => `/digital-prints/${id}/report`,
    regenerateToken: (id: string) => `/digital-prints/${id}/regenerate-token`,
    shared: (shareToken: string) => `/digital-prints/shared/${shareToken}`,
    addEntry: (printId: string) => `/digital-prints/${printId}/entries`,
    updateEntry: (printId: string, entryId: string) => `/digital-prints/${printId}/entries/${entryId}`,
    deleteEntry: (printId: string, entryId: string) => `/digital-prints/${printId}/entries/${entryId}`,
    reorderEntries: (printId: string) => `/digital-prints/${printId}/entries/reorder`,
  },

  // Support
  support: {
    create: '/support/requests',
    getAll: '/support/requests',
    getMy: '/support/requests/my',
    getOne: (id: string) => `/support/requests/${id}`,
    update: (id: string) => `/support/requests/${id}`,
    getBusinessRequests: (businessId: string) => `/support/business/${businessId}`,
    reply: (id: string) => `/support/requests/${id}/reply`,
    markAsRead: (id: string) => `/support/requests/${id}/read`,
    unreadCount: '/support/unread-count',
    statistics: '/support/statistics',
  },
};