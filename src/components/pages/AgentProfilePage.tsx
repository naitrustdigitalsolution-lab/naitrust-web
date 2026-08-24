import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Building2, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Languages, MapPin, MessageCircle, PackageSearch, Star, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { sourcingApi } from '../../features/sourcing/api/sourcing.api';
import { useOperationsRefresh } from '../../features/sourcing/hooks/use-operations-refresh';
import { getAgentRepresentativeImage } from '../../libs/images/image-manifest';
import { marketSuppliers, marketplaceApi } from '../../libs/marketplace/marketplace.api';
import { selectAgentForCreateOrder } from '../../libs/marketplace/create-order-draft';
import { agentReviewsApi } from '../../features/sourcing/api/agent-reviews.api';
import { useAuth } from '../../libs/auth-context';

const money = (minor: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(minor / 100);

export function AgentProfilePage() {
  const { user } = useAuth();
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const operationsVersion = useOperationsRefresh();
  const agent = useMemo(() => {
    void operationsVersion;
    return sourcingApi.listAgents().find((item) => item.id === agentId);
  }, [agentId, operationsVersion]);
  const request = params.get('request') ? sourcingApi.getRequest(params.get('request')!) : undefined;
  const supplier = params.get('supplier') ? marketSuppliers.find((item) => item.id === params.get('supplier')) : undefined;
  const order = params.get('order') ? marketplaceApi.listOrders().find((item) => item.id === params.get('order')) : undefined;
  const productTitle = params.get('title');
  const productSupplier = params.get('supplier');
  const productCity = params.get('city');
  const productPrice = params.get('price');
  const productImage = params.get('image');
  const choosingForOrder = params.get('mode') === 'order-create';
  const returnTo = params.get('returnTo') ?? '/app/orders/new';
  const [hireOpen, setHireOpen] = useState(params.get('hire') === '1');
  const [productHireStage, setProductHireStage] = useState<'confirm' | 'awaiting' | 'accepted' | 'declined' | 'redirected'>('confirm');
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');
  const [directMessages, setDirectMessages] = useState<Array<{ role: 'buyer' | 'agent'; body: string }>>([{ role: 'agent', body: 'Hello. Tell me what product you need and where you found it. I can review your request before you hire me.' }]);
  const orders = marketplaceApi.listOrders();
  const eligibleOrders = orders.filter((item) => {
    const orderSupplier = marketSuppliers.find((supplierItem) => supplierItem.id === item.supplierId);
    const isOpen = !['delivered', 'released', 'cancelled'].includes(item.status);
    const isChinaOrder = item.deliveryMode === 'international' && (!orderSupplier || orderSupplier.country === 'CN');
    return isOpen && isChinaOrder;
  });
  const assignments = sourcingApi.listAssignments().filter((item) => item.agentId === agentId);
  const [selectedOrderId, setSelectedOrderId] = useState(order && eligibleOrders.some((item) => item.id === order.id) ? order.id : '');
  const [orderPage, setOrderPage] = useState(1);
  const [invitationNote, setInvitationNote] = useState('');
  const [reviewVersion, setReviewVersion] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [replyReviewId, setReplyReviewId] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const orderPages = Math.max(1, Math.ceil(eligibleOrders.length / 5));
  const visibleEligibleOrders = eligibleOrders.slice((orderPage - 1) * 5, orderPage * 5);
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  if (!agent) return <DashboardLayout title="Agent profile"><Card className="mx-auto max-w-xl p-8 text-center"><h1 className="font-bold">Agent profile not found</h1><Button className="mt-4" onClick={() => navigate('/app/agents')}>Back to agents</Button></Card></DashboardLayout>;

  const displayName = agent.profileType === 'company' ? agent.businessName ?? agent.name : agent.name;
  const photo = getAgentRepresentativeImage(agent.id);
  const operatingCities = [...new Set([agent.city, ...agent.secondaryCities])];
  const reviews = agentReviewsApi.list(agent.id);
  const reviewPages = Math.max(1, Math.ceil(reviews.length / 5));
  const visibleReviews = reviews.slice((reviewPage - 1) * 5, reviewPage * 5);
  const averageReview = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
  void reviewVersion;
  const hire = () => {
    const chosenOrder = orders.find((item) => item.id === selectedOrderId);
    const existingAssignment = chosenOrder ? sourcingApi.listAssignments().find((item) => item.relatedOrderId === chosenOrder.id && item.agentId === agent.id) : undefined;
    if (existingAssignment) { navigate(`/app/agent-assignments/${existingAssignment.id}`); return; }
    if (!chosenOrder) {
      toast.error('Choose an order first. Agent work must stay in its Order Room.');
      return;
    }
    const chosenSupplier = chosenOrder ? marketSuppliers.find((item) => item.id === chosenOrder.supplierId) : supplier;
    const assignmentTitle = productTitle ? `Inspect ${productTitle}` : chosenOrder.itemSummary ?? 'China sourcing order';
    const baseScope = productTitle
      ? `Investigate ${productSupplier ?? 'the listing supplier'} in ${productCity ?? 'China'} and confirm availability, supplier identity, specifications and required evidence.`
      : chosenOrder.requestNotes ?? 'Review the order brief and product links, confirm the supplier and specifications, then prepare the next steps for the buyer.';
    const assignment = sourcingApi.hireAgent({ agentId: agent.id, sourcingRequestId: request?.id, orderId: chosenOrder.id, supplierId: chosenSupplier?.id, supplierName: productSupplier ?? request?.supplierName ?? chosenSupplier?.name ?? 'Supplier to be confirmed', supplierCity: productCity ?? request?.supplierCity ?? chosenSupplier?.city ?? agent.city, title: assignmentTitle, scope: invitationNote.trim() ? `${baseScope}\n\nBuyer note: ${invitationNote.trim()}` : baseScope, deadline, productNames: [productTitle ?? chosenOrder.itemSummary ?? request?.title ?? assignmentTitle] });
    toast.success(productTitle ? 'Activation fee paid. Your inspection order room is ready.' : `${displayName} has been invited.`);
    navigate(`/app/agent-assignments/${assignment.id}`);
  };

  const chooseForOrder = () => {
    selectAgentForCreateOrder(agent.id);
    toast.success(`${displayName} added to your order.`);
    navigate(returnTo);
  };

  const submitReview = () => {
    if (!user) return;
    try {
      agentReviewsApi.add({ agentId: agent.id, authorId: user.id, authorName: user.name, rating: reviewRating, body: reviewBody });
      setReviewBody('');
      setReviewRating(5);
      setReviewPage(1);
      setReviewVersion((value) => value + 1);
      toast.success('Your review was published.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not publish this review.');
    }
  };

  const submitReply = (reviewId: string) => {
    if (!user) return;
    try {
      agentReviewsApi.reply({ agentId: agent.id, reviewId, actorId: user.id, body: replyBody });
      setReplyReviewId('');
      setReplyBody('');
      setReviewVersion((value) => value + 1);
      toast.success('Reply published.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not publish this reply.');
    }
  };

  return <DashboardLayout title="Sourcing agent profile"><div className="mx-auto w-full max-w-5xl space-y-5">
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back to agents</Button>
    <Card className="overflow-hidden rounded-3xl p-0"><div className="bg-[#071b31] p-5 text-white sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><Avatar className="h-24 w-24 border-4 border-white/20"><AvatarImage src={photo.src} alt={agent.name} className="object-cover" /><AvatarFallback>{agent.name.slice(0, 2)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Badge className="bg-emerald-500/15 text-emerald-200"><BadgeCheck size={12} /> Vetted by Naitrust</Badge><Badge className="bg-white/10 text-white">{agent.available ? 'Available' : 'Unavailable'}</Badge></div><h1 className="mt-3 text-2xl font-bold sm:text-3xl">{displayName}</h1><p className="mt-1 text-sm text-white/65">{agent.profileType === 'company' ? `Representative: ${agent.name}` : 'Independent verified sourcing professional in China'}</p></div><Button size="lg" className="rounded-full" disabled={!agent.available} onClick={() => choosingForOrder ? chooseForOrder() : setHireOpen(true)}>{choosingForOrder ? 'Choose for this order' : order ? 'Invite to this order' : 'Hire this agent'}</Button></div></div>
      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.4fr_.8fr]"><div><h2 className="font-bold">About {agent.profileType === 'company' ? 'the business' : agent.name}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{agent.verificationSummary} Based in {agent.city}, the {agent.profileType === 'company' ? 'team' : 'agent'} supports supplier research, communication, factory checks and inspection evidence for buyers sourcing from China.</p><div className="mt-6 rounded-3xl bg-gradient-to-br from-sky-50 to-indigo-50 p-5 dark:from-sky-950/35 dark:to-indigo-950/25"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">Agent capabilities</p><h2 className="mt-1 font-bold">All services</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{[...agent.services, ...agent.logisticsCapabilities].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-xs font-medium shadow-sm dark:border-white/10 dark:bg-background/55"><CheckCircle2 size={13} className="shrink-0 text-emerald-600" />{item}</div>)}</div></div><h2 className="mt-6 font-bold">Product experience and categories</h2><div className="mt-3 flex flex-wrap gap-2">{agent.expertise.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div></div><div className="space-y-3 rounded-2xl bg-muted/40 p-4 text-sm"><p className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {agent.city}; covers {agent.secondaryCities.join(' and ')}</p><p className="flex items-center gap-2"><Clock3 size={16} className="text-primary" /> {agent.yearsBasedInChina} years based in China</p><p className="flex items-center gap-2"><Languages size={16} className="text-primary" /> {agent.languages.join(', ')}</p><p className="flex items-center gap-2"><Star size={16} className="fill-amber-400 text-amber-400" /> {agent.rating} rating · {agent.completedTasks} completed jobs</p><p className="flex items-center gap-2">{agent.profileType === 'company' ? <Building2 size={16} className="text-primary" /> : <UserRound size={16} className="text-primary" />} {agent.profileType === 'company' ? 'Sourcing company' : 'Independent agent'}</p><div className="border-t pt-3"><p className="text-xs text-muted-foreground">Estimated service range</p><strong>{money(agent.feeFromMinor)}–{money(agent.feeToMinor)}</strong></div></div></div>
    </Card>
    <Card className="rounded-3xl p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MapPin size={18} /></span><div><h2 className="font-bold">Cities served in China</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Locations where this agent is based or available to coordinate sourcing and inspections.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{operatingCities.map((city, index) => <Badge key={city} variant={index === 0 ? 'secondary' : 'outline'}>{city}{index === 0 ? ' · Primary location' : ''}</Badge>)}</div></Card>
    <Card className="rounded-3xl p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><Avatar className="h-16 w-16"><AvatarImage src={photo.src} className="object-cover" /><AvatarFallback>{agent.name.slice(0, 2)}</AvatarFallback></Avatar><div className="flex-1"><p className="text-xs font-semibold text-primary">{agent.profileType === 'company' ? 'Company representative' : 'Your contact'}</p><h2 className="font-bold">{agent.name}</h2><p className="text-sm text-muted-foreground">Ask about availability, category experience or how they would approach your sourcing need.</p></div><Button variant="outline" className="rounded-full" onClick={() => setMessageOpen(true)}><MessageCircle size={15} /> Send a message</Button></div></Card>
    <section><h2 className="font-bold">Your work together</h2><p className="mt-1 text-sm text-muted-foreground">Current and past orders connected to this agent.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{assignments.map((item) => <button key={item.id} type="button" onClick={() => navigate(`/app/agent-assignments/${item.id}`)} className="rounded-2xl border bg-card p-4 text-left"><Badge className="capitalize">{item.status.replace(/_/g, ' ')}</Badge><p className="mt-3 font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.supplierName} · {item.productScopes.map((scopeItem) => scopeItem.productName).join(', ')}</p></button>)}{assignments.length === 0 && <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground sm:col-span-2">You have not worked with this agent yet.</div>}</div></section>
    <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Community feedback</p><h2 className="mt-1 text-xl font-bold">Reviews for {displayName}</h2><p className="mt-1 text-sm text-muted-foreground">Reviews are public. The sourcing agent can reply but cannot review their own profile.</p></div><div className="flex items-center gap-2"><Star size={18} className="fill-amber-400 text-amber-400" /><strong className="text-xl">{averageReview.toFixed(1)}</strong><span className="text-xs text-muted-foreground">({reviews.length} reviews)</span></div></div>
      {user?.id !== agent.id && <div className="mt-5 rounded-2xl border bg-muted/20 p-4"><Label>Your review</Label><div className="mt-3 flex gap-1" aria-label={`${reviewRating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} star${rating === 1 ? '' : 's'}`} onClick={() => setReviewRating(rating)} className="rounded p-1"><Star size={20} className={rating <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'} /></button>)}</div><Textarea className="mt-3 min-h-24" value={reviewBody} onChange={(event) => setReviewBody(event.target.value)} placeholder="Share your experience with this sourcing agent." maxLength={800} /><div className="mt-3 flex items-center justify-between gap-3"><span className="text-[10px] text-muted-foreground">Posted under {user?.name ?? 'your Naitrust account'}</span><Button size="sm" className="rounded-full" disabled={!user || !reviewBody.trim()} onClick={submitReview}>Post review</Button></div></div>}
      <div className="mt-6 space-y-4">{visibleReviews.map((review) => <article key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{review.authorName}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(review.createdAt))}</p></div><div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((rating) => <Star key={rating} size={13} className={rating <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'} />)}</div></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{review.body}</p>{review.reply && <div className="ml-4 mt-3 rounded-2xl bg-primary/[.045] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-primary">Reply from {displayName}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{review.reply.body}</p></div>}{user?.id === agent.id && !review.reply && (replyReviewId === review.id ? <div className="ml-4 mt-3"><Textarea className="min-h-20" value={replyBody} onChange={(event) => setReplyBody(event.target.value)} placeholder="Reply publicly to this review" /><div className="mt-2 flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => { setReplyReviewId(''); setReplyBody(''); }}>Cancel</Button><Button size="sm" className="rounded-full" disabled={!replyBody.trim()} onClick={() => submitReply(review.id)}>Post reply</Button></div></div> : <Button size="sm" variant="ghost" className="mt-2" onClick={() => setReplyReviewId(review.id)}>Reply</Button>)}</article>)}</div>
      {reviewPages > 1 && <div className="mt-6 flex items-center justify-between border-t pt-4"><Button size="sm" variant="outline" className="rounded-full" disabled={reviewPage === 1} onClick={() => setReviewPage((page) => Math.max(1, page - 1))}><ChevronLeft size={14} /> Previous</Button><span className="text-xs text-muted-foreground">Page {reviewPage} of {reviewPages} · 5 per page</span><Button size="sm" variant="outline" className="rounded-full" disabled={reviewPage === reviewPages} onClick={() => setReviewPage((page) => Math.min(reviewPages, page + 1))}>Next <ChevronRight size={14} /></Button></div>}
    </section>
    {!productTitle && <Sheet open={hireOpen} onOpenChange={setHireOpen}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b p-5">
          <SheetTitle>Invite {displayName} to an order</SheetTitle>
          <SheetDescription>Choose the China order you want help with. The agent can review the brief before accepting. No fee or product payment is charged now.</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-5">
          <div>
            <Label>Select an order</Label>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Only active international sourcing orders are shown.</p>
            <div className="mt-3 space-y-2">
              {visibleEligibleOrders.map((item) => {
                const itemSupplier = marketSuppliers.find((supplierItem) => supplierItem.id === item.supplierId);
                return <button key={item.id} type="button" onClick={() => setSelectedOrderId(item.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedOrderId === item.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:border-primary/50'}`}><span className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><PackageSearch size={16} /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{item.itemSummary ?? 'China sourcing order'}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.reference}{itemSupplier ? ` · ${itemSupplier.name}` : ' · Supplier to be confirmed'}</span><span className="mt-1 block text-[10px] capitalize text-muted-foreground">{item.status.replace(/_/g, ' ')} · {item.itemCount ?? 1} item{item.itemCount === 1 ? '' : 's'}</span></span>{selectedOrderId === item.id && <Badge>Selected</Badge>}</span></button>;
              })}
              {!eligibleOrders.length && <div className="rounded-2xl border border-dashed p-6 text-center"><PackageSearch className="mx-auto text-muted-foreground" size={22} /><p className="mt-3 text-sm font-semibold">No eligible China orders</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Start a sourcing order first, then return to invite this agent.</p><Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={() => navigate('/app/orders/new')}>Start an order</Button></div>}
            </div>
            {orderPages > 1 && <div className="mt-3 flex items-center justify-between gap-3"><Button type="button" size="sm" variant="outline" className="rounded-full" disabled={orderPage === 1} onClick={() => setOrderPage((page) => Math.max(1, page - 1))}><ChevronLeft size={14} /> Previous</Button><span className="text-xs text-muted-foreground">Page {orderPage} of {orderPages}</span><Button type="button" size="sm" variant="outline" className="rounded-full" disabled={orderPage === orderPages} onClick={() => setOrderPage((page) => Math.min(orderPages, page + 1))}>Next <ChevronRight size={14} /></Button></div>}
          </div>
          {selectedOrderId && <div><Label htmlFor="agent-invitation-note">Note to the agent <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="agent-invitation-note" className="mt-2 min-h-24" value={invitationNote} onChange={(event) => setInvitationNote(event.target.value)} placeholder="Add anything the agent should know before accepting." /><div className="mt-4 flex gap-2 rounded-2xl bg-muted/55 p-4 text-xs leading-5 text-muted-foreground"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" /> The order title, product links, request details and delivery destination are shared automatically. Pricing is agreed later through the order.</div></div>}
        </div>
        <SheetFooter className="border-t p-5"><Button className="w-full rounded-full" disabled={!selectedOrderId} onClick={hire}>Send order invitation</Button></SheetFooter>
      </SheetContent>
    </Sheet>}
    <Sheet open={messageOpen} onOpenChange={setMessageOpen}><SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md"><SheetHeader className="border-b p-5"><SheetTitle>Message {agent.name}</SheetTitle><SheetDescription>Private two-way conversation before or after hiring.</SheetDescription></SheetHeader><div className="flex-1 space-y-3 overflow-y-auto p-5">{directMessages.map((item, index) => <div key={`${item.role}-${index}`} className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${item.role === 'buyer' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'}`}>{item.body}</div>)}</div><div className="border-t p-4"><Textarea value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Write in English or Chinese" className="min-h-24" /><Button className="mt-3 w-full rounded-full" onClick={() => { if (!messageDraft.trim()) return; setDirectMessages((items) => [...items, { role: 'buyer', body: messageDraft.trim() }]); setMessageDraft(''); toast.success('Message added to this demo conversation.'); }}><MessageCircle size={15} /> Send message</Button><p className="mt-2 text-[10px] text-muted-foreground">Production messages will be translated bidirectionally and kept in the shared conversation.</p></div></SheetContent></Sheet>
    {productTitle && <Dialog open={hireOpen} onOpenChange={setHireOpen}><DialogContent className="z-[70] max-w-lg rounded-3xl"><DialogHeader><DialogTitle>Hire {displayName} for this inspection?</DialogTitle><DialogDescription>The product, supplier and location will be attached to the request.</DialogDescription></DialogHeader>{productHireStage === 'confirm' && <div className="space-y-4"><div className="flex gap-3 rounded-2xl border p-3">{productImage && <img src={productImage} alt="" className="h-20 w-20 rounded-xl object-cover" />}<div><p className="text-sm font-bold">{productTitle}</p><p className="mt-1 text-xs text-muted-foreground">{productSupplier} · {productCity}</p><p className="mt-1 text-xs font-semibold">{productPrice}</p></div></div><p className="rounded-2xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">The agent may accept, decline, or recommend another qualified agent. No inspection begins and no order room is created until acceptance and activation-fee payment.</p></div>}{productHireStage === 'awaiting' && <div className="space-y-4 text-center"><Clock3 className="mx-auto text-primary" size={34} /><p className="font-bold">Waiting for the agent’s response</p><p className="text-sm text-muted-foreground">Choose a response below to test each possible outcome.</p><div className="grid grid-cols-3 gap-2"><Button size="sm" onClick={() => setProductHireStage('accepted')}>Accept</Button><Button size="sm" variant="outline" onClick={() => setProductHireStage('declined')}>Decline</Button><Button size="sm" variant="outline" onClick={() => setProductHireStage('redirected')}>Refer</Button></div></div>}{productHireStage === 'accepted' && <div className="space-y-4"><div className="rounded-2xl bg-emerald-500/10 p-4"><p className="font-bold text-emerald-800 dark:text-emerald-200">Agent accepted the inspection</p><p className="mt-1 text-xs text-muted-foreground">Proposed review date: {deadline}. Work begins after activation.</p></div><div className="flex items-center justify-between rounded-2xl border p-4"><div><p className="text-xs text-muted-foreground">Activation fee</p><strong className="text-xl">{money(Math.max(2500000, Math.round(agent.feeFromMinor * .25)))}</strong></div><Badge variant="outline">Pay first</Badge></div></div>}{productHireStage === 'declined' && <div className="rounded-2xl bg-amber-500/10 p-5 text-center"><p className="font-bold">Agent declined</p><p className="mt-2 text-sm text-muted-foreground">No fee was charged and no order room was created.</p></div>}{productHireStage === 'redirected' && <div className="rounded-2xl bg-sky-500/10 p-5 text-center"><p className="font-bold">Another agent was recommended</p><p className="mt-2 text-sm text-muted-foreground">Choose a closer available specialist for this supplier location.</p></div>}<DialogFooter>{productHireStage === 'confirm' && <Button className="w-full rounded-full" onClick={() => setProductHireStage('awaiting')}>Send inspection request</Button>}{productHireStage === 'accepted' && <Button className="w-full rounded-full" onClick={hire}>Pay activation fee and create order room</Button>}{(productHireStage === 'declined' || productHireStage === 'redirected') && <Button className="w-full rounded-full" onClick={() => navigate(`/app/agents?${params.toString()}`)}>Choose another agent</Button>}</DialogFooter></DialogContent></Dialog>}
  </div></DashboardLayout>;
}
