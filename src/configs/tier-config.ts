/**
 * Business Tier Configuration (Frontend)
 * This is a mirror of the backend tier configuration for frontend use
 * In production, this should be fetched from the backend API
 */

export interface TierFeature {
  id: string;
  name: string;
  description: string;
  category: 'visibility' | 'verification' | 'business_management' | 'analytics' | 'support' | 'monetization' | 'security';
}

export interface BusinessTier {
  id: 'unverified' | 'basic' | 'cac' | 'premium';
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
    trialMonths: number;
  };
  features: string[];
  limitations: {
    maxBusinesses: number;
    requiresVerification: boolean;
    allowsMultiBusiness: boolean;
    requiresActivePremiumForMultiBusiness: boolean;
  };
  badges: {
    label: string;
    color: string;
    icon?: string;
  };
  sortOrder: number;
}

export const TIER_FEATURES: Record<string, TierFeature> = {
  'basic_listing': {
    id: 'basic_listing',
    name: 'Basic Business Listing',
    description: 'Create and display your business profile on Naitrust',
    category: 'visibility',
  },
  'search_visibility': {
    id: 'search_visibility',
    name: 'Search Visibility',
    description: 'Your business appears in search results',
    category: 'visibility',
  },
  'verified_badge': {
    id: 'verified_badge',
    name: 'Verified Badge',
    description: 'Display CAC verified badge on your profile',
    category: 'verification',
  },
  'premium_badge': {
    id: 'premium_badge',
    name: 'Premium Badge',
    description: 'Display premium verified badge with enhanced visibility',
    category: 'verification',
  },
  'enhanced_search_ranking': {
    id: 'enhanced_search_ranking',
    name: 'Enhanced Search Ranking',
    description: 'Priority placement in search results',
    category: 'visibility',
  },
  'featured_listing': {
    id: 'featured_listing',
    name: 'Featured Listing',
    description: 'Featured placement in search and category pages',
    category: 'visibility',
  },
  'single_business': {
    id: 'single_business',
    name: 'Single Business Management',
    description: 'Manage one business profile',
    category: 'business_management',
  },
  'multi_business': {
    id: 'multi_business',
    name: 'Multiple Business Management',
    description: 'Create and manage multiple business profiles',
    category: 'business_management',
  },
  'team_members': {
    id: 'team_members',
    name: 'Team Members',
    description: 'Add team members to your business',
    category: 'business_management',
  },
  'unlimited_team_members': {
    id: 'unlimited_team_members',
    name: 'Unlimited Team Members',
    description: 'Add unlimited team members with role-based permissions',
    category: 'business_management',
  },
  'business_documents': {
    id: 'business_documents',
    name: 'Business Documents',
    description: 'Upload and display business documents',
    category: 'business_management',
  },
  'custom_profile_page': {
    id: 'custom_profile_page',
    name: 'Custom Profile Page',
    description: 'Customize your business profile page',
    category: 'business_management',
  },
  'basic_analytics': {
    id: 'basic_analytics',
    name: 'Basic Analytics',
    description: 'View basic business performance metrics',
    category: 'analytics',
  },
  'advanced_analytics': {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed analytics with insights and recommendations',
    category: 'analytics',
  },
  'ai_insights': {
    id: 'ai_insights',
    name: 'AI Business Insights',
    description: 'AI-powered business insights and recommendations',
    category: 'analytics',
  },
  'export_reports': {
    id: 'export_reports',
    name: 'Export Reports',
    description: 'Export analytics data as PDF, CSV, or images',
    category: 'analytics',
  },
  'email_support': {
    id: 'email_support',
    name: 'Email Support',
    description: 'Access to email customer support',
    category: 'support',
  },
  'priority_support': {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Priority customer support with faster response times',
    category: 'support',
  },
  'dedicated_account_manager': {
    id: 'dedicated_account_manager',
    name: 'Dedicated Account Manager',
    description: 'Personal account manager for your business',
    category: 'support',
  },
  'payment_methods': {
    id: 'payment_methods',
    name: 'Payment Methods',
    description: 'Add payment methods to receive payments',
    category: 'monetization',
  },
  'multiple_payment_methods': {
    id: 'multiple_payment_methods',
    name: 'Multiple Payment Methods',
    description: 'Add multiple payment methods (bank accounts, payment links)',
    category: 'monetization',
  },
  'saved_customers': {
    id: 'saved_customers',
    name: 'Saved Customers List',
    description: 'View list of customers who saved your business (basic CRM)',
    category: 'monetization',
  },
  'customer_messaging': {
    id: 'customer_messaging',
    name: 'Customer Messaging',
    description: 'Send and receive messages with customers',
    category: 'monetization',
  },
  'api_access': {
    id: 'api_access',
    name: 'API Access',
    description: 'Access to Naitrust API for integrations',
    category: 'monetization',
  },
  'fraud_protection': {
    id: 'fraud_protection',
    name: 'Fraud Protection Guarantee',
    description: 'Protection against fraudulent activities',
    category: 'security',
  },
  'two_factor_auth': {
    id: 'two_factor_auth',
    name: 'Two-Factor Authentication',
    description: 'Enhanced security with 2FA',
    category: 'security',
  },
};

