/**
 * Safe Deal Presentation Logic
 * Pure functions mapping safe-deal domain data to display values.
 * Kept free of React so it is trivially unit-testable.
 */

import type { DealRole, PartyMode, SafeDealStatus, SafeDealSummary } from '../store/types';

export type StatusBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

interface StatusPresentation {
  label: string;
  variant: StatusBadgeVariant;
}

/**
 * Brand rules (guardrails/ui.md):
 * - outline  → deal not yet active (pre-funding)
 * - default  → primary blue, deal "in motion"
 * - destructive → disputed
 * - success  → the one deliberate green accent (paid out / completed)
 * - secondary → muted, closed-out (refunded / cancelled)
 */
const STATUS_PRESENTATION: Record<SafeDealStatus, StatusPresentation> = {
  draft: { label: 'Draft', variant: 'outline' },
  pending_counterparty: { label: 'Pending counterparty', variant: 'outline' },
  terms_negotiation: { label: 'Negotiating terms', variant: 'outline' },
  terms_agreed: { label: 'Terms agreed', variant: 'outline' },
  awaiting_funding: { label: 'Awaiting funding', variant: 'outline' },
  funded: { label: 'Funded', variant: 'default' },
  in_progress: { label: 'In progress', variant: 'default' },
  evidence_submitted: { label: 'Evidence submitted', variant: 'default' },
  buyer_review: { label: 'Buyer review', variant: 'default' },
  release_approved: { label: 'Release approved', variant: 'default' },
  disputed: { label: 'Disputed', variant: 'destructive' },
  paid_out: { label: 'Paid out', variant: 'success' },
  refunded: { label: 'Refunded', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'success' },
};

const FALLBACK_PRESENTATION: StatusPresentation = { label: 'Unknown', variant: 'outline' };

export function getStatusPresentation(status: SafeDealStatus): StatusPresentation {
  return STATUS_PRESENTATION[status] ?? FALLBACK_PRESENTATION;
}

export function partyModeLabel(mode: PartyMode): string {
  return mode === 'b2b' ? 'Business to business' : 'Customer to business';
}

export function partyModeShort(mode: PartyMode): string {
  return mode === 'b2b' ? 'B2B' : 'B2C';
}

export function roleLabel(role: DealRole): string {
  return role === 'buyer' ? 'Buyer' : 'Seller';
}

/** Money-flow framing of a role (guardrails: sender vs receiver of funds). */
export function roleFlowLabel(role: DealRole): string {
  return role === 'buyer' ? 'Sending funds' : 'Receiving funds';
}

/** The counterparty's role, given your role in the deal. */
export function counterpartyRoleLabel(yourRole: DealRole): string {
  return yourRole === 'buyer' ? 'Seller' : 'Buyer';
}

const FUNDING_PRESENTATION: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  unfunded: { label: 'Not funded', variant: 'outline' },
  awaiting_transfer: { label: 'Awaiting transfer', variant: 'outline' },
  funded: { label: 'Funded & protected', variant: 'default' },
  released: { label: 'Released', variant: 'success' },
};

export function getFundingPresentation(status: string): { label: string; variant: StatusBadgeVariant } {
  return FUNDING_PRESENTATION[status] ?? { label: status, variant: 'outline' };
}

const PARTY_STATUS_PRESENTATION: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  creator: { label: 'Creator', variant: 'secondary' },
  invited: { label: 'Invited', variant: 'outline' },
  accepted: { label: 'Accepted', variant: 'success' },
  declined: { label: 'Declined', variant: 'secondary' },
};

export function getPartyStatusPresentation(status: string): { label: string; variant: StatusBadgeVariant } {
  return PARTY_STATUS_PRESENTATION[status] ?? { label: status, variant: 'outline' };
}

/**
 * Format an integer minor-unit amount (kobo) as a currency string.
 * e.g. formatMinorAmount(45000000, 'NGN') → "₦450,000.00"
 */
