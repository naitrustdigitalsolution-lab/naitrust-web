/**
 * Shared Domain Types
 * Single home for the types the app actually uses. Grouped by domain:
 * account/user, safe deal, transaction room (deal detail), deal chat,
 * dispute, invitation, negotiation, notification, reputation, business.
 *
 * These mirror the backend models in
 * `naitrust-api/guardrails/database-design.md`. Amounts are always integer
 * minor units (kobo): never floats.
 */

/* ------------------------------------------------------------------ *
 * Account / User
 * ------------------------------------------------------------------ */

export interface User {
  id: string;
  /** Unique public account identifier issued once when the account is created. */
  naitrustId: string;
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
  /** Mock/profile flag indicating that a transaction PIN has already been configured. */
  hasTransactionPin?: boolean;
}

/* ------------------------------------------------------------------ *
 * Safe Deal (protected transaction): core model
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
 * Amounts are integer minor units (kobo): never floats.
 */
export interface SafeDealSummary {
  id: string;
  reference: string;
  title: string;
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
 * - p2p: individual ↔ individual
 */
export type PartyMode = 'b2b' | 'b2c' | 'p2p';

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

/** Optional negotiated funding-review window for delivered physical products. */
export type ExtendedProductTestingDays = 3 | 7 | 14;

/**
 * A counterparty invited to the deal. Each participant carries an
 * `allocationMinor`: the amount tied to that party: what they receive when
 * you release funds, or what they pay when you are the one being paid. A deal
 * can have more than one participant (e.g. paying two suppliers from one deal,
 * or being paid by two customers).
 */
export interface DealParticipantInput {
  name: string;
  email?: string;
  phone?: string;
  profileId?: string;
  allocationMinor?: number;
}

/** Longest an invitation can stay open before it expires. */
export const MAX_DEAL_OPEN_DAYS = 30;

/** Liveness freshness window: a check older than this must be redone. */
export const LIVENESS_FRESHNESS_DAYS = 30;

/** One clause of a deal agreement document. */
export interface AgreementSection {
  heading: string;
  body: string;
}

/**
 * The agreement document both parties accept before the deal freezes.
 * Drafted with AI assistance (advisory only: guardrails/plan.md: AI never
 * triggers protected actions; both parties still review and accept).
 */
export interface AgreementDraft {
  version: number;
  generatedByAi: boolean;
  sections: AgreementSection[];
}

/**
 * Payload for creating a domestic single-release safe deal. Mirrors the
 * Phase 1 create-transaction contract: amount is major-unit naira on the
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
  /** Replaces the default 24-hour funding-review window when both parties accept. */
  extendedProductTestingDays?: ExtendedProductTestingDays;
  /** Days the invitation stays open (1..MAX_DEAL_OPEN_DAYS). */
  expiresInDays: number;
  agreement: AgreementDraft;
}

export interface CreateSafeDealResult extends SafeDealSummary {
  /** Opaque-token path safe to share outside Naitrust; no sensitive terms are encoded in it. */
  publicInvitePath: string;
}

/* ------------------------------------------------------------------ *
 * Transaction Room: full deal detail
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
  phone?: string;
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
  /** Backend file URL, or a session object URL while running the mock API. */
  fileUrl?: string;
  mimeType?: string;
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
  | 'delivery'
  | 'review'
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
 * A tracked delivery stage for milestone deals (goods in transit): keeps the
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

export type DeliveryCardStatus = 'active' | 'used' | 'invalidated' | 'expired';

export interface DealDeliveryCard {
  token: string;
  otpCode: string;
  generatedAt: string;
  expiresAt: string;
  status: DeliveryCardStatus;
  generation: number;
  usedAt?: string;
  invalidatedAt?: string;
}

export type HandoverReviewStatus = 'not_started' | 'in_progress' | 'completed' | 'issue_reported';
export type HandoverCompletionReason = 'buyer_confirmed' | 'timer_elapsed' | 'issue_reported';

export interface DealHandoverReview {
  status: HandoverReviewStatus;
  receivedAt?: string;
  endsAt?: string;
  completedAt?: string;
  completionReason?: HandoverCompletionReason;
}

export type FundingReviewStatus =
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'release_approved'
  | 'paid_out';

export interface DealFundingReview {
  status: FundingReviewStatus;
  startsAt?: string;
  endsAt?: string;
  extendedProductTestingDays?: ExtendedProductTestingDays;
  releaseApprovedAt?: string;
  paidOutAt?: string;
}

