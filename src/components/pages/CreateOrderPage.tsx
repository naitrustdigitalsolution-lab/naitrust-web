import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Copy, Link2, Loader2, Mail, MapPin, Plus, Search, ShieldCheck, Star, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { marketplaceApi } from '../../libs/marketplace/marketplace.api';
import { sourcingApi } from '../../features/sourcing/api/sourcing.api';
import { useAuth } from '../../libs/auth-context';
import { useInviteBuyerToOrder } from '../../hooks/useOrderInvitations';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { clearCreateOrderDraft, readCreateOrderDraft, saveCreateOrderDraft } from '../../libs/marketplace/create-order-draft';
import { orderInvitationsApi } from '../../libs/marketplace/order-invitations.api';

interface LinkRow { url: string; note: string; quantity: string }

const emptyRow = (): LinkRow => ({ url: '', note: '', quantity: '' });

export function CreateOrderPage() {
  const savedDraft = readCreateOrderDraft();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation');
  const acceptedInvitation = invitationToken ? orderInvitationsApi.getPublicPreview(invitationToken) : null;
  const { user } = useAuth();
  const inviteBuyer = useInviteBuyerToOrder();
  const [orderTitle, setOrderTitle] = useState(acceptedInvitation?.orderSummary ?? savedDraft?.orderTitle ?? '');
  const [titleConfirmed, setTitleConfirmed] = useState(Boolean(acceptedInvitation?.orderSummary.trim() || savedDraft?.orderTitle.trim()));
  const [titleError, setTitleError] = useState('');
  const [startingFor] = useState<'myself' | 'a-buyer'>('myself');
  const [buyerContact, setBuyerContact] = useState(savedDraft?.buyerContact ?? '');
  const [rows, setRows] = useState<LinkRow[]>(savedDraft?.rows.length ? savedDraft.rows : [emptyRow()]);
  const [destination, setDestination] = useState(savedDraft?.destination ?? '');
  const [notes, setNotes] = useState(acceptedInvitation?.requestNotes ?? savedDraft?.notes ?? '');
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [buyerContactError, setBuyerContactError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentInviteUrl, setSentInviteUrl] = useState('');
  const [agentPickerOpen, setAgentPickerOpen] = useState(false);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(savedDraft?.selectedAgentIds ?? []);
  const [draftAgentIds, setDraftAgentIds] = useState<string[]>([]);
  const availableAgents = sourcingApi.listAgents().filter((agent) => agent.verified && agent.available);
  const favouriteAgentIds = sourcingApi.listFavouriteAgentIds();
  const selectedAgents = availableAgents.filter((agent) => selectedAgentIds.includes(agent.id));
  const quickPickAgents = availableAgents
    .sort((left, right) => Number(favouriteAgentIds.includes(right.id)) - Number(favouriteAgentIds.includes(left.id)) || right.rating - left.rating);

  useEffect(() => {
    saveCreateOrderDraft({ orderTitle, startingFor, buyerContact, rows, destination, notes, selectedAgentIds });
  }, [buyerContact, destination, notes, orderTitle, rows, selectedAgentIds, startingFor]);

  const browseAllAgents = () => {
    setAgentPickerOpen(false);
    navigate('/app/agents?mode=order-create&returnTo=%2Fapp%2Forders%2Fnew');
  };

  const updateRow = (index: number, key: keyof LinkRow, value: string) => {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
    setErrors((current) => ({ ...current, [index]: '' }));
  };

  const addRow = () => setRows((current) => [...current, emptyRow()]);
  const removeRow = (index: number) => setRows((current) => current.length > 1 ? current.filter((_, rowIndex) => rowIndex !== index) : current);

  const submit = async () => {
    if (!orderTitle.trim()) {
      setTitleConfirmed(false);
      setTitleError('Give this order a short, recognisable title.');
      return;
    }
    const filled = rows.filter((row) => row.url.trim());
    const nextErrors: Record<number, string> = {};
    rows.forEach((row, index) => {
      if (row.url.trim() && !/^https?:\/\/\S+$/i.test(row.url.trim())) nextErrors[index] = 'Enter a valid product link starting with http:// or https://.';
    });
    if (!filled.length && !notes.trim()) nextErrors[0] = 'Add a product link or describe what you want the agent to source below.';
    const missingBuyerContact = startingFor === 'a-buyer' && !buyerContact.trim();
    setErrors(nextErrors);
    setBuyerContactError(missingBuyerContact ? "Enter the buyer's email or phone number." : '');
    if (Object.keys(nextErrors).length || missingBuyerContact) return;

    const links = filled.map((row) => ({ url: row.url.trim(), note: row.note.trim() || undefined, quantity: row.quantity.trim() ? Number(row.quantity) : undefined }));
    setSubmitting(true);
    try {
      if (startingFor === 'a-buyer') {
        const { url } = await inviteBuyer.mutateAsync({
          orderSummary: orderTitle.trim(),
          destination: destination.trim() || 'Nigeria',
          links,
          contact: buyerContact.trim(),
          invitedByName: user?.name ?? 'A Naitrust sourcing agent',
        });
        await navigator.clipboard.writeText(url).catch(() => undefined);
        setSentInviteUrl(url);
        toast.success('Invitation link created and copied. Share it with the buyer.');
        return;
      }
      const order = await marketplaceApi.createCustomOrder({
        title: orderTitle.trim(),
        links,
        destination: destination.trim() || 'Nigeria',
        notes: notes.trim() || undefined,
        assignedAgentIds: selectedAgentIds.length ? selectedAgentIds : undefined,
        assignedAgentName: acceptedInvitation?.kind === 'buyer_request' ? acceptedInvitation.invitedByName : undefined,
      });
      if (invitationToken && acceptedInvitation?.kind === 'buyer_request') orderInvitationsApi.completeBuyerRequest(invitationToken, order.id);
      clearCreateOrderDraft();
      toast.success(selectedAgents.length ? `Order started with ${selectedAgents.length} sourcing agent${selectedAgents.length === 1 ? '' : 's'}.` : 'Order started. You can choose a sourcing agent next.');
      navigate(`/app/orders/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start this order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Start an order">
      <div className="mx-auto w-full max-w-[90rem]">
        <PageHero
          eyebrow="Custom order"
          title="Start an order from product links"
          description="Paste product links from any Chinese platform — 1688, Taobao, Alibaba, or any other site. A verified sourcing agent confirms supplier, price, and specifications before anything is paid."
          icon={Link2}
          actions={
            <Button variant="outline" className="rounded-full bg-background/80" onClick={() => navigate('/app/orders')}>
              <ArrowLeft size={15} /> Orders
            </Button>
          }
        />

        <div className="mt-5 grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-20 xl:rounded-3xl xl:border xl:border-primary/10 xl:bg-card xl:p-5 xl:shadow-sm">
            <div className="rounded-2xl border bg-card p-4 shadow-sm xl:border-0 xl:p-0 xl:shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Order setup</p><p className="mt-1 text-sm font-semibold">Build your sourcing request</p></div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck size={18} /></span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-sky-400" /></div>
              <div className="mt-5 hidden space-y-4 xl:block">
                {[['1', 'Describe the request', 'Add links or explain what the agent should find.'], ['2', 'Choose support', 'Select a verified agent now or decide later.'], ['3', 'Create and review', 'Nothing is paid until a confirmed quote is approved.']].map(([number, title, text], index) => (
                  <div key={number} className="flex gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index < 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{number}</span><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div></div>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0">
        {titleConfirmed && <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-2 text-xs font-semibold"><UserCheck size={14} className="text-primary" /> Buyer-owned sourcing order</div>}

        <Card className="mt-3 overflow-hidden rounded-none border-x-0 p-0 shadow-none sm:rounded-3xl sm:border-x sm:shadow-[0_16px_45px_rgba(7,27,49,.08)]">
          <div className="border-b bg-gradient-to-br from-primary/[.09] via-background to-background px-5 py-5 sm:px-7">
            <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Link2 size={17} /></span><div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-primary">Custom sourcing order</p><h2 className="mt-1 text-xl font-bold">Tell us what you want to source</h2><p className="mt-1 text-sm text-muted-foreground">Start from a product link or a clear written brief. A verified agent confirms the supplier, specification and full cost.</p></div></div>
          </div>
          <div className="p-5 sm:p-7">
          {sentInviteUrl ? (
            <div className="py-4 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><Mail size={20} /></span>
              <h2 className="mt-4 font-bold">Invitation sent</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">The buyer will register or sign in, review these products, and the order is created in their own account once they accept.</p>
              <div className="mx-auto mt-4 flex max-w-md items-center gap-2 rounded-xl border bg-muted/30 p-2">
                <p className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">{sentInviteUrl}</p>
                <Button size="sm" variant="ghost" className="shrink-0 rounded-lg" onClick={() => void navigator.clipboard.writeText(sentInviteUrl).then(() => toast.success('Copied'))}><Copy size={14} /> Copy</Button>
              </div>
              <Button variant="outline" className="mt-5 rounded-full" onClick={() => navigate('/app/orders')}>Back to orders</Button>
            </div>
          ) : !titleConfirmed ? (
            <div className="mx-auto max-w-xl py-5 sm:py-8">
              <Badge variant="secondary">Step 1 of 3</Badge>
              <h2 className="mt-4 text-xl font-bold">Name this order first</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Use a short title you will recognise when choosing an agent and tracking the order later.</p>
              <Label htmlFor="order-title" className="mt-6 block">Order name or title</Label>
              <Input id="order-title" autoFocus value={orderTitle} onChange={(event) => { setOrderTitle(event.target.value); setTitleError(''); }} onKeyDown={(event) => { if (event.key === 'Enter' && orderTitle.trim()) setTitleConfirmed(true); }} placeholder="e.g. 500 branded travel mugs" className="mt-1.5" />
              {titleError && <p className="mt-1.5 text-xs text-destructive">{titleError}</p>}
              <Button className="mt-5 w-full rounded-full" onClick={() => { if (!orderTitle.trim()) { setTitleError('Give this order a short, recognisable title.'); return; } setTitleConfirmed(true); }}>Continue to order details <ArrowRight size={15} /></Button>
            </div>
          ) : (
          <>
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
            <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Order</p><p className="truncate text-sm font-semibold">{orderTitle}</p></div>
            <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => setTitleConfirmed(false)}>Edit title</Button>
          </div>
          {startingFor === 'a-buyer' && (
            <div className="mb-5">
              <Label htmlFor="buyer-contact">Buyer's email or phone</Label>
              <Input id="buyer-contact" value={buyerContact} onChange={(event) => { setBuyerContact(event.target.value); setBuyerContactError(''); }} placeholder="buyer@example.com" className="mt-1.5" />
              {buyerContactError && <p className="mt-1 text-xs text-destructive">{buyerContactError}</p>}
              <p className="mt-1.5 text-xs text-muted-foreground">Not yet on Naitrust? They'll register through the invite link and land straight on this order.</p>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Product links <span className="font-normal text-muted-foreground">(optional)</span></p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Already found something? Add one or more links. Otherwise, describe what you need and ask an agent to source it.</p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {rows.map((row, index) => (
              <div key={index} className="rounded-xl border p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <Label htmlFor={`link-url-${index}`}>Product link</Label>
                      <Input id={`link-url-${index}`} value={row.url} onChange={(event) => updateRow(index, 'url', event.target.value)} placeholder="https://..." className="mt-1.5" />
                      {errors[index] && <p className="mt-1 text-xs text-destructive">{errors[index]}</p>}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                      <div>
                        <Label htmlFor={`link-note-${index}`}>Note <span className="font-normal text-muted-foreground">(optional)</span></Label>
                        <Input id={`link-note-${index}`} value={row.note} onChange={(event) => updateRow(index, 'note', event.target.value)} placeholder="Color, size, spec..." className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor={`link-qty-${index}`}>Quantity</Label>
                        <Input id={`link-qty-${index}`} type="number" min="1" value={row.quantity} onChange={(event) => updateRow(index, 'quantity', event.target.value)} placeholder="1" className="mt-1.5" />
                      </div>
                    </div>
                  </div>
                  {rows.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="mt-6 h-9 w-9 shrink-0 rounded-full text-muted-foreground" aria-label="Remove link" onClick={() => removeRow(index)}>
                      <Trash2 size={15} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={addRow}>
            <Plus size={15} /> Add another link
          </Button>

          {startingFor === 'myself' && (
            <div className="mt-6 border-t pt-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold">Sourcing agent <span className="font-normal text-muted-foreground">(optional)</span></p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Choose a verified agent now, or create the order and decide later.</p>
                </div>
                <Button type="button" variant="outline" className="shrink-0 rounded-full" onClick={() => { setDraftAgentIds(selectedAgentIds); setAgentPickerOpen(true); }}>
                  <Search size={15} /> {selectedAgents.length ? 'Manage agents' : 'Find agents'}
                </Button>
              </div>
              {selectedAgents.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{selectedAgents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[.035] p-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{agent.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{agent.businessName ?? agent.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> {agent.city}</p></div><button type="button" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => setSelectedAgentIds((ids) => ids.filter((id) => id !== agent.id))}>Remove</button></div>
              ))}</div>}
            </div>
          )}

          <div className="mt-6 grid gap-4 border-t pt-5">
            <div>
              <Label htmlFor="order-destination">Delivery destination</Label>
              <Input id="order-destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g. Lagos, Nigeria" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="order-notes">What do you want the sourcing agent to find?</Label>
              <Textarea id="order-notes" value={notes} onChange={(event) => { setNotes(event.target.value); setErrors((current) => ({ ...current, 0: '' })); }} placeholder="Describe the product, material, size, quality, quantity, target budget, or any reference details. This is required only when you do not add a product link." className="mt-1.5 min-h-28" />
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-xs leading-5 text-muted-foreground">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
            <p>
              {startingFor === 'a-buyer'
                ? "No payment moves at this step. The buyer reviews these products and pays only once they approve a confirmed quote."
                : 'No payment moves at this step. After the order is created, invite a verified sourcing agent to confirm supplier, price, and specifications before anything is paid.'}
            </p>
          </div>

          <Button className="mt-6 w-full rounded-full" disabled={submitting} onClick={() => void submit()}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            {submitting ? 'Sending…' : startingFor === 'a-buyer' ? 'Invite the buyer' : 'Start order'}
          </Button>
          </>
          )}
          </div>
        </Card>
          </main>
        </div>
        <Dialog open={agentPickerOpen} onOpenChange={(open) => { setAgentPickerOpen(open); if (open) setDraftAgentIds(selectedAgentIds); }}>
          <DialogContent className="flex max-h-[85svh] flex-col overflow-hidden p-0 sm:max-w-2xl">
            <div className="border-b px-6 pb-5 pt-6 sm:px-8">
            <DialogHeader><DialogTitle>Choose an agent for “{orderTitle}”</DialogTitle><DialogDescription>You are selecting a sourcing agent for this order. Choose from saved and recommended agents, or browse the full directory to compare profiles.</DialogDescription></DialogHeader>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {quickPickAgents.slice(0, 4).map((agent) => (
                <button key={agent.id} type="button" onClick={() => setDraftAgentIds((ids) => ids.includes(agent.id) ? ids.filter((id) => id !== agent.id) : [...ids, agent.id])} className={`relative rounded-2xl border p-4 text-left transition hover:border-primary ${draftAgentIds.includes(agent.id) ? 'border-primary bg-primary/[.04] ring-1 ring-primary/30' : ''}`}>
                  <div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{agent.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div className="flex gap-1">{favouriteAgentIds.includes(agent.id) && <Badge variant="secondary">My list</Badge>}{draftAgentIds.includes(agent.id) ? <Badge><Check size={12} /> Selected</Badge> : <Badge variant="success">Verified</Badge>}</div></div>
                  <p className="mt-3 font-semibold">{agent.businessName ?? agent.name}</p>{agent.businessName && <p className="mt-0.5 text-[11px] text-muted-foreground">{agent.name}</p>}<p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> {agent.city} · <Star size={12} className="fill-amber-400 text-amber-400" /> {agent.rating}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{agent.services.join(' · ')}</p>
                </button>
              ))}
            </div>
            <Button type="button" variant="outline" className="mt-5 w-full rounded-full" onClick={browseAllAgents}><Search size={15} /> Browse all sourcing agents <ArrowRight size={15} /></Button>
            </div>
            <div className="flex items-center justify-between gap-3 border-t px-6 py-4 sm:px-8"><p className="text-sm text-muted-foreground">{draftAgentIds.length} agent{draftAgentIds.length === 1 ? '' : 's'} selected</p><div className="flex gap-2"><Button variant="outline" className="rounded-full" onClick={() => setAgentPickerOpen(false)}>Cancel</Button><Button className="rounded-full" onClick={() => { setSelectedAgentIds(draftAgentIds); setAgentPickerOpen(false); }}><Check size={15} /> Add selected agents</Button></div></div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