export function formatMinorAmount(amountMinor: number, currency: string): string {
  const major = amountMinor / 100;
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(major);
  } catch {
    // Unknown currency code — fall back to a plain formatted number.
    return `${currency} ${major.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }
}

/**
 * Compact currency for dense UI (stat-tile subtext, chart axis ticks).
 * e.g. formatMinorAmountCompact(45000000, 'NGN') → "₦450K"
 */
export function formatMinorAmountCompact(amountMinor: number, currency: string): string {
  const major = amountMinor / 100;
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(major);
  } catch {
    return `${currency} ${major.toLocaleString('en-NG')}`;
  }
}

const CLOSED_STATUSES: readonly SafeDealStatus[] = ['draft', 'completed', 'paid_out', 'refunded', 'cancelled'];

/**
 * Statuses where the current user is the one who needs to act next —
 * fund the deal, review submitted evidence, or respond to a dispute.
 * Dashboard "needs your action" panel (guardrails/ui.md: "pending actions").
 */
const NEEDS_ACTION_STATUSES: readonly SafeDealStatus[] = ['awaiting_funding', 'evidence_submitted', 'disputed'];

const ACTION_REASON: Partial<Record<SafeDealStatus, string>> = {
  awaiting_funding: 'Fund this deal to move it forward',
  evidence_submitted: 'Review submitted evidence',
  disputed: 'Dispute needs your response',
};

export function getActionReason(status: SafeDealStatus): string | null {
  return ACTION_REASON[status] ?? null;
}

export interface DealSummaryCounts {
  active: number;
  needsAction: number;
  completed: number;
  /** Sum of amounts for active (in-flight) deals, minor units. */
  activeValueMinor: number;
  /** Sum of amounts for completed/paid-out deals, minor units. */
  releasedValueMinor: number;
}

/**
 * Dashboard stat-tile counts and value totals, derived client-side from the
 * deal list — no dedicated summary endpoint for Phase 1.
 */
export function summarizeDeals(deals: SafeDealSummary[]): DealSummaryCounts {
  return deals.reduce<DealSummaryCounts>(
    (acc, deal) => {
      if (deal.status === 'completed' || deal.status === 'paid_out') {
        acc.completed += 1;
        acc.releasedValueMinor += deal.amountMinor;
      } else if (!CLOSED_STATUSES.includes(deal.status)) {
        acc.active += 1;
        acc.activeValueMinor += deal.amountMinor;
      }
      if (NEEDS_ACTION_STATUSES.includes(deal.status)) {
        acc.needsAction += 1;
      }
      return acc;
    },
    { active: 0, needsAction: 0, completed: 0, activeValueMinor: 0, releasedValueMinor: 0 },
  );
}

export function dealsNeedingAction(deals: SafeDealSummary[]): SafeDealSummary[] {
  return deals.filter((deal) => NEEDS_ACTION_STATUSES.includes(deal.status));
}

export interface MonthlyValuePoint {
  /** Sort key `YYYY-M`. */
  key: string;
  /** Short month label, e.g. "Jun". */
  label: string;
  /** Total protected value of deals created that month, minor units. */
  valueMinor: number;
  /** Number of deals created that month. */
  count: number;
}

/**
 * Protected value grouped by the month each deal was created — the dashboard
 * hero chart's series. Reads as "how much you moved through safe deals each
 * month", which is far clearer than a running cumulative line.
 */
export function monthlyProtectedValue(deals: SafeDealSummary[]): MonthlyValuePoint[] {
  const map = new Map<string, MonthlyValuePoint>();
  for (const deal of deals) {
    const d = new Date(deal.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const existing = map.get(key);
    if (existing) {
      existing.valueMinor += deal.amountMinor;
      existing.count += 1;
    } else {
      map.set(key, {
        key,
        label: d.toLocaleString('en-US', { month: 'short' }),
        valueMinor: deal.amountMinor,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => {
    const [ay, am] = a.key.split('-').map(Number);
    const [by, bm] = b.key.split('-').map(Number);
    return ay - by || am - bm;
  });
}

export interface StatusGroup {
  key: 'active' | 'completed' | 'disputed' | 'closed';
  label: string;
  count: number;
}

/**
 * Deals grouped into mutually-exclusive status buckets for the dashboard
 * breakdown donut.
 */
export function groupDealsByStatus(deals: SafeDealSummary[]): StatusGroup[] {
  let active = 0;
  let completed = 0;
  let disputed = 0;
  let closed = 0;
  for (const deal of deals) {
    if (deal.status === 'completed' || deal.status === 'paid_out') completed += 1;
    else if (deal.status === 'disputed') disputed += 1;
    else if (deal.status === 'refunded' || deal.status === 'cancelled') closed += 1;
    else active += 1;
  }
  return [
    { key: 'active', label: 'Active', count: active },
    { key: 'completed', label: 'Completed', count: completed },
    { key: 'disputed', label: 'Disputed', count: disputed },
    { key: 'closed', label: 'Closed', count: closed },
  ];
}

export interface DealMetrics {
  totalValueMinor: number;
  avgValueMinor: number;
  completionRate: number; // 0..1 of all deals that completed
  disputeRate: number; // 0..1 of all deals disputed
}

export function computeDealMetrics(deals: SafeDealSummary[]): DealMetrics {
  const total = deals.length;
  const totalValueMinor = deals.reduce((sum, d) => sum + d.amountMinor, 0);
  const completed = deals.filter((d) => d.status === 'completed' || d.status === 'paid_out').length;
  const disputed = deals.filter((d) => d.status === 'disputed').length;
  return {
    totalValueMinor,
    avgValueMinor: total ? Math.round(totalValueMinor / total) : 0,
    completionRate: total ? completed / total : 0,
    disputeRate: total ? disputed / total : 0,
  };
}
