import { useAuthStore } from '../store/auth.store';
import type { DealIdentityCapture, DealIdentityCaptureAction } from '../store/types';
import { listMockCreatedDeals, getMockDealRuntime } from './mock-protected-deal-store';
import { canMockUserAccessDeal } from './mock-deal-access';
import { mockCreatedDealParticipantIndex } from './mock-deal-participants';

const VIEW_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const CAPTURE_STORAGE_KEY = 'naitrust:mock-deal-identity-captures:v1';
const ACCESS_LOG_STORAGE_KEY = 'naitrust:mock-deal-identity-access-log:v1';

interface PrivateCapture extends DealIdentityCapture {
  scopeId: string;
  photoDataUrl?: string;
  dealId?: string;
}

export interface DealIdentityCaptureView extends DealIdentityCapture {
  photoDataUrl: string;
  watermark: string;
}

export interface IdentityCaptureAccessEvent {
  captureId: string;
  dealId: string;
  viewerUserId: string;
  viewedAt: string;
}

function readStoredArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

const captures = new Map<string, PrivateCapture>(
  readStoredArray<PrivateCapture>(CAPTURE_STORAGE_KEY).map((capture) => [capture.captureId, capture]),
);
const accessLog: IdentityCaptureAccessEvent[] = readStoredArray<IdentityCaptureAccessEvent>(ACCESS_LOG_STORAGE_KEY);

function persistCaptures(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify([...captures.values()]));
}

function persistAccessLog(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_LOG_STORAGE_KEY, JSON.stringify(accessLog));
}

function mockPhoto(name: string): string {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'NT';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="#e9f4ff"/><circle cx="320" cy="190" r="92" fill="#1689ff"/><path d="M145 455c25-112 101-168 175-168s150 56 175 168" fill="#1689ff"/><text x="320" y="210" text-anchor="middle" font-family="Arial" font-size="54" font-weight="700" fill="white">${initials}</text><text x="320" y="455" text-anchor="middle" font-family="Arial" font-size="18" fill="#0b2b45">Mock live capture</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function registerMockDealIdentityCapture(input: {
  captureId: string;
  scopeId: string;
  subjectUserId: string;
  representativeName: string;
  businessName?: string;
  action: DealIdentityCaptureAction;
  capturedAt: string;
  photoDataUrl?: string;
}): void {
  captures.set(input.captureId, {
    captureId: input.captureId,
    scopeId: input.scopeId,
    subjectUserId: input.subjectUserId,
    representativeName: input.representativeName,
    businessName: input.businessName,
    action: input.action,
    capturedAt: input.capturedAt,
    verificationStatus: 'passed',
    encryptedEvidenceRef: `mock-vault://${input.captureId}`,
    photoAvailable: true,
    legalHold: false,
    photoDataUrl: input.photoDataUrl ?? mockPhoto(input.representativeName),
  });
  persistCaptures();
}

export function bindMockDealIdentityCapture(captureId: string, dealId: string): void {
  const capture = captures.get(captureId);
  if (!capture) return;
  captures.set(captureId, { ...capture, dealId });
  persistCaptures();
}

function isAuthorized(dealId: string, userId: string): boolean {
  const deal = listMockCreatedDeals().find((item) => item.summary.id === dealId);
  if (!deal) return false;
  return canMockUserAccessDeal(deal.summary, userId) || mockCreatedDealParticipantIndex(dealId, userId) >= 0;
}

function retentionExpiresAt(capture: PrivateCapture): string | undefined {
  if (!capture.dealId) return undefined;
  const runtime = getMockDealRuntime(capture.dealId);
  const closedAt = runtime?.delivery?.fundingReview.paidOutAt ?? runtime?.invitationRespondedAt;
  if (!closedAt || !['paid_out', 'completed', 'cancelled', 'refunded'].includes(runtime?.status ?? '')) return undefined;
  return new Date(new Date(closedAt).getTime() + VIEW_RETENTION_MS).toISOString();
}

export function listMockDealIdentityCaptures(dealId: string): DealIdentityCapture[] {
  const userId = useAuthStore.getState().user?.id;
  if (!userId || !isAuthorized(dealId, userId)) return [];
  return [...captures.values()].filter((capture) => capture.dealId === dealId).map((capture) => {
    const expiry = retentionExpiresAt(capture);
    return { ...capture, retentionExpiresAt: expiry, photoAvailable: capture.photoAvailable && (!expiry || Date.now() <= new Date(expiry).getTime() || capture.legalHold), photoDataUrl: undefined, scopeId: undefined, dealId: undefined } as DealIdentityCapture;
  });
}

export function viewMockDealIdentityCapture(dealId: string, captureId: string): DealIdentityCaptureView {
  const userId = useAuthStore.getState().user?.id;
  const capture = captures.get(captureId);
  if (!userId || !capture || capture.dealId !== dealId || !isAuthorized(dealId, userId)) throw new Error('You are not authorised to view this deal identity photo.');
  const expiry = retentionExpiresAt(capture);
  if (expiry && Date.now() > new Date(expiry).getTime() && !capture.legalHold) throw new Error('This deal identity photo is no longer available.');
  if (!capture.photoDataUrl) throw new Error('Photo for this deal is not available.');
  accessLog.push({ captureId, dealId, viewerUserId: userId, viewedAt: new Date().toISOString() });
  persistAccessLog();
  const deal = listMockCreatedDeals().find((item) => item.summary.id === dealId);
  return { ...capture, retentionExpiresAt: expiry, photoDataUrl: capture.photoDataUrl, watermark: `${deal?.summary.reference ?? dealId} · ${capture.representativeName} · ${new Date(capture.capturedAt).toLocaleString()}` };
}

export function getMockIdentityCaptureAccessLog(): readonly IdentityCaptureAccessEvent[] {
  return accessLog;
}
