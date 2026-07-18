/**
 * NegotiationPanel
 * The Negotiations tab in the transaction room. Shows the back-and-forth
 * proposal thread, the concrete changes each proposal requests (diffed against
 * the current terms), and the right actions depending on whose turn it is:
 * accept / decline / counter when it's a counterparty proposal, or withdraw /
 * counter while you wait on yours.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Check, GitPullRequestArrow, Loader2, X } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { CounterpartyAvatar } from '../dashboard/CounterpartyAvatar';
import { ProposeChangesModal } from './ProposeChangesModal';
import {
  useProposeNegotiation,
  useRespondNegotiation,
  useWithdrawNegotiation,
} from '../../../hooks/useNegotiation';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import type { SafeDealDetail } from '../../../libs/store/types';
import type {
  DealNegotiation,
  NegotiationProposal,
  ProposedChanges,
} from '../../../libs/store/types';
import { toast } from 'sonner';

function ChangeList({ deal, changes }: { deal: SafeDealDetail; changes: ProposedChanges }) {
  const rows: { label: string; from: string; to: string }[] = [];
  if (changes.amountMinor !== undefined)
    rows.push({
      label: 'Amount',
      from: formatMinorAmount(deal.amountMinor, deal.currency),
      to: formatMinorAmount(changes.amountMinor, deal.currency),
    });
  if (changes.deliveryDueDate)
    rows.push({ label: 'Next milestone', from: deal.deliveryDueDate, to: changes.deliveryDueDate });
  if (changes.releaseConditions)
    rows.push({ label: 'Release conditions', from: deal.releaseConditions, to: changes.releaseConditions });
  if (changes.agreementNote)
    rows.push({ label: 'Agreement', from: 'Current wording', to: changes.agreementNote });

  if (rows.length === 0) return null;
  return (
    <div className="mt-3 space-y-2 rounded-lg border bg-muted/40 p-3">
      {rows.map((r) => (
        <div key={r.label} className="text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{r.label}</p>
          <p className="mt-0.5 text-foreground">
            <span className="text-muted-foreground line-through">{r.from}</span>
            <span className="mx-1.5 text-muted-foreground">→</span>
            <span className="font-medium text-primary">{r.to}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function ProposalCard({
  deal,
  proposal,
  isLatest,
  children,
}: {
  deal: SafeDealDetail;
  proposal: NegotiationProposal;
  isLatest: boolean;
  children?: React.ReactNode;
}) {
  const stale = proposal.status === 'superseded';
  return (
    <div className={'rounded-xl border p-4 ' + (stale ? 'opacity-60' : '')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CounterpartyAvatar name={proposal.byYou ? 'You' : proposal.byName} className="h-8 w-8 text-xs" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {proposal.byYou ? 'You' : proposal.byName}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(proposal.createdAt), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
        {proposal.status === 'accepted' && <Badge variant="success">Accepted</Badge>}
        {proposal.status === 'declined' && <Badge variant="secondary">Declined</Badge>}
        {proposal.status === 'superseded' && <Badge variant="outline">Superseded</Badge>}
        {proposal.status === 'proposed' && isLatest && <Badge variant="default">Awaiting response</Badge>}
      </div>
      <p className="mt-2 text-sm leading-6 text-foreground">{proposal.message}</p>
      <ChangeList deal={deal} changes={proposal.changes} />
      {children}
    </div>
  );
}

export function NegotiationPanel({
  deal,
  negotiation,
}: {
  deal: SafeDealDetail;
  negotiation: DealNegotiation;
}) {
  const propose = useProposeNegotiation(deal.id);
  const respond = useRespondNegotiation(deal.id);
  const withdraw = useWithdrawNegotiation(deal.id);
  const [showPropose, setShowPropose] = useState(false);

  const proposals = negotiation.proposals;
  const latest = proposals[proposals.length - 1];
  const accepted = negotiation.status === 'accepted';

  const handleAccept = () =>
    respond.mutate(
      { proposalId: latest.id, action: 'accepted' },
      { onSuccess: () => toast.success('Proposal accepted — updated terms are now agreed.') },
    );
  const handleDecline = () =>
    respond.mutate(
      { proposalId: latest.id, action: 'declined' },
      { onSuccess: () => toast.info('Proposal declined.') },
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitPullRequestArrow size={18} className="text-primary" />
          <p className="text-sm text-muted-foreground">
            {accepted
              ? 'Terms were renegotiated and agreed.'
              : 'Proposals to change the terms. Nothing changes until a proposal is accepted.'}
          </p>
        </div>
        {!accepted && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => withdraw.mutate(undefined, { onSuccess: () => toast.info('Negotiation withdrawn.') })}
            disabled={withdraw.isPending || negotiation.status === 'withdrawn'}
          >
            Withdraw
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {proposals.map((p) => {
          const isLatest = p.id === latest.id;
          const canRespond = isLatest && !p.byYou && p.status === 'proposed' && !accepted;
          const waiting = isLatest && p.byYou && p.status === 'proposed' && !accepted;
          return (
            <ProposalCard key={p.id} deal={deal} proposal={p} isLatest={isLatest}>
              {canRespond && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" className="rounded-full" onClick={handleAccept} disabled={respond.isPending}>
                    {respond.isPending && respond.variables?.action === 'accepted' ? (
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                    ) : (
                      <Check size={14} className="mr-1.5" />
                    )}
                    Accept changes
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowPropose(true)}>
                    Counter-propose
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-muted-foreground"
                    onClick={handleDecline}
                    disabled={respond.isPending}
                  >
                    <X size={14} className="mr-1.5" />
                    Decline
                  </Button>
                </div>
              )}
              {waiting && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Waiting for the counterparty to accept, decline, or counter your proposal.
                </p>
              )}
            </ProposalCard>
          );
        })}
      </div>

      {!accepted && (
        <ProposeChangesModal
          open={showPropose}
          onOpenChange={setShowPropose}
          deal={deal}
          submitting={propose.isPending}
          onSubmit={(input) =>
            propose.mutate(input, {
              onSuccess: () => {
                setShowPropose(false);
                toast.success('Counter-proposal sent.');
              },
            })
          }
        />
      )}
    </div>
  );
}
