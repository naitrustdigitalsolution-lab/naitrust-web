export type SourcingWorkspaceTab = 'brief' | 'listing' | 'supplier' | 'quotes' | 'agent' | 'inspection' | 'payment' | 'logistics';
export type EvidenceStatus = 'extracted' | 'buyer_confirmed' | 'agent_confirmed' | 'disputed' | 'unknown';
export type EvidenceSource = 'buyer' | 'listing' | 'attachment' | 'public_source' | 'agent' | 'naitrust_operations';

export interface EvidenceField {
  id: string;
  label: string;
  value: string;
  source: EvidenceSource;
  sourceLabel: string;
  confidence: number;
  observedAt: string;
  status: EvidenceStatus;
  editable?: boolean;
}

export interface SourcingChatMessage {
  id: string;
  role: 'assistant' | 'buyer' | 'system';
  body: string;
  createdAt: string;
  attachments?: string[];
}

export interface SupplierQuote {
  id: string;
  supplier: string;
  unitPrice: string;
  moq: string;
  leadTime: string;
  incoterm: string;
  paymentTerms: string;
  status: 'recommended' | 'complete' | 'needs_clarification' | 'conflict';
  flags: string[];
}

export interface WorkspaceAgent {
  id: string;
  name: string;
  businessName?: string;
  city: string;
  rating: number;
  completedTasks: number;
  response: string;
  matchReasons: string[];
  status: 'recommended' | 'assigned' | 'overdue';
}

export interface InspectionItem {
  id: string;
  label: string;
  evidence: string;
  status: 'pending' | 'passed' | 'failed' | 'human_review';
}

export interface PaymentStage {
  id: string;
  label: string;
  percentage: number;
  beneficiary: string;
  evidence: string;
  status: 'locked' | 'buyer_review' | 'approved' | 'paid' | 'disputed';
}

export interface LogisticsQuote {
  id: string;
  provider: string;
  mode: 'Air' | 'Sea';
  price: string;
  eta: string;
  includes: string[];
  excludes: string[];
  status: 'recommended' | 'available' | 'exception';
}

export interface SourcingScenario {
  id: string;
  label: string;
  shortLabel: string;
  category: string;
  prompt: string;
  assistantSummary: string;
  notice?: { tone: 'warning' | 'danger' | 'info'; title: string; body: string };
  brief: EvidenceField[];
  listing: EvidenceField[];
  supplier: EvidenceField[];
  quotes: SupplierQuote[];
  agents: WorkspaceAgent[];
  inspection: InspectionItem[];
  payments: PaymentStage[];
  logistics: LogisticsQuote[];
  bilingualDraft: { english: string; chinese: string; approved: boolean };
}

export interface SourcingRunStep {
  id: string;
  label: string;
  status: 'waiting' | 'running' | 'complete';
}

export interface SourcingSession {
  id: string;
  ownerUserId: string;
  status: 'draft' | 'analysing' | 'needs_information' | 'agent_review' | 'ready_for_order' | 'closed';
  messages: SourcingChatMessage[];
  activeRunId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourcingAttachment {
  id: string;
  sessionId: string;
  fileName: string;
  mediaType: string;
  kind: 'image' | 'document' | 'spreadsheet' | 'audio' | 'url';
  scanStatus: 'pending' | 'safe' | 'rejected';
  evidenceUrl?: string;
}

export interface HumanApproval {
  id: string;
  sessionId: string;
  action: 'supplier_outreach' | 'negotiation_commitment' | 'create_order' | 'beneficiary_change' | 'inspection_acceptance' | 'milestone_release';
  actorUserId: string;
  status: 'pending' | 'approved' | 'rejected';
  decidedAt?: string;
}

export interface ToolExecution {
  id: string;
  sessionId: string;
  toolName: SourcingToolName;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  errorCode?: string;
}

export type SourcingToolName = typeof SOURCING_TOOL_NAMES[number];
export const SOURCING_TOOL_NAMES = [
  'extract_product_evidence', 'translate_trade_content', 'build_buying_brief',
  'identify_missing_requirements', 'assess_listing', 'compare_supplier_quotes',
  'find_verified_agents', 'draft_supplier_inquiry', 'draft_negotiation_response',
  'create_inspection_plan', 'calculate_landed_cost', 'summarize_order_activity',
  'recommend_milestone_action',
] as const;