export interface DealDeliveryLifecycle {
  card?: DealDeliveryCard;
  handover: DealHandoverReview;
  fundingReview: DealFundingReview;
}

/** Minimum non-financial data shown by the opaque delivery-card route. */
export interface DeliveryHandoverPreview {
  dealId: string;
  title: string;
  reference: string;
  cardExpiresAt: string;
  cardStatus: DeliveryCardStatus;
  actorRole: DealRole;
  delivery: DealDeliveryLifecycle;
}

export interface SafeDealDetail extends SafeDealSummary {
  description: string;
  useCase: string;
  dealType: DealType;
  partyMode: PartyMode;
  deliveryDueDate: string;
  releaseConditions: string;
  extendedProductTestingDays?: ExtendedProductTestingDays;
  expiresAt: string;
  /** True for recurring deals: a linked follow-on is created on completion. */
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
  /** Delivery-card, handover, and partner-funding review state. */
  delivery: DealDeliveryLifecycle;
}

/* ------------------------------------------------------------------ *
 * Deal Chat: messages inside a transaction room
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
 * Dispute: raised on a deal before release; blocks release while open
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
 * Termination: either party can request ending a deal early. The other
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
  /** Required when a request is rejected: why the other party declined. */
  responseReason?: string;
}

/* ------------------------------------------------------------------ *
 * Invitation: incoming request to join a counterparty's safe deal
 * ------------------------------------------------------------------ */

export type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'withdrawn'
  | 'already_claimed'
  | 'wrong_recipient';