export const BUSINESS_TIERS: Record<string, BusinessTier> = {
  unverified: {
    id: 'unverified',
    name: 'Unverified',
    description: 'Free business registration with limited visibility and features',
    price: {
      monthly: 0,
      yearly: 0,
      currency: 'NGN',
      trialMonths: 0,
    },
    features: [
      'basic_listing',
      'search_visibility',
      'single_business',
      'customer_messaging',
      'basic_analytics',
      'email_support',
    ],
    limitations: {
      maxBusinesses: 1,
      requiresVerification: false,
      allowsMultiBusiness: false,
      requiresActivePremiumForMultiBusiness: false,
    },
    badges: {
      label: 'Unverified',
      color: 'gray',
    },
    sortOrder: 1,
  },
  cac: {
    id: 'cac',
    name: 'Naitrust Verified',
    description: 'CAC verification with trust badge and improved credibility. Limited to ONE business.',
    price: {
      monthly: 2499, // ₦2,499/month (VAT included)
      yearly: 19999, // ₦19,999/year (VAT included)
      currency: 'NGN',
      trialMonths: 0,
    },
    features: [
      'basic_listing',
      'search_visibility',
      'verified_badge',
      'single_business',
      'team_members',
      'business_documents',
      'customer_messaging',
      'payment_methods',
      'multiple_payment_methods',
      'basic_analytics',
      'email_support',
      'two_factor_auth',
    ],
    limitations: {
      maxBusinesses: 1,
      requiresVerification: true,
      allowsMultiBusiness: false,
      requiresActivePremiumForMultiBusiness: false,
    },
    badges: {
      label: 'CAC Verified',
      color: 'primary',
    },
    sortOrder: 2,
  },
  basic: {
    id: 'basic',
    name: 'Naitrust Verified',
    description: 'CAC verification with trust badge and improved credibility. Limited to ONE business.',
    price: {
      monthly: 2499, // ₦2,499/month (VAT included)
      yearly: 19999, // ₦19,999/year (VAT included)
      currency: 'NGN',
      trialMonths: 0,
    },
    features: [
      'basic_listing',
      'search_visibility',
      'verified_badge',
      'single_business',
      'team_members',
      'business_documents',
      'customer_messaging',
      'payment_methods',
      'multiple_payment_methods',
      'basic_analytics',
      'email_support',
      'two_factor_auth',
    ],
    limitations: {
      maxBusinesses: 1,
      requiresVerification: true,
      allowsMultiBusiness: false,
      requiresActivePremiumForMultiBusiness: false,
    },
    badges: {
      label: 'Naitrust Verified',
      color: 'primary',
    },
    sortOrder: 2,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Unlock multi-business management, advanced features, and growth tools. Only an ACTIVE Premium business enables multi-business capability.',
    price: {
      monthly: 7999, // ₦7,999/month (VAT included)
      yearly: 69999, // ₦69,999/year (VAT included)
      currency: 'NGN',
      trialMonths: 0,
    },
    features: [
      'basic_listing',
      'search_visibility',
      'verified_badge',
      'premium_badge',
      'enhanced_search_ranking',
      'featured_listing',
      'multi_business',
      'team_members',
      'unlimited_team_members',
      'business_documents',
      'custom_profile_page',
      'customer_messaging',
      'payment_methods',
      'multiple_payment_methods',
      'basic_analytics',
      'advanced_analytics',
      'ai_insights',
      'export_reports',
      'saved_customers',
      'email_support',
      'priority_support',
      'api_access',
      'fraud_protection',
      'two_factor_auth',
      'dedicated_account_manager',
    ],
    limitations: {
      maxBusinesses: -1,
      requiresVerification: true,
      allowsMultiBusiness: true,
      requiresActivePremiumForMultiBusiness: true,
    },
    badges: {
      label: 'Premium Verified',
      color: 'yellow',
    },
    sortOrder: 3,
  },
};

export function getTierConfig(tierId: 'unverified' | 'basic' | 'cac' | 'premium'): BusinessTier {
  return BUSINESS_TIERS[tierId];
}

export function getTierFeatures(tierId: 'unverified' | 'basic' | 'cac' | 'premium'): TierFeature[] {
  const tier = BUSINESS_TIERS[tierId];
  return tier?.features?.map(featureId => TIER_FEATURES[featureId]).filter(Boolean) ?? [];
}

export function tierHasFeature(tierId: 'unverified' | 'basic' | 'cac' | 'premium', featureId: string): boolean {
  // Backward compatibility: map 'basic' to 'cac'
  const mappedTierId = tierId === 'basic' ? 'cac' : tierId;
  const tier = BUSINESS_TIERS[mappedTierId];
  return tier?.features?.includes(featureId) ?? false;
}

export function getYearlySavings(tierId: 'unverified' | 'basic' | 'cac' | 'premium'): number {
  // Backward compatibility: map 'basic' to 'cac'
  const mappedTierId = tierId === 'basic' ? 'cac' : tierId;
  const tier = BUSINESS_TIERS[mappedTierId];
  if (!tier) return 0;
  const monthlyTotal = tier.price.monthly * 12;
  return monthlyTotal - tier.price.yearly;
}

