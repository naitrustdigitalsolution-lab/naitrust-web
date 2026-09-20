import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Check, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { appConfig } from '../../configs/env';
import { useAuthStore } from '../../libs/store/auth.store';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import type { SafeDealDetail } from '../../libs/store/types';
import { useLegalRefresh } from './hooks';
import { legalApi, legalFeeMinor, legalRate, legalStatus } from './legal.api';
import { LEGAL_TERMS_VERSION } from './terms';
import { LegalTermsModal } from './LegalTermsModal';
import type { LegalFee, LegalSelection } from './types';

export function LegalFeeSummary({ fee }: { fee: LegalFee }) {
  return <dl className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-sm"><dt>Deal principal</dt><dd>{formatMinorAmount(fee.principalMinor, fee.currency)}</dd><dt>Platform fee</dt><dd>{formatMinorAmount(fee.platformFeeMinor, fee.currency)}</dd><dt>Additional legal fee ({fee.rateBps / 100}%)</dt><dd>{formatMinorAmount(fee.amountMinor, fee.currency)}</dd><dt className="font-semibold">Total payable by payer</dt><dd className="font-semibold">{formatMinorAmount(fee.principalMinor + fee.platformFeeMinor + fee.amountMinor, fee.currency)}</dd></dl>;
}

export function LegalSelectionForm({ value, onChange, amountMinor, fee, currency = 'NGN', showToggle = true }: {
  value?: LegalSelection; onChange: (v?: LegalSelection) => void; amountMinor: number; fee?: LegalFee; currency?: string; showToggle?: boolean;
}) {
  useLegalRefresh();
  const [termsOpen, setTermsOpen] = useState(false);
  const providers = appConfig.isMock ? legalApi.providers() : [];
  const rate = fee?.rateBps ?? legalRate();
  useEffect(() => {
    if (value?.consent && (value.acceptedFee?.principalMinor !== amountMinor || value.acceptedFee?.rateBps !== rate || value.acceptedTermsVersion !== LEGAL_TERMS_VERSION)) onChange({ ...value, consent: false });
  }, [amountMinor, onChange, rate, value]);
  const update = (patch: Partial<LegalSelection>) => onChange({ ...value!, ...patch, consent: false });
  const provider = providers.find(p => p.id === value?.providerId);
  const quote = fee ?? (rate !== null ? { rateBps: rate, principalMinor: amountMinor, amountMinor: legalFeeMinor(amountMinor, rate), platformFeeMinor: 0, currency } : undefined);
  const ready = !!provider && !!value?.purpose.trim() && !!quote;
  return <div className="space-y-4">
    {showToggle && <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked ? { providerId: '', purpose: '', consent: false } : undefined)} />Add legal reviewer</label>}
    {value && <>
      <p className="text-sm text-muted-foreground">Approve once. Your reviewer can access this room’s existing and future documents until you both deactivate access.</p>
      {rate === null && <p role="alert" className="text-sm text-amber-700">Legal pricing is not available yet. Contact Naitrust.</p>}
      <label className="block text-sm">Approved lawyer or law firm<select aria-label="Approved lawyer or law firm" className="mt-1 w-full rounded-md border bg-background p-2" value={value.providerId} onChange={e => update({ providerId: e.target.value })}><option value="">Choose a reviewer</option>{providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label className="block text-sm">Purpose of legal review<Textarea aria-label="Purpose of legal review" rows={2} maxLength={2000} value={value.purpose} onChange={e => update({ purpose: e.target.value })} placeholder="What would you like legal support with?" /></label>
      {quote && <p className="text-sm">Additional legal fee: <strong>{formatMinorAmount(quote.amountMinor, quote.currency)} ({quote.rateBps / 100}%)</strong><span className="text-muted-foreground"> · Paid by the deal payer</span></p>}
      <Button type="button" variant="outline" disabled={!ready} onClick={() => setTermsOpen(true)}>{value.consent ? <Check size={16} /> : <FileText size={16} />}{value.consent ? 'Legal terms accepted' : 'Read legal terms'}</Button>
      {termsOpen && ready && <LegalTermsModal key={`${provider!.id}:${value.purpose}:${quote!.rateBps}:${amountMinor}`} open onOpenChange={setTermsOpen} providerName={provider!.name} purpose={value.purpose} fee={quote!} onAccept={() => { onChange({ ...value, consent: true, acceptedTermsVersion: LEGAL_TERMS_VERSION, acceptedFee: { rateBps: quote!.rateBps, principalMinor: amountMinor } }); setTermsOpen(false); }} />}
    </>}
  </div>;
}

