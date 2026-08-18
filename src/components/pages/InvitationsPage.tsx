/**
 * InvitationsPage
 * Incoming safe-deal invitations (`/app/invitations`): a card feed with
 * loading, error, and empty states. Selecting one opens the accept flow.
 * Purely reads the useInvitations query; actions live on the detail page.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ChevronRight, Inbox, Plus } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { InvitationStatusBadge } from '../pieces/invitations/InvitationStatusBadge';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { useInvitations } from '../../hooks/useInvitations';
import { formatMinorAmount, partyModeShort, roleLabel } from '../../libs/utils/safe-deal-presentation';
import type { DealInvitation } from '../../libs/store/types';

function LoadingRows() {
  return (
    <Card className="gap-0 p-0 shadow-sm" aria-label="Loading invitations">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:px-5">
          <div className="flex w-full items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 max-w-56" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center justify-between pl-12 sm:ml-auto sm:pl-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center gap-3 border-0 bg-transparent p-10 text-center text-[#071b31] shadow-none dark:bg-transparent dark:text-foreground">
      <div className="flex h-12 w-12 items-center justify-center text-primary">
        <Inbox size={24} />
      </div>
      <p className="font-semibold text-[#071b31] dark:text-foreground">No invitations right now</p>
      <p className="max-w-sm text-sm leading-6 text-[#35546f] dark:text-muted-foreground">
        When a Protected Deal participant invites you, it shows up here for you to review and
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
      className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-3 py-4 transition-colors last:border-b-0 hover:bg-accent/40 sm:flex sm:gap-3 sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <CounterpartyAvatar name={invitation.fromName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold leading-5 text-foreground sm:text-base sm:leading-normal">{invitation.fromName}</p>
            <Badge variant="outline" className="shrink-0">{partyModeShort(invitation.partyMode)}</Badge>
          </div>
          <p className="mt-0.5 truncate text-xs leading-4 text-muted-foreground sm:text-sm">{invitation.title}</p>
          <p className="mt-0.5 truncate text-[10px] leading-4 text-muted-foreground sm:text-xs">
            You’d join as {roleLabel(invitation.yourRole)} · {expiryLabel}
          </p>
        </div>
      </div>
      <div className="grid shrink-0 justify-items-end gap-1 sm:grid-cols-[minmax(110px,auto)_130px_18px] sm:items-center sm:gap-3">
        <span className="text-xs font-semibold leading-4 text-foreground tabular-nums sm:text-right sm:text-sm">
          {formatMinorAmount(invitation.amountMinor, invitation.currency)}
        </span>
        <div className="justify-self-end"><InvitationStatusBadge status={invitation.status} /></div>
        <ChevronRight size={16} className="justify-self-end text-muted-foreground" />
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export function InvitationsPage() {
  const navigate = useNavigate();
  const { data: invitations, isLoading, isError } = useInvitations();
  const [page, setPage] = useState(1);

  const total = invitations?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paged = invitations?.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [total]);

  return (
    <DashboardLayout title="Invitations">
      <div className="mx-auto w-full max-w-9xl">
        <div className="mb-5 flex items-center justify-between gap-3 sm:hidden">
          <h1 className="text-lg font-bold tracking-tight">Deal invitations</h1>
          <Button size="icon" className="h-8 w-8 rounded-full" aria-label="New deal" onClick={() => navigate('/app/deals/new')}><Plus size={14} /></Button>
        </div>
        <div className="hidden sm:block"><PageHero
          eyebrow="Protected Deals"
          title="Deal invitations"
          description="Review Protected Deals you have been invited to, then accept to agree the terms."
          icon={Inbox}
          actions={
            <Button className="rounded-full" onClick={() => navigate('/app/deals/new')}>
              <Plus size={15} /> Create a deal
            </Button>
          }
        /></div>

        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <Card className="p-6 text-center text-sm text-muted-foreground shadow-sm">
            We could not load your invitations. Please refresh to try again.
          </Card>
        ) : !invitations || invitations.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Card className="gap-0 overflow-hidden rounded-none border-x-0 p-0 shadow-none sm:rounded-xl sm:border-x sm:shadow-sm" aria-label="Invitations">
              {paged?.map((inv) => (
                <InvitationRow
                  key={inv.id}
                  invitation={inv}
                  onOpen={() => navigate(`/app/invitations/${inv.id}`)}
                />
              ))}
            </Card>

            {total > PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {current} of {pageCount}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={current <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={15} className="mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={current >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    Next
                    <ChevronRight size={15} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
