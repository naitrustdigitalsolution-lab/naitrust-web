/**
 * Use-Case Feature Rules
 * The home for use-case-specific behaviour the app adheres to. Each Phase 1
 * use case declares which deal types (structures) it supports and any special
 * features (milestone tracking, recurring/linked deals). The create flow and
 * transaction room read this so a use case only ever offers what makes sense
 * for it. Add new per-use-case behaviours here as their own fields/modules.
 */

import type { DealType } from '../store/types';

export interface UseCaseFeatures {
  /** Deal structures offered for this use case, in display order. */
  dealTypes: DealType[];
  /** The default structure selected for this use case. */
  defaultDealType: DealType;
  /** Physical delivery worth tracking in stages (goods in transit). */
  supportsMilestones: boolean;
  /** Repeatable arrangement — a linked follow-on deal on completion. */
  supportsRecurring: boolean;
  /** Short hint shown when this use case is picked. */
  note?: string;
}

const SINGLE_ONLY: UseCaseFeatures = {
  dealTypes: ['single'],
  defaultDealType: 'single',
  supportsMilestones: false,
  supportsRecurring: false,
};

export const USE_CASE_FEATURES: Record<string, UseCaseFeatures> = {
  'supplier-orders': {
    dealTypes: ['single', 'milestone', 'recurring'],
    defaultDealType: 'milestone',
    supportsMilestones: true,
    supportsRecurring: true,
    note: 'Track the shipment in stages, and set up repeat orders as a recurring deal.',
  },
  'contractor-projects': {
    dealTypes: ['single', 'milestone'],
    defaultDealType: 'milestone',
    supportsMilestones: true,
    supportsRecurring: false,
    note: 'Track the job in stages so both sides see progress.',
  },
  'social-commerce': {
    dealTypes: ['single', 'milestone'],
    defaultDealType: 'single',
    supportsMilestones: true,
    supportsRecurring: false,
    note: 'Add dispatch tracking so the buyer can follow delivery.',
  },
  'high-value-personal-purchases': {
    dealTypes: ['single', 'milestone'],
    defaultDealType: 'single',
    supportsMilestones: true,
    supportsRecurring: false,
  },
  'freelance-agency-work': {
    dealTypes: ['single', 'recurring'],
    defaultDealType: 'single',
    supportsMilestones: false,
    supportsRecurring: true,
    note: 'Set up a recurring deal for retainers or monthly work.',
  },
  'event-vendors': SINGLE_ONLY,
  'property-agent-payments': {
    dealTypes: ['single', 'recurring'],
    defaultDealType: 'single',
    supportsMilestones: false,
    supportsRecurring: true,
    note: 'Recurring works well for rent and periodic payments.',
  },
  'vehicle-transactions': {
    dealTypes: ['single', 'milestone'],
    defaultDealType: 'single',
    supportsMilestones: true,
    supportsRecurring: false,
  },
  'diaspora-purchases': {
    dealTypes: ['single', 'milestone'],
    defaultDealType: 'single',
    supportsMilestones: true,
    supportsRecurring: false,
  },
  'business-service-providers': {
    dealTypes: ['single', 'recurring'],
    defaultDealType: 'single',
    supportsMilestones: false,
    supportsRecurring: true,
    note: 'Recurring suits ongoing or retainer service arrangements.',
  },
};

export function featuresForUseCase(slug: string | undefined): UseCaseFeatures {
  return (slug && USE_CASE_FEATURES[slug]) || SINGLE_ONLY;
}

const DEAL_TYPE_META: Record<DealType, { label: string; description: string }> = {
  single: {
    label: 'Single release',
    description: 'One payment held safely, released once on delivery.',
  },
  milestone: {
    label: 'Milestone tracking',
    description: 'Track delivery in stages — keep the buyer updated in transit.',
  },
  recurring: {
    label: 'Recurring deal',
    description: 'A linked follow-on deal is created automatically when this one completes.',
  },
};

export function dealTypeMeta(type: DealType) {
  return DEAL_TYPE_META[type];
}
