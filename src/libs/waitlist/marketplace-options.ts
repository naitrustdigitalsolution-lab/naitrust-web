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
  { value: 'individual_customer', label: 'Individual buyer', detail: 'Buying wholesale or custom products.', audiences: ['buyer'] },
  { value: 'business_buyer', label: 'Business buyer or importer', detail: 'Sourcing stock, equipment or packaging.', audiences: ['buyer'] },
  { value: 'buyer_and_seller', label: 'I want to buy and sell', detail: 'Source products and sell through a showcase.', audiences: ['buyer', 'supplier'] },
  { value: 'nigeria_supplier', label: 'Nigeria supplier', detail: 'Manufacturer, wholesaler or distributor.', audiences: ['supplier'] },
  { value: 'china_supplier', label: 'China supplier', detail: 'Manufacturer or export supplier in China.', audiences: ['supplier'] },
  { value: 'marketplace_social_seller', label: 'Online or social seller', detail: 'Reselling products to local customers.', audiences: ['buyer', 'supplier'] },
  { value: 'sourcing_inspection_agent', label: 'Sourcing or inspection agent', detail: 'A verified professional or company operating in China.', audiences: ['agent'] },
  { value: 'logistics_provider', label: 'Logistics provider', detail: 'Freight, consolidation, customs or delivery.', audiences: ['logistics'] },
  { value: 'packaging_service_partner', label: 'Packaging or customization partner', detail: 'Branding, labels, cartons or production support.', audiences: ['supplier'] },
  { value: 'other', label: 'Another marketplace role', detail: 'Tell us more before submitting.', audiences: ['buyer', 'supplier', 'agent', 'logistics'] },
];

export const WAITLIST_INTEREST_OPTIONS: WaitlistInterestOption[] = [
  { value: 'china-products', label: 'Find wholesale products and suppliers in China', audiences: ['buyer'] },
  { value: 'nigeria-products', label: 'Buy wholesale products within Nigeria', audiences: ['buyer'] },
  { value: 'custom-production', label: 'Request custom production, packaging or branding', audiences: ['buyer'] },
  { value: 'landed-quotes', label: 'Receive a confirmed landed-cost quote', audiences: ['buyer'] },
  { value: 'sourcing-agents', label: 'Hire sourcing or inspection support in China', audiences: ['buyer'] },
  { value: 'consolidated-shipping', label: 'Combine ready orders and arrange delivery', audiences: ['buyer'] },
  { value: 'supplier-showcase', label: 'Publish a supplier showcase and catalogue', audiences: ['supplier'] },
  { value: 'supplier-enquiries', label: 'Receive wholesale enquiries and quote requests', audiences: ['supplier'] },
  { value: 'agent-network', label: 'Join the vetted sourcing and inspection network', audiences: ['agent'] },
  { value: 'agent-assignments', label: 'Receive paid sourcing, visit or inspection assignments', audiences: ['agent'] },
  { value: 'logistics-network', label: 'List freight, consolidation or delivery services', audiences: ['logistics'] },
  { value: 'shipping-quotes', label: 'Receive managed shipment quote requests', audiences: ['logistics'] },
  { value: 'updates', label: 'Follow the Naitrust marketplace launch', audiences: ['all'] },
  { value: 'other', label: 'Something else', audiences: ['all'] },
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
