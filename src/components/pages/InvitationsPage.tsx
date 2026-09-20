import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Inbox } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { InvitationStatusBadge } from '../pieces/invitations/InvitationStatusBadge';
import { Button } from '../ui/button';
import { useInvitations } from '../../hooks/useInvitations';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';

export function InvitationsPage() {
  const { data = [], isLoading, isError, refetch } = useInvitations();
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [page, setPage] = useState(1);
  const invitations = data.map(invitation => ({ ...invitation, status: ['pending', 'changes_requested'].includes(invitation.status) && new Date(invitation.expiresAt).getTime() <= Date.now() ? 'expired' as const : invitation.status }));
  const pending = invitations.filter(invitation => ['pending', 'changes_requested'].includes(invitation.status));
  const visible = filter === 'pending' ? pending : invitations;
  const pages = Math.max(1, Math.ceil(visible.length / 10));
  const current = Math.min(page, pages);
  return <DashboardLayout title="Invitations">
    <div className="nd-heading"><div><h1>Invitations</h1><p>Deals you’ve been invited to join.</p></div></div>
    <div className="nd-filters" aria-label="Filter invitations"><button aria-pressed={filter === 'pending'} onClick={()=>{setFilter('pending');setPage(1);}}>To review{pending.length > 0 ? ` (${pending.length})` : ''}</button><button aria-pressed={filter === 'all'} onClick={()=>{setFilter('all');setPage(1);}}>All invitations</button></div>
    {isLoading ? <div className="nd-empty" role="status">Loading invitations…</div> : isError ? <div className="nd-empty"><h2>Couldn’t load invitations</h2><p>Please try again.</p><Button variant="outline" onClick={()=>void refetch()}>Try again</Button></div> : visible.length === 0 ? <div className="nd-empty"><Inbox size={25}/><h2>{filter === 'pending' ? 'You’re all caught up' : 'No invitations yet'}</h2><p>When someone invites you to a deal, you can review it here.</p></div> : <>
      <div className="nd-invitations">{visible.slice((current - 1) * 10, current * 10).map(invitation => <Link key={invitation.id} className="nd-invitation-row" to={`/app/invitations/${invitation.id}`}>
        <div className="nd-invitation-info"><strong>{invitation.title}</strong><p>From {invitation.fromName}</p></div><div className="nd-invitation-value"><strong>{formatMinorAmount(invitation.amountMinor, invitation.currency)}</strong><InvitationStatusBadge status={invitation.status}/></div><span className="nd-invitation-action">{invitation.status === 'pending' || invitation.status === 'changes_requested' ? 'Review' : 'View'}<ArrowRight size={15}/></span>
      </Link>)}</div>
      {pages > 1 && <div className="nd-pagination"><span>Page {current} of {pages}</span><div><Button variant="outline" disabled={current === 1} onClick={()=>setPage(current - 1)}>Previous</Button><Button variant="outline" disabled={current === pages} onClick={()=>setPage(current + 1)}>Next</Button></div></div>}
    </>}
  </DashboardLayout>;
}
