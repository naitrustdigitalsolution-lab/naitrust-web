export type CountryCode = 'CN' | 'NG';
export type CurrencyCode = 'NGN' | 'USD' | 'CNY';
export type PartnerKind = 'sourcing_agent' | 'supplier' | 'logistics_provider';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface SourceField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  source: 'link' | 'image' | 'buyer' | 'ai';
}

export interface SourcingRequest {
  id: string;
  ownerUserId: string;
  title: string;
  inputType: 'link' | 'image' | 'description';
  sourceUrl?: string;
  originalDescription?: string;
  category: string;
  quantity: number;
  destination: string;
  supplierName?: string;
  supplierCity?: string;
  supplierCountry: CountryCode;
  extractedFields: SourceField[];
  missingFields: string[];
  verificationStatus: 'not_started' | 'basic_scan' | 'deeper_review' | 'verified' | 'failed';
  status: 'draft' | 'needs_information' | 'ready_for_verification' | 'agent_matching' | 'quoted' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  profileType: 'individual' | 'company';
  businessName?: string;
  nationality: 'NG';
  yearsBasedInChina: number;
  city: string;
  country: 'CN';
  serviceRadiusKm: number;
  languages: string[];
  expertise: string[];
  services: string[];
  logisticsCapabilities: string[];
  verified: boolean;
  available: boolean;
  rating: number;
  completedTasks: number;
  responseMinutes: number;
  feeFromMinor: number;
  feeToMinor: number;
  feeCurrency: 'NGN';
  verificationSummary: string;
}

export interface AssignmentProductScope {
  id: string;
  productId?: string;
  productName: string;
  requirements: string[];
  status: 'pending' | 'checking' | 'passed' | 'changes_required';
}

export interface AssignmentMessage {
  id: string;
  senderRole: 'buyer' | 'agent' | 'admin';
  senderName: string;
  body: string;
  createdAt: string;
}

export interface AssignmentEvidence {
  id: string;
  productScopeId: string;
  kind: 'image' | 'video' | 'document' | 'note' | 'location';
  title: string;
  description: string;
  fileName?: string;
  createdAt: string;
  submittedBy: string;
}

export interface PaymentMilestone {
  id: string;
  label: string;
  percent: number;
  amountMinor: number;
  currency: 'NGN';
  requiredEvidence: string[];
  status: 'pending' | 'recommended' | 'changes_requested' | 'approved' | 'paid' | 'disputed';
}

export interface ReadinessCertification {
  id: string;
  assignmentId: string;
  milestoneId: string;
  checks: string[];
  declaration: string;
  submittedByAgentId: string;
  submittedAt: string;
  status: 'buyer_review' | 'changes_requested' | 'approved' | 'disputed' | 'settled';
  buyerDecisionAt?: string;
}

export interface AgentAssignment {
  id: string;
  ownerUserId: string;
  agentId: string;
  supplierId?: string;
  supplierName: string;
  supplierCity: string;
  relatedOrderId?: string;
  relatedSourcingRequestId?: string;
  title: string;
  scope: string;
  deadline: string;
  feeMinor: number;
  feeCurrency: 'NGN';
  status: 'invited' | 'accepted' | 'in_progress' | 'evidence_submitted' | 'release_requested' | 'changes_requested' | 'completed' | 'cancelled';
  productScopes: AssignmentProductScope[];
  messages: AssignmentMessage[];
  evidence: AssignmentEvidence[];
  milestones: PaymentMilestone[];
  certifications: ReadinessCertification[];
  createdAt: string;
  updatedAt: string;
}

export interface PartnerApplication {
  id: string;
  kind: PartnerKind;
  companyName?: string;
  contactName: string;
  email: string;
  phone: string;
  country: CountryCode;
  city: string;
  languages: string[];
  services: string[];
  routes?: string[];
  licences?: string[];
  insuranceSummary?: string;
  capacitySummary?: string;
  experience: string;
  status: ReviewStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface LogisticsProvider {
  id: string;
  name: string;
  country: CountryCode;
  cities: string[];
  routes: string[];
  services: string[];
  cargoCategories: string[];
  priceFromMinor: number;
  priceToMinor: number;
  currency: 'NGN';
  verified: boolean;
  status: 'active' | 'paused' | 'suspended';
  rating: number;
  completedShipments: number;
  insuranceSummary: string;
  verificationSummary: string;
  linkedAgentId?: string;
}

export interface ShipmentOrderItem {
  orderId: string;
  reference: string;
  supplierName: string;
  supplierCity: string;
  packageCount: number;
  weightKg: number;
  ready: boolean;
}

export interface CustodyEvent {
  id: string;
  label: string;
  fromParty: string;
  toParty: string;
  packageCount: number;
  weightKg: number;
  sealNumbers: string[];
  condition: string;
  occurredAt: string;
}

export interface ShippingQuote {
  id: string;
  providerId: string;
  amountMinor: number;
  currency: 'NGN';
  mode: 'air' | 'sea';
  estimatedDays: number;
  expiresAt: string;
  includedServices: string[];
  status: 'ready' | 'accepted' | 'declined' | 'expired';
}

export interface ShipmentBatch {
  id: string;
  ownerUserId: string;
  reference: string;
  name: string;
  destination: string;
  orders: ShipmentOrderItem[];
  quotes: ShippingQuote[];
  selectedQuoteId?: string;
  status: 'draft' | 'quote_requested' | 'booked' | 'pickup' | 'consolidating' | 'exported' | 'in_transit' | 'customs' | 'local_delivery' | 'delivered' | 'claim_open';
  custodyEvents: CustodyEvent[];
  createdAt: string;
  updatedAt: string;
}

export type LedgerEntryKind = 'customer_funding' | 'product_allocation' | 'agent_fee' | 'verification_fee' | 'logistics_allocation' | 'fx_conversion' | 'supplier_settlement' | 'refund';

export interface OrderLedgerEntry {
  id: string;
  ownerUserId: string;
  orderId: string;
  kind: LedgerEntryKind;
  label: string;
  amountMinor: number;
  currency: CurrencyCode;
  direction: 'in' | 'out' | 'reserved';
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  providerReference?: string;
  createdAt: string;
}

export interface RewardEntry {
  id: string;
  ownerUserId: string;
  points: number;
  kind: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  label: string;
  relatedId?: string;
  createdAt: string;
}

export interface WaitlistLead {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  businessName?: string;
  role: 'buyer' | 'supplier' | 'both';
  markets: CountryCode[];
  categories: string[];
  needs: string[];
  status: 'new' | 'contacted' | 'qualified' | 'invited' | 'closed';
  ownerAdminId?: string;
  notes: string[];
  createdAt: string;
}

export interface ModerationCase {
  id: string;
  ownerUserId: string;
  sourceType: 'message' | 'image' | 'document' | 'audio';
  reason: string;
  excerpt: string;
  status: 'open' | 'cleared' | 'actioned';
  createdAt: string;
}

export interface AdminAuditEvent {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface OperationsDatabase {
  version: 2;
  sourcingRequests: SourcingRequest[];
  agents: AgentProfile[];
  favouriteAgents: Array<{ ownerUserId: string; agentId: string; createdAt: string }>;
  assignments: AgentAssignment[];
  partnerApplications: PartnerApplication[];
  logisticsProviders: LogisticsProvider[];
  shipments: ShipmentBatch[];
  ledgerEntries: OrderLedgerEntry[];
  rewardEntries: RewardEntry[];
  waitlistLeads: WaitlistLead[];
  moderationCases: ModerationCase[];
  auditEvents: AdminAuditEvent[];
}