export interface DealInvitation {
  id: string;
  publicToken?: string;
  recipientUserId?: string;
  intendedContact?: string;
  intendedAccountType?: 'customer' | 'business';
  inviterProfileId?: string;
  inviteeProfileId?: string;
  postAuthDestination?: string;
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

/** Safe subset returned before authentication for a tokenised invitation. */
export interface PublicInvitationPreview {
  token: string;
  invitationId: string;
  reference: string;
  inviterName: string;
  inviterVerified: boolean;
  inviterAccountType: 'customer' | 'business';
  intendedAccountType: 'customer' | 'business';
  yourRole: DealRole;
  title: string;
  amountMinor: number;
  currency: string;
  expiresAt: string;
  status: InvitationStatus | 'invalid';
  maskedContact?: string;
}

/* ------------------------------------------------------------------ *
 * Negotiation: proposals to change terms before both parties agree
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
 * Notification: safe-deal notification feed
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
 * Reputation: dashboard reputation stat tile
 * ------------------------------------------------------------------ */

export interface ReputationSummary {
  completedTransactionsCount: number;
  ratingAverage: number | null;
  ratingCount: number;
}

/* ------------------------------------------------------------------ *
 * Business: the record tied to a business account
 * ------------------------------------------------------------------ */

export interface BusinessProfile {
  id: string;
  /** Foreign key to the user account that owns this business. */
  ownerUserId: string;
  name: string;
  slug?: string;
  ntId: string;
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
  identityVerifiedAt?: string;
  businessVerifiedAt?: string;
  ownershipVerifiedAt?: string;
  verificationExpiresAt?: string;
  completedProtectedTransactions?: number;
  completionRatePercent?: number;
  responseRatePercent?: number;
  verifiedReviewCount?: number;
  ratingAverage?: number;
  paymentAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
}

/* ------------------------------------------------------------------ *
 * Payment Provider: internal/admin-only. The frontend never sends
 * provider-specific payloads; this is purely a label surfaced on
 * transaction detail for internal administration, sourced from the
 * backend response once a real field exists there.
 * ------------------------------------------------------------------ */

export type PaymentProvider = 'anchor' | 'kora' | 'mock';

/* ------------------------------------------------------------------ *
 * Wallet: everyday account balance and activity.
 *
 * `available`, `pending` and `protected` are always kept as separate
 * numeric fields and must never be merged in the UI: protected funds are
 * allocated to open Protected Deals and are never available for ordinary
 * withdrawal or instant transfer.
 * ------------------------------------------------------------------ */

export interface WalletBalance {
  availableMinor: number;
  pendingMinor: number;
  protectedMinor: number;
  currency: string;
}

export interface WalletAccount {
  id: string;
  ownerUserId: string;
  businessId?: string;
  balance: WalletBalance;
  totalInflowMinor: number;
  totalOutflowMinor: number;
  /** Maximum a single funding/withdrawal action may move, minor units. */
  accountLimitMinor: number;
  virtualAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
}

export interface LinkedBankAccount {
  id: string;
  bankName: string;
  /** Masked in the UI (e.g. "•••• 4821"). */
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export type WalletActivityKind =
  | 'funding'
  | 'withdrawal'
  | 'instant_transfer_out'
  | 'instant_transfer_in'
  | 'protected_allocation'
  | 'protected_release'
  | 'fee';

export interface WalletActivityEvent {
  id: string;
  kind: WalletActivityKind;
  amountMinor: number;
  currency: string;
  description: string;
  createdAt: string; // ISO 8601
}

/* ------------------------------------------------------------------ *
 * Beneficiary: a saved instant-payment recipient
 * ------------------------------------------------------------------ */

export type BeneficiaryType = 'naitrust_user' | 'bank_account';

export interface Beneficiary {
  id: string;
  type: BeneficiaryType;
  name: string;
  email?: string;
  phone?: string;
  /** Naitrust account number or Naitrust ID when email/phone was not used. */
  naitrustIdentifier?: string;
  naitrustAccountNumber?: string;
  naitrustId?: string;
  bankName?: string;
  accountNumber?: string;
  isFavourite: boolean;
  createdAt: string; // ISO 8601
}

/* ------------------------------------------------------------------ *
 * Instant Transfer: everyday payment between parties who already
 * trust each other. Kept as its own model, separate from SafeDeal*
 * (Protected Payment): they share only low-level transaction fields,
 * not business rules.
 * ------------------------------------------------------------------ */

export type InstantTransferStatus =
  | 'draft'
  | 'recipient_validation'
  | 'recipient_confirmed'
  | 'awaiting_confirmation'
  | 'processing'
  | 'successful'
  | 'pending'
  | 'failed'
  | 'reversed'
  | 'cancelled'
  | 'refunded';

export type RecipientMethod =
  | 'naitrust_account_number'
  | 'naitrust_id'
  | 'email_address'
  | 'phone_number'
  | 'bank_transfer'
  | 'beneficiary';

export interface TransferRecipient {
  method: RecipientMethod;
  /** Email, phone number, or bank account number depending on `method`. */
  identifier: string;
  resolvedName?: string;
  bankName?: string;
  naitrustAccountNumber?: string;
  naitrustId?: string;
  accountType?: 'customer' | 'business';
  identityVerified?: boolean;
}

export interface CreateInstantTransferInput {
  recipient: TransferRecipient;
  amountMinor: number;
  currency: string;
  narration?: string;
}

export interface InstantTransfer {
  id: string;
  reference: string;
  recipient: TransferRecipient;
  amountMinor: number;
  currency: string;
  feeMinor: number;
  narration?: string;
  status: InstantTransferStatus;
  provider: PaymentProvider;
  /** True whenever this record was produced by the mock adapter. */
  isMock: boolean;
  createdAt: string; // ISO 8601
  completedAt?: string;
}

/* ------------------------------------------------------------------ *
 * Payment Request: asking a counterparty to send an instant payment
 * ------------------------------------------------------------------ */

export type PaymentRequestStatus = 'pending' | 'fulfilled' | 'declined' | 'expired' | 'cancelled';

export interface PaymentRequest {
  id: string;
  reference: string;
  requestedFromName: string;
  amountMinor: number;
  currency: string;
  reason?: string;
  status: PaymentRequestStatus;
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
}

/* ------------------------------------------------------------------ *
 * Trust Checkout: server-backed, shareable payment + trust context
 * ------------------------------------------------------------------ */

export type TrustCheckoutCategory =
  | 'product'
  | 'service'
  | 'supplier_order'
  | 'contract'
  | 'project'
  | 'rental'
  | 'custom';

export type TrustCheckoutPaymentMode = 'direct' | 'protected' | 'customer_choice';
export type TrustCheckoutStatus = 'active' | 'processing' | 'paid' | 'expired' | 'revoked';

export interface TrustCheckoutVerification {
  identityVerified: boolean;
  businessVerified: boolean;
  ownershipVerified: boolean;
  verifiedAt?: string;
  expiresAt?: string;
}

export interface TrustCheckout {
  id: string;
  publicId: string;
  businessId?: string;
  businessSlug: string;
  recipientName: string;
  recipientType: 'individual' | 'business';
  recipientNtId?: string;
  businessCategory?: string;
  registrationNumberMasked?: string;
  phone?: string;
  supportEmail?: string;
  account: { bankName: string; accountNumber: string; accountName: string };
  requestedFromName?: string;
  category: TrustCheckoutCategory;
  title: string;
  purpose: string;
  description?: string;
  amountMinor?: number;
  customerEntersAmount: boolean;
  currency: string;
  paymentMode: TrustCheckoutPaymentMode;
  deliveryExpectation?: string;
  evidenceRequirements: string[];
  milestones: string[];
  verification: TrustCheckoutVerification;
  status: TrustCheckoutStatus;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  paymentReference?: string;
}

export interface CreateTrustCheckoutInput {
  businessId?: string;
  businessSlug: string;
  recipientName: string;
  recipientType: 'individual' | 'business';
  recipientNtId?: string;
  businessCategory?: string;
  registrationNumberMasked?: string;
  phone?: string;
  supportEmail?: string;
  account: { bankName: string; accountNumber: string; accountName: string };
  verification: TrustCheckoutVerification;
  requestedFromName?: string;
  category: TrustCheckoutCategory;
  title: string;
  purpose: string;
  description?: string;
  amountMinor?: number;
  customerEntersAmount: boolean;
  currency: string;
  paymentMode: TrustCheckoutPaymentMode;
  expiresInMinutes: number;
  deliveryExpectation?: string;
  evidenceRequirements?: string[];
  milestones?: string[];
}

/* ------------------------------------------------------------------ *
 * Unified Transaction record: the shape the Transactions history
 * screen renders, aggregating instant transfers, protected deals,
 * wallet funding/withdrawals and fees behind one list/filter/detail UI.
 * ------------------------------------------------------------------ */

export type TransactionType =
  | 'instant_transfer'
  | 'incoming_transfer'
  | 'wallet_funding'
  | 'withdrawal'
  | 'protected_funding'
  | 'milestone_release'
  | 'final_release'
  | 'refund'
  | 'reversal'
  | 'fee';

export type TransactionMethod = 'instant' | 'protected';

export interface TransactionRecord {
  id: string;
  reference: string;
  type: TransactionType;
  method: TransactionMethod;
  amountMinor: number;
  feeMinor: number;
  currency: string;
  counterpartyName: string;
  /** Human-readable status label for this record's underlying status. */
  statusLabel: string;
  /** Admin-administration-only; never rendered to ordinary users. */
  provider: PaymentProvider;
  relatedDealId?: string;
  createdAt: string; // ISO 8601
}

/* ------------------------------------------------------------------ *
 * Business Network: saved counterparties (suppliers, buyers,
 * contractors, customers, agents). Factual, observable fields only , 
 * no "guaranteed safe"/"risk free" style claims belong on this model.
 * ------------------------------------------------------------------ */

export type CounterpartyRelation = 'supplier' | 'buyer' | 'contractor' | 'customer' | 'agent' | 'other';

export interface CounterpartyProfile {
  id: string;
  name: string;
  businessName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  avatarInitials: string;
  relation: CounterpartyRelation;
  identityVerified: boolean;
  businessVerified: boolean;
  /** ISO date this counterparty first transacted on the platform. */
  memberSince: string;
  completedDealsCount: number;
  hasPriorTransactionWithYou: boolean;
  averageResponseTimeHours?: number;
  resolvedDisputesCount: number;
  ratingAverage?: number;
  isFavourite: boolean;
  isBlocked: boolean;
}

/* ------------------------------------------------------------------ *
 * Trust Profile: observable platform-activity summary. Never framed
 * as a credit score; informational only, not a guarantee.
 * ------------------------------------------------------------------ */

export type VerificationLevel = 'unverified' | 'basic' | 'full';
export type BusinessVerificationLevel = 'none' | 'pending' | 'verified';

export interface TrustProfile {
  identityVerificationLevel: VerificationLevel;
  businessVerificationLevel: BusinessVerificationLevel;
  completedDealsCount: number;
  cancelledDealsCount: number;
  activeDealsCount: number;
  resolvedDisputesCount: number;
  repeatCounterpartiesCount: number;
  memberSince: string; // ISO date
  averageCompletionDays?: number;
  averageResponseTimeHours?: number;
  ratingAverage?: number;
  ratingCount: number;
}
