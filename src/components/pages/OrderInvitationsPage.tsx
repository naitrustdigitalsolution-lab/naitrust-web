import { useState } from 'react';
import { Check, Clock3, Link2, MailCheck, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../libs/auth-context';
import { orderInvitationsApi } from '../../libs/marketplace/order-invitations.api';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function OrderInvitationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState('');
  if (!user) return null;
  const identifiers = [user.id, user.email, user.naitrustId].filter(Boolean) as string[];
  const invitations = orderInvitationsApi.listForRecipient(identifiers, 'buyer_request');
  void version;

  const accept = async (token: string) => {
    setBusy(token);
    try {
      const result = await orderInvitationsApi.claim(token, { id: user.id, name: user.name });
      toast.success('Invitation accepted. Your order room is ready.');
      navigate(result.destination);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not accept this invitation.'); }
    finally { setBusy(''); }
  };

  const decline = async (token: string) => {
    setBusy(token);
    try { await orderInvitationsApi.decline(token, identifiers); setVersion((value) => value + 1); toast.success('Invitation declined.'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not decline this invitation.'); }
    finally { setBusy(''); }
  };

  return <DashboardLayout title="Order invitations"><div className="mx-auto w-full max-w-5xl space-y-5">
    <section className="rounded-3xl bg-[#071a32] p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[.15em] text-sky-300">Your sourcing requests</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Review before an order starts</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">These requests were created for you by sourcing agents. Nothing is activated or paid until you accept.</p></section>
    <div className="space-y-3">{invitations.map((invitation) => <Card key={invitation.token} className="rounded-3xl p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MailCheck size={19} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge variant={invitation.status === 'pending' ? 'default' : invitation.status === 'claimed' ? 'success' : 'outline'} className="capitalize">{invitation.status}</Badge><span className="text-xs text-muted-foreground">{invitation.orderReference}</span></div><h2 className="mt-3 text-lg font-bold">{invitation.orderSummary}</h2><p className="mt-1 text-sm text-muted-foreground">Invited by {invitation.invitedByName}</p>{invitation.requestNotes && <p className="mt-3 rounded-2xl bg-muted/50 p-4 text-sm leading-6">{invitation.requestNotes}</p>}<div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">{invitation.destination && <span className="flex items-center gap-1"><MapPin size={13} /> {invitation.destination}</span>}<span className="flex items-center gap-1"><Link2 size={13} /> {invitation.links.length} product link{invitation.links.length === 1 ? '' : 's'}</span><span className="flex items-center gap-1"><Clock3 size={13} /> Sent {new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(invitation.createdAt))}</span></div>{invitation.status === 'pending' && <div className="mt-5 flex flex-wrap gap-2"><Button disabled={busy === invitation.token} onClick={() => void accept(invitation.token)}><Check size={15} /> Accept and create order</Button><Button variant="outline" disabled={busy === invitation.token} onClick={() => void decline(invitation.token)}><X size={15} /> Decline</Button></div>}</div></div></Card>)}{!invitations.length && <Card className="rounded-3xl border-dashed p-10 text-center"><MailCheck className="mx-auto text-muted-foreground" size={30} /><h2 className="mt-4 font-bold">No order invitations yet</h2><p className="mt-2 text-sm text-muted-foreground">Requests sent to your Naitrust ID or account email will appear here.</p></Card>}</div>
  </div></DashboardLayout>;
}
