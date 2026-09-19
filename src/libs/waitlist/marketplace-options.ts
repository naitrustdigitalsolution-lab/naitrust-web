import type { WaitlistUserType } from '../../types/global';

type WaitlistAudience = 'buyer' | 'supplier' | 'agent' | 'logistics';

export interface WaitlistRoleOption {
  value: WaitlistUserType;
  label: string;
  detail: string;
  audiences: WaitlistAudience[];
}

export interface WaitlistInterestOption {
  value: string;
  label: string;
  audiences: Array<WaitlistAudience | 'all'>;
}

export const WAITLIST_ROLE_OPTIONS: WaitlistRoleOption[] = [
  { value: 'individual_customer', label: 'Individual buyer', detail: 'I want clearer terms and payment protection for purchases or services.', audiences: ['buyer'] },
  { value: 'marketplace_social_seller', label: 'Seller or merchant', detail: 'I sell goods and want confirmed funding and clear release conditions.', audiences: ['supplier'] },
  { value: 'business_buyer', label: 'Business', detail: 'I manage vendor payments, customer collections or deposits.', audiences: ['buyer', 'supplier'] },
  { value: 'contractor_service_provider', label: 'Freelancer or service provider', detail: 'I want agreed deliverables and a documented payment process.', audiences: ['supplier'] },
  { value: 'buyer_and_seller', label: 'Both buyer and seller', detail: 'I want to protect payments on both sides of a deal.', audiences: ['buyer', 'supplier'] },
  { value: 'partner', label: 'Payment or technology partner', detail: 'I want to discuss supporting protected payment infrastructure.', audiences: ['agent', 'logistics'] },
  { value: 'other', label: 'Something else', detail: 'Tell us how you would use Naitrust.', audiences: ['buyer', 'supplier', 'agent', 'logistics'] },
];

export const WAITLIST_INTEREST_OPTIONS: WaitlistInterestOption[] = [
  { value: 'protected-purchases', label: 'Protect payments for purchases and deposits', audiences: ['buyer'] },
  { value: 'customer-payments', label: 'Receive customer payments with clear release terms', audiences: ['supplier'] },
  { value: 'service-payments', label: 'Agree and document payments for services', audiences: ['all'] },
  { value: 'deal-records', label: 'Keep agreements, evidence and approvals together', audiences: ['all'] },
  { value: 'payment-partnership', label: 'Explore payment or technology partnerships', audiences: ['agent', 'logistics'] },
];

export function interestsForWaitlistRoles(userTypes: WaitlistUserType[]): WaitlistInterestOption[] {
  if (userTypes.length === 0) return WAITLIST_INTEREST_OPTIONS;
  const selectedAudiences = new Set(
    WAITLIST_ROLE_OPTIONS
      .filter((option) => userTypes.includes(option.value))
      .flatMap((option) => option.audiences),
  );
  return WAITLIST_INTEREST_OPTIONS.filter((option) =>
    option.audiences.includes('all') || option.audiences.some((audience) => selectedAudiences.has(audience as WaitlistAudience)),
  );
}
