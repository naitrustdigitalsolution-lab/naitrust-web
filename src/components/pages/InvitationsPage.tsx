/**
 * InvitationsPage
 * Incoming safe-deal invitations (`/app/invitations`): a card feed with
 * loading, error, and empty states. Selecting one opens the accept flow.
 * Purely reads the useInvitations query; actions live on the detail page.
 */

import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ChevronRight, Inbox } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { InvitationStatusBadge } from '../pieces/invitations/InvitationStatusBadge';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useInvitations } from '../../hooks/useInvitations';
import { formatMinorAmount, partyModeShort, roleLabel } from '../../libs/utils/safe-deal-presentation';
import type { DealInvitation } from '../../libs/store/types';

function LoadingRows() {
  return (
    <Card className="gap-0 p-0 shadow-sm" aria-label="Loading invitations">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b px-5 py-4 last:border-b-0">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      ))}
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Inbox size={24} />
      </div>
      <p className="font-semibold text-foreground">No invitations right now</p>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        When a counterparty invites you to a safe deal, it shows up here for you to review and
        accept.
      </p>
    </Card>
  );
}

function InvitationRow({ invitation, onOpen }: { invitation: DealInvitation; onOpen: () => void }) {
  const expiryLabel =
    invitation.status === 'expired'
      ? 'Expired'
      : `Expires ${formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="flex cursor-pointer items-center gap-3 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-accent/40"
    >
      <CounterpartyAvatar name={invitation.fromName} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-foreground">{invitation.fromName}</p>
          <Badge variant="outline" className="shrink-0">
            {partyModeShort(invitation.partyMode)}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{invitation.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          You’d join as {roleLabel(invitation.yourRole)} · {expiryLabel}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-sm font-semibold text-foreground tabular-nums sm:inline">
          {formatMinorAmount(invitation.amountMinor, invitation.currency)}
        </span>
        <InvitationStatusBadge status={invitation.status} />
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </div>
  );
}

export function InvitationsPage() {
  const navigate = useNavigate();
  const { data: invitations, isLoading, isError } = useInvitations();

  return (
    <DashboardLayout title="Invitations">
      <div className="mx-auto w-full max-w-9xl">
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Deal invitations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review safe deals a counterparty has invited you to, then accept to agree the terms.
          </p>
        </div>

        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <Card className="p-6 text-center text-sm text-muted-foreground shadow-sm">
            We could not load your invitations. Please refresh to try again.
          </Card>
        ) : !invitations || invitations.length === 0 ? (
          <EmptyState />
        ) : (
          <Card className="gap-0 overflow-hidden p-0 shadow-sm" aria-label="Invitations">
            {invitations.map((inv) => (
              <InvitationRow
                key={inv.id}
                invitation={inv}
                onOpen={() => navigate(`/app/invitations/${inv.id}`)}
              />
            ))}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
