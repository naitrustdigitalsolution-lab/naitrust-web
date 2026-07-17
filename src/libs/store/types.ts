/**
 * Shared Domain Types
 * Single home for the types the app actually uses. Grouped by domain:
 * account/user, safe deal, transaction room (deal detail), deal chat,
 * dispute, invitation, negotiation, notification, reputation, business.
 *
 * These mirror the backend models in
 * `naitrust-api/guardrails/database-design.md`. Amounts are always integer
 * minor units (kobo) — never floats.
 */

/* ------------------------------------------------------------------ *
 * Account / User
 * ------------------------------------------------------------------ */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  role: 'customer' | 'business' | 'business-member' | 'admin';
  phone?: string;
  avatar?: string;
  kycLevel?: number;
  kycVerified?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

/* ------------------------------------------------------------------ *
 * Safe Deal (protected transaction) — core model
 *
 * Status names mirror the backend transaction state machine. Kept as the
 * one source of truth for deal statuses, party mode, role and deal type.
 * ------------------------------------------------------------------ */

export type SafeDealStatus =
  | 'draft'
  | 'pending_counterparty'
  | 'terms_negotiation'
  | 'terms_agreed'
  | 'awaiting_funding'
  | 'funded'
  | 'in_progress'
  | 'evidence_submitted'
  | 'buyer_review'
  | 'release_approved'
  | 'disputed'
  | 'paid_out'
  | 'refunded'
  | 'cancelled'
  | 'completed';

/**
 * The minimal shape needed to render a safe deal in a list/dashboard row.
 * Amounts are integer minor units (kobo) — never floats.
 */
export interface SafeDealSummary {
  id: string;
  reference: string;
  counterpartyName: string;
  amountMinor: number;
  currency: string;
  status: SafeDealStatus;
  createdAt: string; // ISO 8601
}

/**
 * Party mode of a protected transaction (guardrails/database-design.md):
 * - b2b: business ↔ business
 * - b2c: individual customer ↔ business/vendor/service provider
 */
export type PartyMode = 'b2b' | 'b2c';

/**
 * The creator's own role in the deal:
 * - buyer: the party sending / releasing funds (the payer).
 * - seller: the party receiving funds on delivery (the payee).
 */
export type DealRole = 'buyer' | 'seller';

/**
 * How the deal is structured (its "deal type"):
 * - single: one payment held, one release on delivery.
 * - milestone: physical delivery tracked in stages (e.g. goods in transit),
 *   keeping the buyer updated; release on final confirmation.
 * - recurring: after the deal completes, a linked follow-on deal is created
 *   automatically, carrying the history forward (e.g. repeat supply, rent).
 * Which types are offered depends on the use case (libs/features).
 */
export type DealType = 'single' | 'milestone' | 'recurring';

/**
 * A counterparty invited to the deal. Each participant carries an
 * `allocationMinor` — the amount tied to that party: what they receive when
 * you release funds, or what they pay when you are the one being paid. A deal
 * can have more than one participant (e.g. paying two suppliers from one deal,
 * or being paid by two customers).
 */
export interface DealParticipantInput {
  name: string;
  email: string;
  allocationMinor?: number;
}

/** Longest an invitation can stay open before it expires. */
export const MAX_DEAL_OPEN_DAYS = 30;

/** Liveness freshness window — a check older than this must be redone. */
export const LIVENESS_FRESHNESS_DAYS = 30;

/** One clause of a deal agreement document. */
export interface AgreementSection {
  heading: string;
  body: string;
}

/**
 * The agreement document both parties accept before the deal freezes.
 * Drafted with AI assistance (advisory only — guardrails/plan.md: AI never
 * triggers protected actions; both parties still review and accept).
 */
export interface AgreementDraft {
  version: number;
  generatedByAi: boolean;
  sections: AgreementSection[];
}

