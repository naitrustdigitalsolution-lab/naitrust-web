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
  { value: 'business_buyer', label: 'Buyer or importer', detail: 'I want to source products, stock, equipment or packaging from China.', audiences: ['buyer'] },
  { value: 'sourcing_inspection_agent', label: 'China sourcing agent', detail: 'I operate in China and provide sourcing, supplier visits or inspections.', audiences: ['agent'] },
  { value: 'china_supplier', label: 'China supplier or manufacturer', detail: 'I want to receive clear requirements and quote Nigerian buyers.', audiences: ['supplier'] },
  { value: 'logistics_provider', label: 'China–Nigeria logistics partner', detail: 'I provide pickup, consolidation, freight, customs or delivery services.', audiences: ['logistics'] },
  { value: 'other', label: 'Something else', detail: 'My role does not fit the options above.', audiences: ['buyer', 'supplier', 'agent', 'logistics'] },
];

export const WAITLIST_INTEREST_OPTIONS: WaitlistInterestOption[] = [
  { value: 'china-products', label: 'Find wholesale products and suppliers in China', audiences: ['buyer'] },
  { value: 'custom-production', label: 'Custom production, packaging or branding', audiences: ['buyer'] },
  { value: 'landed-quotes', label: 'A confirmed landed-cost quote', audiences: ['buyer'] },
  { value: 'sourcing-agents', label: 'Sourcing or inspection help in China', audiences: ['buyer'] },
  { value: 'consolidated-shipping', label: 'Consolidation and delivery to Nigeria', audiences: ['buyer'] },
  { value: 'supplier-enquiries', label: 'Receive product enquiries and submit quotes', audiences: ['supplier'] },
  { value: 'supplier-showcase', label: 'Present products and manufacturing capabilities', audiences: ['supplier'] },
  { value: 'agent-assignments', label: 'Receive sourcing, visit or inspection assignments', audiences: ['agent'] },
  { value: 'shipping-quotes', label: 'Receive China-to-Nigeria shipment requests', audiences: ['logistics'] },
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