export function LegalReviewPanel({ deal }: { deal: SafeDealDetail }) {
  useLegalRefresh();
  const queryClient = useQueryClient();
  const actor = useAuthStore(s => s.user);
  const [editing, setEditing] = useState(false);
  const [selection, setSelection] = useState<LegalSelection>();
  const [termsOpen, setTermsOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [request, setRequest] = useState('');
  const [busy, setBusy] = useState(false);
  const proposal = appConfig.isMock ? legalApi.get(deal.id) : null;
  useEffect(() => { setTermsOpen(false); setDeactivateOpen(false); }, [proposal?.version, actor?.id]);
  if (!appConfig.isMock) return null;
  const isClosed = ['release_approved', 'paid_out', 'completed', 'refunded', 'cancelled'].includes(deal.status);
  const status = proposal ? legalStatus(proposal) : 'Not requested';
  const appointed = !!proposal?.assignedAt && !proposal.removed && !proposal.withdrawn;
  const approvedByYou = proposal?.consents.filter(c => c.version === proposal.version && c.actorUserId === actor?.id && c.decision !== 'remove').slice(-1)[0]?.decision === 'approve';
  const removalBy = proposal?.partyUserIds.filter(id => proposal.consents.filter(c => c.version === proposal.version && c.actorUserId === id).slice(-1)[0]?.decision === 'remove') ?? [];
  const requestedRemoval = removalBy.includes(actor?.id ?? '');
  const canEdit = !isClosed && (!appointed || !proposal?.sharingScope);
  const act = async (fn: () => unknown) => { setBusy(true); try { await fn(); await queryClient.invalidateQueries(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not update legal review.'); } finally { setBusy(false); } };
  return <Card className="gap-0 space-y-4 p-5" data-testid="legal-review-panel">
    <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Legal review</h2><span className="text-xs text-muted-foreground">{status}</span></div>
    {proposal && <>
      <div><p className="text-sm font-medium">{proposal.provider.name}</p><p className="mt-1 text-sm text-muted-foreground">{proposal.purpose}</p></div>
      <p className="text-xs text-muted-foreground">{proposal.sharingScope ? 'Existing and future room documents are shared automatically once legal access is active.' : 'This older proposal covers selected files. Update legal access to include future uploads.'}</p>
      <p className="text-sm">{formatMinorAmount(proposal.fee.amountMinor, proposal.fee.currency)} legal fee · {proposal.fee.payment ? 'Payment record pending provider confirmation' : `${proposal.fee.rateBps / 100}% · Payable by the payer`}</p>
      {!isClosed && !appointed && !proposal.removed && !proposal.withdrawn && proposal.sharingScope && <div className="flex flex-wrap gap-2">{!approvedByYou ? <><Button size="sm" disabled={busy} onClick={() => setTermsOpen(true)}>Review legal proposal</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => void act(() => legalApi.respond(deal.id, proposal.version, 'decline', true))}>Decline</Button></> : <p className="text-sm text-muted-foreground">You approved. Waiting for the other party.</p>}</div>}
      {status === 'Awaiting fee payment' && actor?.id === proposal.payerUserId && <p className="text-sm text-muted-foreground">Legal fee payment will be available when payment services are connected.</p>}
      {removalBy.length > 0 && !proposal.removed && <p className="text-sm text-amber-700">{requestedRemoval ? 'Deactivation requested. Waiting for the other party.' : 'The other party requested deactivation.'} Access stays on until you both confirm.</p>}
      {(appointed || (!proposal.removed && !isClosed)) && <Button size="sm" variant="outline" disabled={busy || requestedRemoval} onClick={() => setDeactivateOpen(true)}>{removalBy.length > 0 ? 'Confirm deactivation' : 'Request deactivation'}</Button>}
      {status === 'Active' && <details className="text-sm"><summary className="cursor-pointer font-medium">Ask your legal reviewer</summary><div className="mt-3 space-y-2"><Input aria-label="Request document review" value={request} maxLength={4000} onChange={e => setRequest(e.target.value)} placeholder="What would you like reviewed?" /><Button size="sm" disabled={busy || !request.trim()} onClick={() => void act(() => { legalApi.request(deal.id, request); setRequest(''); })}>Send request</Button></div></details>}
      {proposal.findings.map(f => <div key={f.id} className="rounded-lg border p-3 text-sm"><strong>Reviewer findings</strong><p className="whitespace-pre-wrap">{f.text}</p></div>)}
      <details className="text-xs"><summary className="cursor-pointer">Details & history</summary><div className="mt-3 space-y-3"><LegalFeeSummary fee={proposal.fee} />{proposal.requests.map(r => <p key={r.id}>Review request: {r.text}</p>)}{proposal.events.map((e, i) => <p key={i}>{new Date(e.at).toLocaleString()} — {e.message}</p>)}</div></details>
      {termsOpen && <LegalTermsModal key={`${proposal.version}:${actor?.id}`} open onOpenChange={setTermsOpen} providerName={proposal.provider.name} purpose={proposal.purpose} fee={proposal.fee} busy={busy} onAccept={() => void act(() => { legalApi.respond(deal.id, proposal.version, 'approve', true, LEGAL_TERMS_VERSION); setTermsOpen(false); })} />}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}><DialogContent><DialogHeader><DialogTitle>Deactivate legal access?</DialogTitle><DialogDescription>{removalBy.length > 0 ? 'Your confirmation will end this reviewer’s access to the room.' : 'We’ll ask the other party to confirm. Your reviewer keeps access until both of you agree.'} Previously obtained copies cannot be recalled.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeactivateOpen(false)}>Keep access</Button><Button disabled={busy} onClick={() => void act(() => { legalApi.respond(deal.id, proposal.version, 'remove', true); setDeactivateOpen(false); })}>{removalBy.length > 0 ? 'Deactivate legal access' : 'Send deactivation request'}</Button></DialogFooter></DialogContent></Dialog>
    </>}
    {canEdit && !editing && <Button variant="outline" onClick={() => { setSelection({ providerId: proposal?.provider.id ?? '', purpose: proposal?.purpose ?? '', consent: false }); setEditing(true); }}>{proposal ? (proposal.sharingScope ? 'Edit legal proposal' : 'Update legal access') : 'Add legal reviewer'}</Button>}
    {editing && !isClosed && <><LegalSelectionForm showToggle={false} value={selection} onChange={setSelection} amountMinor={deal.amountMinor} currency={deal.currency} fee={proposal?.fee.payment ? proposal.fee : undefined} /><div className="flex gap-2"><Button disabled={busy || !selection?.consent || selection.acceptedTermsVersion !== LEGAL_TERMS_VERSION || legalRate() === null} onClick={() => void act(async () => { await legalApi.propose(deal.id, selection!); setEditing(false); })}>Send legal proposal</Button><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div></>}
  </Card>;
}
