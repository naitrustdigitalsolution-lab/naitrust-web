export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'business' | 'admin';
  kycLevel: number;
  kycVerified?: boolean;
  avatar?: string;
  accountDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  savedBusinesses?: string[]; // Array of business IDs
}

export interface PaymentMethod {
  type: 'link' | 'account' | 'card';
  provider?: 'paystack' | 'flutterwave' | 'skrill';
  value: string;
  label?: string;
  accountName?: string; // Account name for bank accounts
}

export interface SocialHandle {
  platform: 'instagram' | 'twitter' | 'tiktok' | 'whatsapp' | 'facebook' | 'email' | 'phone' | 'telegram' | 'linkedin' | 'youtube' | 'snapchat' | 'pinterest' | 'reddit' | 'tumblr' | 'vimeo' | 'github' | 'others';
  handle: string;
  url?: string;
  verified?: boolean;
}

export type AppMode = 'mock' | 'dev' | 'prod';

export type PagePhase = 'app' | 'coming-soon' | 'be-back';

export type WaitlistUserType =
  | 'individual_customer'
  | 'business_buyer'
  | 'supplier_vendor'
  | 'contractor_service_provider'
  | 'marketplace_social_seller'
  | 'partner';

export type TransactionRange =
  | 'below_100k'
  | '100k_500k'
  | '500k_5m'
  | '5m_50m'
  | 'above_50m';

export interface WaitlistPayload {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  userType: WaitlistUserType | '';
  transactionRange: TransactionRange | '';
  transactionNeed: string;
  expectations?: string;
  consent: boolean;
  source: string;
  submittedAt: string;
}

export interface WaitlistResponse {
  message: string;
  mode: AppMode;
}
