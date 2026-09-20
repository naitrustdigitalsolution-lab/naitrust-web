export interface LegalSelection {
  providerId: string;
  purpose: string;
  /** Legacy selected-document drafts only. New consent covers the entire document room. */
  documentIds?: string[];
  consent: boolean;
  acceptedTermsVersion?: string;
  acceptedFee?: { rateBps: number; principalMinor: number };
  documentVersionKeys?: string[];
}
export interface LegalProvider {
  id: string;
  ownerUserId: string;
  name: string;
  kind: 'individual' | 'business';
  enabled: boolean;
}
export interface LegalDocument {
  id: string;
  version: string;
  name: string;
  text?: string;
  fileUrl?: string;
}
export interface LegalFee {
  rateBps: number;
  principalMinor: number;
  platformFeeMinor: number;
  amountMinor: number;
  currency: string;
  payment?: { id: string; payerUserId: string; paidAt: string; simulated: true };
}
export interface LegalConsent {
  actorUserId: string;
  at: string;
  version: number;
  termsVersion: string;
  decision: 'approve' | 'decline' | 'remove' | 'withdraw';
  providerId: string;
  sharingScope?: 'deal_documents';
  documentVersions: string[];
  feeMinor: number;
}
export interface LegalProposal {
  sharingScope?: 'deal_documents';
  dealId: string;
  ownerUserId: string;
  partyUserIds: string[];
  payerUserId: string;
  reference: string;
  title: string;
  provider: LegalProvider;
  purpose: string;
  documents: LegalDocument[];
  version: number;
  fee: LegalFee;
  consents: LegalConsent[];
  removed: boolean;
  withdrawn: boolean;
  assignedAt?: string;
  findings: Array<{ id: string; authorUserId: string; text: string; at: string; version: number }>;
  requests: Array<{ id: string; actorUserId: string; text: string; at: string }>;
  events: Array<{ at: string; actorUserId: string; message: string }>;
}
/** Deliberately excludes party identities, documents, fee payer and bank data. */
export interface LegalAssignment {
  dealId: string;
  reference: string;
  title: string;
  purpose: string;
  version: number;
  status: string;
}
export interface AdminAuditEvent { id: string; actorUserId: string; at: string; action: string; target: string }
export interface AdminCase { assignedTo?: string; notes: Array<{ text: string; actorUserId: string; at: string }> }
