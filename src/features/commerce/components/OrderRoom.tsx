import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Copy, ExternalLink, Mail, ShieldCheck, Ship, Truck, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { marketSuppliers } from '../../../libs/marketplace/marketplace.api';
import type { MarketOrder } from '../../../libs/marketplace/types';
import { formatCny, formatNaira, formatUsd } from '../lib/money';
import { useAuth } from '../../../libs/auth-context';
import { useInviteAgentToOrder, useOrderInvitations } from '../../../hooks/useOrderInvitations';

interface OrderRoomProps { order: MarketOrder }

function AwaitingAgentOrderRoom({ order }: OrderRoomProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: invitations = [] } = useOrderInvitations(order.id);
  const inviteAgent = useInviteAgentToOrder(order.id);
  const [contact, setContact] = useState('');

  const sendInvite = async () => {
    const value = contact.trim();
    if (!value) { toast.error('Enter the agent’s Naitrust ID or email address.'); return; }
    try {
      const { url } = await inviteAgent.mutateAsync({
        orderReference: order.reference,
        orderSummary: order.itemSummary ?? 'New order',
        destination: order.destination,
        links: order.customLinks ?? [],
        contact: value,
        invitedByName: user?.name ?? 'A Naitrust buyer',
      });
      await navigator.clipboard.writeText(url).catch(() => undefined);
      toast.success('Invitation link created and copied. Share it with your sourcing agent.');
      setContact('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send this invitation.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Button variant="ghost" className="mb-4 rounded-full" onClick={() => navigate('/app/orders')}><ArrowLeft size={15} /> Orders</Button>
      <div className="mb-5">
        <Badge variant="outline">Awaiting a sourcing agent</Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{order.itemSummary ?? 'New order'}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{order.reference} · {order.destination}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="rounded-3xl p-5 sm:p-7">
          <h2 className="font-bold">Product links</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">A verified sourcing agent will confirm supplier, price and specifications for each link.</p>
          <div className="mt-5 divide-y">
            {(order.customLinks ?? []).map((link, index) => (
              <div key={`${link.url}-${index}`} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-sm font-semibold text-primary hover:underline">{link.url} <ExternalLink size={12} className="shrink-0" /></a>
                  {link.note && <p className="mt-1 text-xs text-muted-foreground">{link.note}</p>}
                </div>
                {link.quantity ? <span className="shrink-0 text-xs font-semibold text-muted-foreground">Qty {link.quantity}</span> : null}
              </div>
            ))}
          </div>
          {order.requestNotes && (
            <div className="mt-5 rounded-2xl border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm leading-6">{order.requestNotes}</p>
            </div>
          )}
        </Card>
        <aside className="space-y-4">
          <Card className="rounded-2xl p-5">
            <p className="flex items-center gap-2 font-semibold"><UserCheck size={16} className="text-primary" /> No agent assigned yet</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Choose a verified sourcing agent to confirm these products and start work. Pricing and payment apply once the agent's quote is approved.</p>
            <Button className="mt-4 w-full rounded-full" onClick={() => navigate(`/app/agents?order=${order.id}`)}><UserCheck size={16} /> Choose from verified agents</Button>
          </Card>
          <Card className="rounded-2xl p-5">
            <p className="flex items-center gap-2 font-semibold"><Mail size={16} className="text-primary" /> Invite a specific agent</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Use their Naitrust ID if they already have an account, or their email if they need an invitation.</p>
            <div className="mt-3 space-y-2">
              <Label htmlFor="agent-invite-contact" className="sr-only">Agent Naitrust ID or email</Label>
              <Input id="agent-invite-contact" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="NT-AGENT-… or agent@example.com" />
              <Button variant="outline" className="w-full rounded-full" disabled={inviteAgent.isPending} onClick={() => void sendInvite()}>
                <Copy size={14} /> {inviteAgent.isPending ? 'Sending…' : 'Create and copy invite link'}
              </Button>
            </div>
            {invitations.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                {invitations.map((invitation) => (
                  <div key={invitation.token} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-muted-foreground">{invitation.contact}</span>
                    {invitation.status === 'claimed' ? (
                      <Badge variant="success"><CheckCircle2 size={11} /> Accepted</Badge>
                    ) : invitation.status === 'expired' ? (
                      <Badge variant="outline">Expired</Badge>
                    ) : (
                      <Badge variant="outline"><Clock3 size={11} /> Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
          <div className="flex items-start gap-2 rounded-2xl border border-primary/15 bg-primary/4 p-4 text-xs leading-5 text-muted-foreground">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
            <p>No payment moves until an agent is assigned and you approve their quote.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function OrderRoom({ order }: OrderRoomProps) {
  const navigate = useNavigate();
  const supplier = marketSuppliers.find((candidate) => candidate.id === order.supplierId);

  if (!order.supplierId) {
    return <AwaitingAgentOrderRoom order={order} />;
  }

  const payment = order.paymentCurrency === 'USD' ? formatUsd(order.paymentAmountMinor ?? 0) : formatNaira(order.paymentAmountMinor ?? 0);
  const settlement = order.settlementCurrency === 'CNY'
    ? formatCny(order.settlementAmountMinor ?? 0)
    : order.settlementCurrency === 'USD'
      ? formatUsd(order.settlementAmountMinor ?? 0)
      : formatNaira(order.settlementAmountMinor ?? 0);
  const timeline = order.timeline ?? [];
  const logistics = order.logistics ?? { paidMinor: 0, committedMinor: 0, refundableMinor: 0, currency: 'NGN' as const, status: 'not_required' as const };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Button variant="ghost" className="mb-4 rounded-full" onClick={() => navigate('/app/orders')}><ArrowLeft size={15} /> Orders</Button>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge>{order.deliveryMode === 'international' ? 'China import' : 'Nigeria local'}</Badge>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{supplier?.name ?? 'Supplier order'}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{order.reference}</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => navigate(`/app/agents?city=${encodeURIComponent(supplier?.city ?? '')}&supplier=${order.supplierId}&order=${order.id}`)}><UserCheck size={16} /> Assign local agent</Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="rounded-3xl p-5 sm:p-7">
          <h2 className="font-bold">Order journey</h2>
          <div className="mt-6">
            {timeline.map((step, index) => (
              <div key={`${step.status}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${step.complete ? 'bg-emerald-600 text-white' : 'border bg-background text-muted-foreground'}`}>
                    {step.complete ? <CheckCircle2 size={15} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                  </span>
                  {index < timeline.length - 1 && <span className="h-12 w-px bg-border" />}
                </div>
                <div className="pb-5">
                  <p className="text-sm font-semibold">{step.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <aside className="space-y-4">
          <Card className="rounded-2xl p-5">
            <p className="text-xs text-muted-foreground">Customer payment</p>
            <p className="mt-1 text-2xl font-bold">{payment}</p>
            <div className="mt-4 flex items-start gap-2 border-t pt-4 text-xs leading-5 text-muted-foreground">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <p>Supplier funds remain pending until the agreed agent readiness evidence is reviewed and the buyer authorizes the eligible release.</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Planned supplier settlement: <strong className="text-foreground">{settlement}</strong></p>
          </Card>
          <Card className="rounded-2xl p-5">
            <p className="flex items-center gap-2 font-semibold"><Truck size={16} className="text-primary" /> Logistics allocation</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Paid</dt><dd className="font-semibold">{formatNaira(order.logistics.paidMinor)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Committed</dt><dd>{formatNaira(order.logistics.committedMinor)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Unused</dt><dd className="font-semibold text-emerald-700">{formatNaira(order.logistics.refundableMinor)}</dd></div>
            </dl>
          </Card>
          <div className="grid gap-2">
            <Button className="rounded-full" onClick={() => navigate(`/app/agent-assignments?order=${order.id}`)}><UserCheck size={16} /> Agent evidence</Button>
            <Button variant="outline" className="rounded-full" onClick={() => navigate(`/app/shipments?order=${order.id}`)}><Ship size={16} /> Shipping plan</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