/**
 * Payload for creating a domestic single-release safe deal. Mirrors the
 * Phase 1 create-transaction contract — amount is major-unit naira on the
 * form and converted to `amountMinor` before submit.
 */
export interface CreateSafeDealInput {
  useCase: string; // use-case slug from libs/use-cases.ts
  dealType: DealType;
  partyMode: PartyMode;
  role: DealRole;
  /** One or more invited counterparties. */
  participants: DealParticipantInput[];
  title: string;
  description: string;
  amountMinor: number;
  currency: string;
  deliveryDueDate: string; // ISO date (yyyy-mm-dd)
  releaseConditions: string;
  /** Days the invitation stays open (1..MAX_DEAL_OPEN_DAYS). */
  expiresInDays: number;
  agreement: AgreementDraft;
}

/* ------------------------------------------------------------------ *
 * Transaction Room — full deal detail
 *
 * Parties, frozen agreement, partner funding status, evidence, and the
 * activity timeline. Mirrors the backend Transaction / Transaction Party /
 * Agreement / Evidence / Virtual Account Funding models.
 * ------------------------------------------------------------------ */

export type PartyStatus = 'creator' | 'invited' | 'accepted' | 'declined';

export interface DealParty {
  id: string;
  name: string;
  email?: string;
  role: DealRole;
  status: PartyStatus;
  /** The current user's own party record. */
  isYou: boolean;
  /** How much this party receives on release, if allocated. Minor units. */
  allocationMinor?: number;
}

export type FundingStatus = 'unfunded' | 'awaiting_transfer' | 'funded' | 'released';

export interface DealFunding {
  partner: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  amountExpectedMinor: number;
  amountReceivedMinor: number;
  currency: string;
  status: FundingStatus;
}

export interface DealEvidenceItem {
  id: string;
  fileName: string;
  kind: string; // e.g. Invoice, Waybill, Photo, Inspection report
  uploadedByName: string;
  note?: string;
  createdAt: string; // ISO 8601
}

export type ActivityKind =
  | 'created'
  | 'invited'
  | 'accepted'
  | 'agreed'
  | 'funded'
  | 'evidence'
  | 'message'
  | 'dispute'
  | 'released'
  | 'completed';

export interface DealActivityEvent {
  id: string;
  kind: ActivityKind;
  message: string;
  createdAt: string; // ISO 8601
}

export type MilestoneStatus = 'done' | 'current' | 'pending';

/**
 * A tracked delivery stage for milestone deals (goods in transit) — keeps the
 * buyer updated as the seller advances the shipment/work.
 */
export interface DealMilestone {
  id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  updatedByName?: string;
  at?: string; // ISO when this stage was reached
}

export interface SafeDealDetail extends SafeDealSummary {
  title: string;
  description: string;
  useCase: string;
  dealType: DealType;
  partyMode: PartyMode;
  deliveryDueDate: string;
  releaseConditions: string;
  expiresAt: string;
  /** True for recurring deals — a linked follow-on is created on completion. */
  recurring: boolean;
  /** Reference of the prior deal this one continues, if recurring. */
  previousReference?: string;
  parties: DealParty[];
  agreement: AgreementDraft;
  funding: DealFunding;
  evidence: DealEvidenceItem[];
  activity: DealActivityEvent[];
  /** Populated for milestone deals; empty otherwise. */
  milestones: DealMilestone[];
}

/* ------------------------------------------------------------------ *
 * Deal Chat — messages inside a transaction room
 * ------------------------------------------------------------------ */

export interface DealMessage {
  id: string;
  dealId: string;
  senderId: string;
  senderName: string;
  /** The current user sent this message. */
  isYou: boolean;
  body: string;
  createdAt: string; // ISO 8601
}

/* ------------------------------------------------------------------ *
 * Dispute — raised on a deal before release; blocks release while open
 * ------------------------------------------------------------------ */

export type DisputeStatus = 'open' | 'under_review' | 'resolved_release' | 'resolved_refund';

