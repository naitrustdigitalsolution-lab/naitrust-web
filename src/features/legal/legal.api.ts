import { resolveEvidenceFile } from '../../libs/protected-deals/evidence-files';
import users from '../../mocks/apis/auth-users.json';
import businesses from '../../mocks/apis/businesses.json';
import transactions from '../../mocks/apis/transactions.json';
import { appConfig } from '../../configs/env';
import { useAuthStore } from '../../libs/store/auth.store';
import { findMockCreatedDeal, getMockDealRuntime, listMockCreatedDeals } from '../../libs/api/mock-protected-deal-store';
import { mockParticipantUserId } from '../../libs/api/mock-deal-participants';
import { mockDealParticipantUserIds } from '../../libs/api/mock-deal-access';
import { dealDetailApi, getLegalRoomDocuments } from '../../libs/api/deal-detail.api';
import type { AgreementDraft, SafeDealSummary, SafeDealDetail } from '../../libs/store/types';
import { accountSuspended, adminActor, mockActor, readLocal, writeLocal } from './access';
import type { AdminAuditEvent, AdminCase, LegalAssignment, LegalConsent, LegalDocument, LegalProposal, LegalProvider, LegalSelection } from './types';

import { LEGAL_TERMS_VERSION, LEGAL_SHARING_SCOPE } from './terms';
export { LEGAL_TERMS_VERSION } from './terms';
const closed = ['release_approved', 'paid_out', 'completed', 'refunded', 'cancelled'];
const unfunded = ['draft', 'pending_counterparty', 'terms_negotiation', 'terms_agreed', 'awaiting_funding'];
const now = () => new Date().toISOString();
const adminId = 'usr_mock_005';
const configKey = `naitrust:admin:${adminId}:legal-config`;
const auditKey = `naitrust:admin:${adminId}:legal-audit`;
const proposalKey = (owner: string, id: string) => `naitrust:account:${owner}:legal:${id}`;
function summaries(): SafeDealSummary[] {
  const all = new Map((transactions.data as SafeDealSummary[]).map(d => [d.id, d]));
  listMockCreatedDeals().forEach(d => all.set(d.summary.id, d.summary));
  return [...all.values()].map(d => ({ ...d, status: getMockDealRuntime(d.id)?.status ?? d.status }));
}
function summary(id: string) {
  const d = summaries().find(d => d.id === id);
  if (!d?.createdByUserId) throw new Error('Deal not found.');
  return d;
}
function parties(id: string) {
  const d = summary(id);
  const created = findMockCreatedDeal(id);
  return [...new Set([d.createdByUserId!, ...(created ? created.input.participants.map(mockParticipantUserId).filter((x): x is string => !!x) : mockDealParticipantUserIds(id))])];
}
function party(id: string) {
  const actor = mockActor();
  if (!parties(id).includes(actor.id)) throw new Error('Only the two deal parties can manage legal review.');
  return actor;
}
function assertOpen(id: string) { if (closed.includes(summary(id).status)) throw new Error('Legal review is closed for this deal.'); }
function sampleProposal(d: SafeDealSummary): LegalProposal | null {
  if (!['deal_adaeze_emeka_02', 'deal_adaeze_emeka_04'].includes(d.id)) return null;
  const provider = allProviders().find(p => p.id === 'biz_mock_legal');
  if (!provider) return null;
  const at = '2026-09-20T00:00:00Z';
  const paid = d.id.endsWith('_02');
  const ids = ['usr_mock_003', 'usr_mock_004'];
  return { sharingScope: LEGAL_SHARING_SCOPE, dealId: d.id, ownerUserId: 'usr_mock_003', partyUserIds: ids, payerUserId: 'usr_mock_003', reference: d.reference, title: d.title, provider,
    purpose: 'Sample assignment: review the sample invoice.', version: 1,
    documents: [{ id: 'sample-invoice', version: '1', name: 'Sample invoice.txt', text: 'Fictional invoice supplied for the legal review example. No actual goods or legal services are represented.' }],
    fee: { rateBps: 100, principalMinor: d.amountMinor, platformFeeMinor: 0, amountMinor: legalFeeMinor(d.amountMinor,100), currency: d.currency, payment: paid ? { id: 'demo-legal-fee', payerUserId: ids[0], paidAt: at, simulated: true } : undefined },
    consents: ids.map(actorUserId => ({ actorUserId, at, version: 1, termsVersion: LEGAL_TERMS_VERSION, sharingScope: LEGAL_SHARING_SCOPE, decision: 'approve', providerId: provider.id, documentVersions: ['sample-invoice:1'], feeMinor: legalFeeMinor(d.amountMinor,100) })),
    removed: false, withdrawn: false, assignedAt: at, findings: [], requests: [], events: [{ at, actorUserId: 'usr_mock_005', message: 'Fictional historical assignment seeded with a 1% example rate; this is not the current platform rate.' }] };
}
function readProposal(id: string) { const d = summary(id); return readLocal<LegalProposal | null>(proposalKey(d.createdByUserId!, id), sampleProposal(d)); }
function save(p: LegalProposal) {
  writeLocal(proposalKey(p.ownerUserId, p.dealId), p);
  const event = p.events[p.events.length - 1];
  if (event) p.partyUserIds.forEach(id => { const key = `naitrust:account:${id}:legal-alerts`; const alerts = readLocal<Array<{ id: string; userId: string; type: 'deal'; title: string; message: string; link: string; read: boolean; createdAt: string }>>(key, []); writeLocal(key, [{ id: crypto.randomUUID(), userId: id, type: 'deal', title: 'Legal review update', message: event.message, link: `/app/deals/${p.dealId}`, read: false, createdAt: event.at }, ...alerts].slice(0, 100)); });
}
function record(p: LegalProposal, message: string) { p.events.push({ at: now(), actorUserId: mockActor().id, message }); }
function audit(action: string, target: string) {
  const event: AdminAuditEvent = { id: crypto.randomUUID(), actorUserId: mockActor().id, at: now(), action, target };
  writeLocal(auditKey, [...readLocal<AdminAuditEvent[]>(auditKey, []), event]);
}
export function legalFeeMinor(principal: number, bps: number) {
  if (!Number.isSafeInteger(principal) || principal < 0 || !Number.isSafeInteger(bps) || bps < 0 || bps > 10000) throw new Error('Invalid legal fee configuration.');
  const value = (BigInt(principal) * BigInt(bps) + 5000n) / 10000n;
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Fee is too large.');
  return Number(value);
}
export function legalRate(): number | null { return appConfig.isMock ? readLocal<{ rateBps: number | null }>(configKey, { rateBps: null }).rateBps : null; }
function allProviders(): LegalProvider[] {
  return [
    ...businesses.data.map(b => ({ id: b.id, ownerUserId: b.ownerUserId, name: b.name, kind: 'business' as const })),
    ...users.users.filter(u => u.user.role === 'customer').map(({ user }) => ({ id: user.id, ownerUserId: user.id, name: user.name, kind: 'individual' as const })),
  ].map(p => ({ ...p, enabled: readLocal(`naitrust:legal-provider:${p.id}`, { enabled: p.id === 'biz_mock_legal' }).enabled && !accountSuspended(p.ownerUserId) }));
}
export function hasLegalWorkspace(user = useAuthStore.getState().user) {
  return appConfig.isMock && !!user && ['customer', 'business'].includes(user.role) && allProviders().some(p => p.enabled && p.ownerUserId === user.id && (p.kind === 'business' ? user.role === 'business' : user.role === 'customer'));
}
export function legalStatus(p: LegalProposal): string {
  if (!p.sharingScope && closed.includes(summary(p.dealId).status)) return 'Closed';
  if (p.removed) return 'Deactivated';
  if (!allProviders().some(x => x.id === p.provider.id && x.enabled)) return 'Reviewer unavailable';
  if (p.withdrawn) return 'Consent withdrawn';
  const responses = p.partyUserIds.map(id => p.consents.filter(c => c.version === p.version && c.actorUserId === id && c.decision !== 'remove').slice(-1)[0]).filter((c): c is LegalConsent => !!c);
  if (responses.some(c => c.decision === 'decline')) return 'Declined';
  if (!p.partyUserIds.every(id => responses.some(c => c.actorUserId === id && c.decision === 'approve'))) return 'Awaiting both parties';
  return p.fee.payment ? 'Active' : 'Awaiting fee payment';
}
export function legalFundingBlocked(id: string) {
  if (!appConfig.isMock) return false;
  const p = readProposal(id);
  return !!p && !p.removed && !['Active', 'Awaiting fee payment'].includes(legalStatus(p));
}
export function settleLegalFunding(id: string) {
  if (!appConfig.isMock) return;
  party(id);
  if (legalFundingBlocked(id)) throw new Error('Both parties must approve legal review or jointly remove it before funding.');
  const p = readProposal(id);
  if (p && !p.removed) pay(p);
}
function pay(p: LegalProposal) {
  const actor = party(p.dealId); assertOpen(p.dealId);
  if (actor.id !== p.payerUserId) throw new Error('Only the deal payer can pay the legal fee.');
  if (p.fee.payment) return;
  if (legalStatus(p) !== 'Awaiting fee payment') throw new Error('Both parties must approve before payment.');
  p.fee.payment = { id: crypto.randomUUID(), payerUserId: actor.id, paidAt: now(), simulated: true };
  record(p, 'Simulated legal fee payment recorded. No real money moved.'); save(p);
}
function consentRecord(p: LegalProposal, decision: LegalConsent['decision']): LegalConsent {
  return { actorUserId: mockActor().id, at: now(), version: p.version, termsVersion: LEGAL_TERMS_VERSION, decision, providerId: p.provider.id, sharingScope: p.sharingScope, documentVersions: p.sharingScope ? [] : p.documents.map(d => `${d.id}:${d.version}`), feeMinor: p.fee.amountMinor };
}
export function agreementLegalDocument(agreement: AgreementDraft): LegalDocument {
  const text = agreement.sections.map(s => `${s.heading}\n${s.body}`).join('\n\n');
  let hash = 2166136261; for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return { id: 'agreement', version: `${agreement.version}-${(hash >>> 0).toString(16)}`, name: `Agreement v${agreement.version}`, text };
}
export function legalDocuments(deal: SafeDealDetail): LegalDocument[] {
  return [agreementLegalDocument(deal.agreement), ...deal.evidence.filter(e => !e.notApplicable).map(e => ({ id: e.id, version: e.createdAt, name: e.fileName, text: e.note, fileUrl: e.fileUrl }))];
}
export function assertLegalReviewerAccess(id: string): LegalProposal {
  const actor = mockActor();
  const p = readProposal(id);
  if (!hasLegalWorkspace(actor) || !p || p.provider.ownerUserId !== actor.id || !p.assignedAt || legalStatus(p) !== 'Active') throw new Error('Document access is unavailable.');
  return p;
}
export const legalApi = {
  providers() { mockActor(); return allProviders().filter(p => p.enabled); },
  get(id: string) { party(id); return readProposal(id); },
  async propose(id: string, input: LegalSelection) {
    const actor = party(id); assertOpen(id);
    const ids = parties(id);
    if (ids.length !== 2) throw new Error('Legal preview requires two registered deal parties.');
    const rate = legalRate();
    if (rate === null) throw new Error('An admin must configure the legal fee first.');
    const requestedVersion = readProposal(id)?.version;
    const provider = allProviders().find(p => p.enabled && p.id === input.providerId);
    if (!provider || ids.includes(provider.ownerUserId)) throw new Error('Choose an independent Naitrust approved legal reviewer.');
    if (!input.purpose.trim() || input.purpose.length > 2000 || !input.consent || input.acceptedTermsVersion !== LEGAL_TERMS_VERSION) throw new Error('Describe the purpose and explicitly approve the sharing terms.');
    const previous = readProposal(id);
    if (previous?.sharingScope && previous.assignedAt && !previous.removed && !previous.withdrawn) throw new Error('Both parties must deactivate the current legal reviewer before replacing this proposal.');
    if (previous?.fee.payment && previous.provider.id !== provider.id) throw new Error('Contact an administrator to handle a paid reviewer replacement.');
    const deal = (await dealDetailApi.getOne(id)).data;
    if (!deal) throw new Error('Deal unavailable.');
    // Recheck after the asynchronous read; never accept a suspended actor or stale identity.
    if (party(id).id !== actor.id) throw new Error('Your session changed. Try again.');
    assertOpen(id);
    if (readProposal(id)?.version !== requestedVersion || legalRate() !== rate || !allProviders().some(p => p.id === provider.id && p.enabled)) throw new Error('The proposal or pricing changed. Try again.');
    const effectiveRate = previous?.fee.payment ? previous.fee.rateBps : rate;
    if (input.acceptedFee?.rateBps !== effectiveRate || input.acceptedFee?.principalMinor !== deal.amountMinor) throw new Error('Pricing changed. Review the current fee and approve again.');

    const creatorIsPayer = deal.parties.find(p => p.isYou)?.role === 'buyer';
    const payerUserId = creatorIsPayer ? actor.id : ids.find(x => x !== actor.id)!;
    const p: LegalProposal = {
      dealId: id, ownerUserId: summary(id).createdByUserId!, partyUserIds: ids, payerUserId,
      reference: deal.reference, title: deal.title, provider, purpose: input.purpose.trim(), documents: legalDocuments(deal), sharingScope: LEGAL_SHARING_SCOPE,
      version: (previous?.version ?? 0) + 1,
      fee: previous?.fee.payment ? previous.fee : { rateBps: rate, principalMinor: deal.amountMinor, platformFeeMinor: 0, amountMinor: legalFeeMinor(deal.amountMinor, rate), currency: deal.currency },
      consents: previous?.consents ?? [], removed: false, withdrawn: false,
      findings: previous?.findings ?? [], requests: previous?.requests ?? [], events: previous?.events ?? [],
    };
    p.consents.push(consentRecord(p, 'approve')); record(p, 'Legal proposal submitted. Sharing waits for both parties and payment.'); save(p); return p;
  },
  respond(id: string, version: number, decision: LegalConsent['decision'], checked: boolean, acceptedTermsVersion?: string) {
    const actor = party(id);
    if (decision !== 'remove') assertOpen(id);
    const p = readProposal(id);
    if (!p || p.version !== version) throw new Error('This proposal changed. Review the latest version.');
    if (!checked) throw new Error('Explicit confirmation is required.');
    if (decision === 'approve' && p.sharingScope && acceptedTermsVersion !== LEGAL_TERMS_VERSION) throw new Error('Read and accept the current legal terms first.');
    if (p.sharingScope && decision === 'withdraw') throw new Error('Both parties must confirm deactivation.');
    if (p.sharingScope && p.assignedAt && decision === 'decline') throw new Error('An appointed reviewer can only be deactivated by both parties.');
    if (decision === 'approve' && (p.withdrawn || p.removed || !allProviders().some(x => x.id === p.provider.id && x.enabled))) throw new Error('Submit a new proposal before approving.');
    if (decision === 'withdraw') { p.withdrawn = true; p.assignedAt = undefined; }
    // Keep all decisions in the audit; use the latest decision per party when evaluating consent.
    p.consents.push(consentRecord(p, decision));
    if (decision === 'remove') {
      const removals = p.partyUserIds.map(uid => p.consents.filter(c => c.version === version && c.actorUserId === uid).slice(-1)[0]).filter(c => c?.decision === 'remove');
      if (p.partyUserIds.every(uid => removals.some(c => c.actorUserId === uid))) p.removed = true;
    }
    if (decision === 'decline' || p.removed) p.assignedAt = undefined;
    if (decision === 'approve' && p.partyUserIds.every(uid => p.consents.filter(c => c.version === version && c.actorUserId === uid && c.decision !== 'remove').slice(-1)[0]?.decision === 'approve')) p.assignedAt = now();
    record(p, decision === 'remove' ? (p.removed ? 'Both parties confirmed deactivation. Legal access has ended.' : `${actor.name} requested deactivation. Access continues until the other party confirms.`) : `${actor.name}: ${decision}.`); save(p); return p;
  },
  pay(id: string) { const p = this.get(id); if (!p) throw new Error('No legal proposal.'); if (unfunded.includes(summary(id).status)) throw new Error('Pay this fee with the deal funding.'); pay(p); },
  request(id: string, text: string) { party(id); const p = readProposal(id); if (!p || legalStatus(p) !== 'Active' || !text.trim()) throw new Error('An active assignment and request are required.'); p.requests.push({ id: crypto.randomUUID(), actorUserId: mockActor().id, text: text.trim().slice(0, 4000), at: now() }); record(p, 'A document review was requested.'); save(p); },
  assignments(): LegalAssignment[] {
    const actor = mockActor(); if (!hasLegalWorkspace(actor)) throw new Error('Approved lawyer access is required.');
    return summaries().flatMap(d => { const p = readProposal(d.id); return p?.assignedAt && p.provider.ownerUserId === actor.id ? [{ dealId: p.dealId, reference: p.reference, title: p.title, purpose: p.purpose, version: p.version, status: legalStatus(p) }] : []; });
  },
  reviewerView(id: string) {
    const p = assertLegalReviewerAccess(id);
    // Return current room documents for room-wide consent, retaining legacy scope until re-approved.
    return { dealId: id, title: p.title, reference: p.reference, purpose: p.purpose, version: p.version, documents: (p.sharingScope ? getLegalRoomDocuments(id) : p.documents).map(d => ({ id: d.id, version: d.version, name: d.name })), requests: p.requests.map(r => ({ text: r.text, at: r.at })), findings: p.findings.map(f => ({ text: f.text, at: f.at, version: f.version })) };
  },
  async document(id: string, documentId: string, version: number) {
    this.reviewerView(id); const p = readProposal(id)!;
    if (p.version !== version) throw new Error('The approved document selection changed.');
    const document = (p.sharingScope ? getLegalRoomDocuments(id) : p.documents).find(d => d.id === documentId);
    if (!document) throw new Error('This document is not part of the authorised room.');
    record(p, `Reviewer viewed ${document.name} (${document.version}).`); save(p);
    const result = { ...document, fileUrl: document.fileUrl ? await resolveEvidenceFile(document.fileUrl) : undefined };
    this.reviewerView(id);
    if (readProposal(id)?.version !== version) throw new Error("The proposal changed.");
    return result;
  },
  finding(id: string, version: number, text: string) {
    this.reviewerView(id); const p = readProposal(id)!;
    if (p.version !== version || !text.trim()) throw new Error('Review the current proposal and enter findings.');
    p.findings.push({ id: crypto.randomUUID(), authorUserId: mockActor().id, text: text.trim().slice(0, 10000), at: now(), version }); record(p, 'Reviewer submitted findings. Findings do not certify authenticity.'); save(p);
  },
};
export const legalAdminApi = {
  accounts() { adminActor(); return users.users.map(({ user }) => ({ ...user, suspended: accountSuspended(user.id), businesses: businesses.data.filter(b => b.ownerUserId === user.id).map(b => ({ id: b.id, name: b.name })) })); },
  providers() { adminActor(); return allProviders(); },
  setProvider(id: string, enabled: boolean) {
    adminActor(); const p = allProviders().find(p => p.id === id); if (!p) throw new Error('Provider not found.');
    writeLocal(`naitrust:legal-provider:${id}`, { enabled }); audit(enabled ? 'Lawyer capability granted' : 'Lawyer capability revoked', id);
    summaries().forEach(d => { const proposal = readProposal(d.id); if (proposal?.provider.id === id) { if (!enabled) { proposal.withdrawn = true; proposal.assignedAt = undefined; } record(proposal, enabled ? 'Provider enabled. A new proposal is required to restore revoked access.' : 'Naitrust revoked reviewer access. Contact support to arrange a replacement.'); save(proposal); } });
  },
  setRate(rateBps: number) { adminActor(); legalFeeMinor(0, rateBps); writeLocal(configKey, { rateBps }); audit(`Legal rate set to ${rateBps} basis points`, 'legal-fee'); },
  suspend(id: string, suspended: boolean) { const actor = adminActor(); if (id === actor.id || !users.users.some(u => u.user.id === id)) throw new Error('Choose another existing account.'); writeLocal(`naitrust:account-control:${id}`, { suspended }); audit(suspended ? 'Account suspended' : 'Account restored', id); },
  deals() { adminActor(); return summaries(); },
  proposals() { adminActor(); return summaries().flatMap(d => { const p = readProposal(d.id); return p ? [p] : []; }); },
  audit() { adminActor(); return readLocal<AdminAuditEvent[]>(auditKey, []).slice().reverse(); },
  case(id: string) { adminActor(); summary(id); return readLocal<AdminCase>(`naitrust:admin:${adminId}:case:${id}`, { notes: [] }); },
  updateCase(id: string, assignedTo: string, note: string) { adminActor(); if (assignedTo && !users.users.some(u => u.user.id === assignedTo && u.user.role === 'admin')) throw new Error('Assign cases to Naitrust admins.'); const c = this.case(id); c.assignedTo = assignedTo || undefined; if (note.trim()) c.notes.push({ text: note.trim().slice(0, 4000), actorUserId: mockActor().id, at: now() }); writeLocal(`naitrust:admin:${adminId}:case:${id}`, c); audit('Case assignment / note updated', id); },
};
