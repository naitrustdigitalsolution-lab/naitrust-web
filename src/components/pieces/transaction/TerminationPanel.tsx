/**
 * TerminationPanel
 * Shows a deal's termination request and its outcome. If the current user did
 * not raise it and it's still pending, they can accept (ends the deal) or
 * reject (with a reason). Accepted/rejected states remain on the record.
 */

import { format } from 'date-fns';
import { Ban, Check, Loader2, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { DealTermination } from '../../../libs/store/types';

interface TerminationPanelProps {
  termination: DealTermination;
  responding: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function TerminationPanel({ termination, responding, onAccept, onReject }: TerminationPanelProps) {
  const { status, reason, requestedByName, requestedByYou, createdAt } = termination;
  const pending = status === 'requested';
  const canRespond = pending && !requestedByYou;

  const banner =
    status === 'accepted'
      ? { cls: 'border-destructive/30 bg-destructive/10 text-destructive', label: 'Deal terminated' }
      : status === 'rejected'
        ? { cls: 'border-amber-500/30 bg-amber-500/10 text-foreground', label: 'Termination rejected' }
        : { cls: 'border-amber-500/30 bg-amber-500/10 text-foreground', label: 'Termination requested' };

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${banner.cls}`}>
        <Ban size={16} className="shrink-0" />
        {banner.label}
        <Badge variant="outline" className="ml-auto capitalize">
          {status}
        </Badge>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Requested by {requestedByYou ? 'you' : requestedByName} · {format(new Date(createdAt), 'MMM d, h:mm a')}
        </p>
        <p className="mt-1 text-sm leading-6 text-foreground">{reason}</p>
      </div>

      {status === 'rejected' && termination.responseReason && (
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {termination.respondedByName ?? 'The other party'} rejected this
            {termination.respondedAt ? ` · ${format(new Date(termination.respondedAt), 'MMM d, h:mm a')}` : ''}
          </p>
          <p className="mt-1 text-sm leading-6 text-foreground">{termination.responseReason}</p>
        </div>
      )}

      {status === 'accepted' && (
        <p className="text-sm text-muted-foreground">
          {termination.respondedByName ?? 'The other party'} agreed to end this deal
          {termination.respondedAt ? ` on ${format(new Date(termination.respondedAt), 'MMM d, yyyy')}` : ''}. This
          record is kept for both parties.
        </p>
      )}

      {pending && requestedByYou && (
        <p className="text-sm text-muted-foreground">Waiting for the other party to accept or reject your request.</p>
      )}

      {canRespond && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1 rounded-full" onClick={onAccept} disabled={responding}>
            {responding ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Check size={16} className="mr-1.5" />}
            Agree to terminate
          </Button>
          <Button variant="outline" className="flex-1 rounded-full" onClick={onReject} disabled={responding}>
            <X size={16} className="mr-1.5" />
            Reject with reason
          </Button>
        </div>
      )}
    </div>
  );
}
