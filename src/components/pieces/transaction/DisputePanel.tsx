/**
 * DisputePanel
 * The Dispute tab in the transaction room: shows the dispute status, reason,
 * description, and a message/evidence thread with the review team. Release is
 * blocked while a dispute is open.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Send, ShieldAlert } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { CounterpartyAvatar } from '../dashboard/CounterpartyAvatar';
import { useDisputeMessage } from '../../../hooks/useDispute';
import type { DealDispute, DisputeStatus } from '../../../libs/store/types';
import type { StatusBadgeVariant } from '../../../libs/utils/safe-deal-presentation';

const STATUS: Record<DisputeStatus, { label: string; variant: StatusBadgeVariant }> = {
  open: { label: 'Open', variant: 'destructive' },
  under_review: { label: 'Under review', variant: 'default' },
  resolved_release: { label: 'Resolved · released', variant: 'success' },
  resolved_refund: { label: 'Resolved · refunded', variant: 'secondary' },
};

export function DisputePanel({ dealId, dispute }: { dealId: string; dispute: DealDispute }) {
  const send = useDisputeMessage(dealId);
  const [draft, setDraft] = useState('');
  const status = STATUS[dispute.status];

  const submit = () => {
    const body = draft.trim();
    if (!body || send.isPending) return;
    setDraft('');
    send.mutate(body);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-destructive" />
            <p className="text-sm font-semibold text-foreground">{dispute.reason}</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground">{dispute.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Opened by {dispute.openedByName} · {format(new Date(dispute.createdAt), 'MMM d, h:mm a')} ·
          Release is paused while this is reviewed.
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Review thread
        </p>
        <div className="space-y-3">
          {dispute.messages.map((m) => (
            <div key={m.id} className={`flex items-end gap-2 ${m.byYou ? 'justify-end' : 'justify-start'}`}>
              {!m.byYou && <CounterpartyAvatar name={m.byName} className="h-7 w-7 text-[0.65rem]" />}
              <div className="flex max-w-[78%] flex-col">
                <div
                  className={
                    'rounded-2xl px-3.5 py-2 text-sm leading-6 ' +
                    (m.byYou ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted text-foreground')
                  }
                >
                  {m.body}
                </div>
                <span className={`mt-1 px-1 text-[0.7rem] text-muted-foreground ${m.byYou ? 'text-right' : ''}`}>
                  {m.byName} · {format(new Date(m.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Input
            placeholder="Add a message or note for the review team…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Button size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={submit} disabled={!draft.trim() || send.isPending} aria-label="Send">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
