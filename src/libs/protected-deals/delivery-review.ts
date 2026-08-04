import type {
  DealDeliveryLifecycle,
  DealEvidenceItem,
  ExtendedProductTestingDays,
  SafeDealStatus,
} from '../store/types';

export const HANDOVER_REVIEW_MS = 10 * 60 * 1000;
export const DEFAULT_FUNDING_REVIEW_MS = 24 * 60 * 60 * 1000;
export const DELIVERY_CARD_VALIDITY_MS = 48 * 60 * 60 * 1000;
export const EXTENDED_TESTING_OPTIONS: ExtendedProductTestingDays[] = [3, 7, 14];

export const PRODUCT_EVIDENCE_KINDS = {
  model: 'Product model',
  serial: 'Serial / IMEI',
  packaging: 'Packaging condition',
  seal: 'Tamper seal',
} as const;

const PHYSICAL_PRODUCT_USE_CASES = new Set([
  'supplier-purchase',
  'supplier-orders',
  'wholesale-order',
  'equipment-purchase',
  'vehicle-transactions',
  'high-value-personal-purchases',
  'logistics-agreement',
  'manufacturing-order',
  'import-export',
  'social-commerce',
  'diaspora-purchases',
]);

const CARD_ELIGIBLE_STATUSES: SafeDealStatus[] = [
  'funded',
  'in_progress',
  'evidence_submitted',
  'buyer_review',
];

export function supportsDeliveryReview(useCase: string | undefined): boolean {
  return Boolean(useCase && PHYSICAL_PRODUCT_USE_CASES.has(useCase));
}

export function isDeliveryCardStatusEligible(status: SafeDealStatus): boolean {
  return CARD_ELIGIBLE_STATUSES.includes(status);
}

export function requiredProductEvidence(evidence: DealEvidenceItem[]) {
  const kinds = new Set(evidence.map((item) => item.kind.toLowerCase()));
  return Object.values(PRODUCT_EVIDENCE_KINDS).map((kind) => ({
    kind,
    complete: kinds.has(kind.toLowerCase()),
  }));
}

export function hasRequiredProductEvidence(evidence: DealEvidenceItem[]): boolean {
  return requiredProductEvidence(evidence).every((requirement) => requirement.complete);
}

export function emptyDeliveryLifecycle(
  extendedProductTestingDays?: ExtendedProductTestingDays,
): DealDeliveryLifecycle {
  return {
    handover: { status: 'not_started' },
    fundingReview: {
      status: 'not_started',
      extendedProductTestingDays,
    },
  };
}

export function fundingReviewDurationMs(days?: ExtendedProductTestingDays): number {
  return days ? days * 24 * 60 * 60 * 1000 : DEFAULT_FUNDING_REVIEW_MS;
}

export function fundingReviewLabel(days?: ExtendedProductTestingDays): string {
  return days ? `${days}-day extended product testing period` : '24-hour funding review';
}

export function createOpaqueToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

export function createHandoverOtp(): string {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return String(100000 + (value[0] % 900000));
}

export function remainingMs(deadline: string | undefined, now = Date.now()): number {
  return deadline ? Math.max(0, new Date(deadline).getTime() - now) : 0;
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
