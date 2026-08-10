import type { UseCase } from '../use-cases';

const QUICK_USE_CASE_SLUGS = [
  'high-value-personal-purchases',
  'supplier-purchase',
  'wholesale-order',
  'service-delivery',
  'contractor-engagement',
  'vehicle-transactions',
  'property-agent-payments',
  'custom-business-deal',
] as const;

const SHORT_LABELS: Record<string, string> = {
  'supplier-purchase': 'Stock from a supplier',
  'wholesale-order': 'Bulk or wholesale order',
  'service-delivery': 'Service or repair',
  'contractor-engagement': 'Contractor or project',
  'equipment-purchase': 'Buy equipment',
  'custom-business-deal': 'Something else',
  'property-agent-payments': 'Property payment',
  'developer-instalments': 'Property instalments',
  'land-transactions': 'Land transaction',
  'agent-led-property': 'Agent-led property',
  'contractor-projects': 'Construction work',
  'diaspora-purchases': 'Diaspora purchase',
  'vehicle-transactions': 'Car or other vehicle',
  'high-value-personal-purchases': 'Product purchase',
  'logistics-agreement': 'Delivery or haulage',
  'manufacturing-order': 'Manufacturing order',
  'import-export': 'Import or export',
};

const RELEASE_CONDITIONS_BY_USE_CASE: Record<string, string> = {
  'supplier-purchase':
    'The agreed items and quantities are delivered, the buyer completes the handover checks, and no dispute is open.',
  'wholesale-order':
    'The full wholesale order is delivered as agreed, the buyer completes the handover checks, and no dispute is open.',
  'service-delivery':
    'The agreed service or milestone is completed, supporting evidence is added, and the buyer confirms the outcome.',
  'contractor-engagement':
    'The agreed work or milestone is completed, supporting evidence is added, and the buyer confirms the outcome.',
  'equipment-purchase':
    'The agreed equipment is delivered, its identity and condition are checked during handover, and no dispute is open.',
  'property-agent-payments':
    'The agreed property documents, payment evidence, and agent deliverables are provided and confirmed.',
  'developer-instalments':
    'The agreed instalment milestone and supporting property documents are completed and confirmed.',
  'land-transactions':
    'The agreed land documents, verification evidence, and handover conditions are completed and confirmed.',
  'agent-led-property':
    'The agreed property milestone and the agent’s supporting documents are completed and confirmed.',
  'contractor-projects':
    'The agreed construction milestone is completed, evidence is added, and the buyer confirms the work.',
  'diaspora-purchases':
    'The agreed product or property milestone is completed, supporting evidence is added, and the buyer confirms it.',
  'vehicle-transactions':
    'The agreed vehicle and documents are delivered, their details are checked, and no dispute is open.',
  'high-value-personal-purchases':
    'The agreed item is delivered, its identity and condition are checked during handover, and no dispute is open.',
  'logistics-agreement':
    'The agreed delivery is completed, delivery evidence is added, and the receiving party confirms it.',
  'manufacturing-order':
    'The agreed goods are produced and delivered to specification, supporting evidence is added, and no dispute is open.',
  'import-export':
    'The agreed shipment milestone, documents, and delivery evidence are completed and confirmed.',
};

const FALLBACK_RELEASE_CONDITIONS =
  'The agreed product, service, or milestone is completed and confirmed, with no open dispute.';

export const DEFAULT_INVITATION_EXPIRY_DAYS = 7;

export function shortUseCaseLabel(useCase: UseCase): string {
  return SHORT_LABELS[useCase.slug] ?? useCase.title;
}

export function splitCreateDealUseCases(useCases: readonly UseCase[]) {
  const quickSlugs = new Set<string>(QUICK_USE_CASE_SLUGS);
  return {
    quick: QUICK_USE_CASE_SLUGS.flatMap((slug) => {
      const match = useCases.find((useCase) => useCase.slug === slug);
      return match ? [match] : [];
    }),
    more: useCases.filter((useCase) => !quickSlugs.has(useCase.slug)),
  };
}

export function suggestedReleaseConditions(useCaseSlug: string): string {
  return RELEASE_CONDITIONS_BY_USE_CASE[useCaseSlug] ?? FALLBACK_RELEASE_CONDITIONS;
}

export function canReplaceWithSuggestedReleaseConditions(value: string): boolean {
  const current = value.trim();
  return (
    current.length === 0 ||
    current === FALLBACK_RELEASE_CONDITIONS ||
    Object.values(RELEASE_CONDITIONS_BY_USE_CASE).includes(current)
  );
}