export interface DisputeMessage {
  id: string;
  byName: string;
  byYou: boolean;
  body: string;
  createdAt: string; // ISO 8601
}

export interface DealDispute {
  dealId: string;
  status: DisputeStatus;
  reason: string;
  description: string;
  openedByName: string;
  createdAt: string; // ISO 8601
  messages: DisputeMessage[];
}

/* ------------------------------------------------------------------ *
 * Termination — either party can request ending a deal early. The other
 * party (or parties) sees the reason and accepts or rejects (a rejection
 * carries its own reason). Every request and outcome is kept on the record.
 * ------------------------------------------------------------------ */

export type TerminationStatus = 'requested' | 'accepted' | 'rejected';

export interface DealTermination {
  dealId: string;
  status: TerminationStatus;
  /** Why the requester wants to end the deal. */
  reason: string;
  requestedByName: string;
  /** The current user opened this termination request. */
  requestedByYou: boolean;
  createdAt: string; // ISO 8601
  /** The counterparty's response (present once they accept/reject). */
  respondedByName?: string;
  respondedAt?: string;
  /** Required when a request is rejected — why the other party declined. */
  responseReason?: string;
}

/* ------------------------------------------------------------------ *
 * Invitation — incoming request to join a counterparty's safe deal
 * ------------------------------------------------------------------ */

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface DealInvitation {
  id: string;
  reference: string; // the deal's reference
  /** Who sent the invitation (the counterparty). */
  fromName: string;
  fromRole: DealRole;
  /** The role you would take if you accept. */
  yourRole: DealRole;
  partyMode: PartyMode;
  title: string;
  amountMinor: number;
  currency: string;
  message?: string;
  /** The agreement document you accept by joining the deal. */
  agreement: AgreementDraft;
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  status: InvitationStatus;
}

/* ------------------------------------------------------------------ *
 * Negotiation — proposals to change terms before both parties agree
 * ------------------------------------------------------------------ */

export type NegotiationStatus = 'open' | 'accepted' | 'declined' | 'withdrawn';
export type ProposalStatus = 'proposed' | 'accepted' | 'declined' | 'superseded';

/** The specific changes a proposal is requesting. All fields optional. */
export interface ProposedChanges {
  amountMinor?: number;
  deliveryDueDate?: string;
  releaseConditions?: string;
  /** A plain-language request to change the agreement wording. */
  agreementNote?: string;
}

export interface NegotiationProposal {
  id: string;
  byName: string;
  /** The current user made this proposal. */
  byYou: boolean;
  message: string;
  changes: ProposedChanges;
  status: ProposalStatus;
  createdAt: string; // ISO 8601
}

export interface DealNegotiation {
  dealId: string;
  status: NegotiationStatus;
  /** Ordered oldest → newest. */
  proposals: NegotiationProposal[];
}

/* ------------------------------------------------------------------ *
 * Notification — safe-deal notification feed
 * ------------------------------------------------------------------ */

export type NotificationType =
  | 'deal'
  | 'funding'
  | 'evidence'
  | 'dispute'
  | 'verification'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO 8601
  /** In-app route this notification points at, if any. */
  link?: string;
}

/* ------------------------------------------------------------------ *
 * Reputation — dashboard reputation stat tile
 * ------------------------------------------------------------------ */

export interface ReputationSummary {
  completedTransactionsCount: number;
  ratingAverage: number | null;
  ratingCount: number;
}

/* ------------------------------------------------------------------ *
 * Business — the record tied to a business account
 * ------------------------------------------------------------------ */

export interface BusinessProfile {
  id: string;
  ownerEmail: string;
  name: string;
  rcNumber: string; // CAC registration number
  category: string;
  /** Everything below is captured at registration and shown on the profile. */
  description?: string;
  ownerName?: string;
  email?: string; // business contact email
  phone?: string; // business phone
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  socialHandles?: { platform: string; value: string }[];
  verified: boolean;
  createdAt: string;
}
