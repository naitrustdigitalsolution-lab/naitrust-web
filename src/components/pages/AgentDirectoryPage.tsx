import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, MapPinned, Search, SlidersHorizontal, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { sourcingApi } from '../../features/sourcing/api/sourcing.api';
import { AgentCard } from '../../features/sourcing/components/AgentCard';
import { useOperationsRefresh } from '../../features/sourcing/hooks/use-operations-refresh';
import { marketSuppliers, marketplaceApi } from '../../libs/marketplace/marketplace.api';
import { readCreateOrderDraft, selectAgentForCreateOrder } from '../../libs/marketplace/create-order-draft';

export function AgentDirectoryPage() {
  const AGENTS_PER_PAGE = 12;
  const operationsVersion = useOperationsRefresh();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestId = params.get('request');
  const supplierId = params.get('supplier');
  const orderId = params.get('order');
  const productTitle = params.get('title');
  const productSupplier = params.get('supplier');
  const productCity = params.get('city');
  const choosingForOrder = params.get('mode') === 'order-create';
  const returnTo = params.get('returnTo') ?? '/app/orders/new';
  const orderDraft = choosingForOrder ? readCreateOrderDraft() : undefined;
  const supplier = supplierId ? marketSuppliers.find((item) => item.id === supplierId) : undefined;
  const order = orderId ? marketplaceApi.listOrders().find((item) => item.id === orderId) : undefined;
  const request = useMemo(() => {
    void operationsVersion;
    return requestId ? sourcingApi.getRequest(requestId) : undefined;
  }, [operationsVersion, requestId]);
  const [query, setQuery] = useState('');
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const agents = useMemo(() => {
    void operationsVersion;
    return sourcingApi.listAgents();
  }, [operationsVersion]);
  const favouriteIds = useMemo(() => {
    void operationsVersion;
    return sourcingApi.listFavouriteAgentIds();
  }, [operationsVersion]);
  const recommendations = useMemo(() => {
    void operationsVersion;
    const city = request?.supplierCity ?? supplier?.city;
    const category = request?.category ?? supplier?.category;
    return city && category ? sourcingApi.recommendAgents({ city, category }) : [];
  }, [operationsVersion, request, supplier]);
  const reasons = useMemo(() => new Map(recommendations.map((item) => [item.agent.id, item.reasons])), [recommendations]);
  const filtered = useMemo(() => agents.filter((agent) => {
    const haystack = `${agent.name} ${agent.businessName ?? ''} ${agent.profileType} ${agent.city} ${agent.secondaryCities.join(' ')} ${agent.expertise.join(' ')} ${agent.services.join(' ')}`.toLowerCase();
    return (!query.trim() || haystack.includes(query.toLowerCase())) && (!favouritesOnly || favouriteIds.includes(agent.id));
  }).sort((left, right) => {
    const favouriteDifference = Number(favouriteIds.includes(right.id)) - Number(favouriteIds.includes(left.id));
    if (favouriteDifference) return favouriteDifference;
    if (left.available !== right.available) return left.available ? -1 : 1;
    const recommendationDifference = (reasons.has(right.id) ? 1 : 0) - (reasons.has(left.id) ? 1 : 0);
    return recommendationDifference || right.rating - left.rating;
  }), [agents, favouriteIds, favouritesOnly, query, reasons]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / AGENTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleAgents = filtered.slice((currentPage - 1) * AGENTS_PER_PAGE, currentPage * AGENTS_PER_PAGE);

  const openProfile = (agentId: string) => navigate(`/app/agents/${agentId}${params.toString() ? `?${params.toString()}` : ''}`);
  const startHire = (agentId: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('hire', '1');
    navigate(`/app/agents/${agentId}?${nextParams.toString()}`);
  };
  const chooseAgent = (agentId: string, agentName: string) => {
    selectAgentForCreateOrder(agentId);
    toast.success(`${agentName} added to “${orderDraft?.orderTitle ?? 'your order'}”.`);
    navigate(returnTo);
  };

  return <DashboardLayout title="Sourcing agents"><div className="w-full space-y-5">
    <section className="flex flex-col justify-between gap-4 border-b pb-5 lg:flex-row lg:items-end"><div>{choosingForOrder && <Button variant="ghost" size="sm" className="-ml-3 mb-2" onClick={() => navigate(returnTo)}><ArrowLeft size={15} /> Back to order</Button>}<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-primary"><MapPinned size={15} /> Verified sourcing-agent network</div><h1 className="mt-2 text-2xl font-bold">{choosingForOrder ? `Choose an agent for “${orderDraft?.orderTitle ?? 'your order'}”` : productTitle ? `Choose a sourcing agent for this product` : request || supplier ? `Sourcing agents near ${request?.supplierCity ?? supplier?.city}` : 'Sourcing agents in China'}</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{choosingForOrder ? 'Choose directly from a card, or view the full profile before deciding. Your order draft stays saved.' : "Review each sourcing professional's identity, location, category experience and inspection service record before assigning supplier work."}</p></div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{agents.length} verified profiles</Badge>{!choosingForOrder && <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/partners/agent/apply')}><UserPlus size={14} /> Register as a sourcing agent</Button>}</div></section>
    <div className="flex flex-wrap items-center gap-2"><div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} /><Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-9 pl-9" placeholder="City, category or service" /></div><Button size="sm" variant={favouritesOnly ? 'default' : 'outline'} className="rounded-full" onClick={() => setFavouritesOnly((value) => !value)}><Heart size={14} className={favouritesOnly ? 'fill-current' : ''} /> Saved</Button><Badge variant="secondary"><SlidersHorizontal size={12} /> {filtered.length} matches</Badge></div>
    {request && <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-primary/[.045] p-4 text-xs"><strong>{request.title}</strong><span className="text-muted-foreground">{request.quantity.toLocaleString()} units</span><span className="text-muted-foreground">{request.supplierCity}, China</span><Badge variant="secondary">{request.category}</Badge></div>}
    {!request && supplier && <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-primary/[.045] p-4 text-xs"><strong>{order?.itemSummary ?? 'Supplier order'}</strong><span className="text-muted-foreground">{supplier.name}</span><span className="text-muted-foreground">{supplier.city}, China</span><Badge variant="secondary">{supplier.category}</Badge></div>}
    {productTitle && <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-primary/[.045] p-4 text-xs"><strong>{productTitle}</strong><span className="text-muted-foreground">{productSupplier}</span><span className="text-muted-foreground">{productCity}</span><Badge variant="secondary">Product inspection</Badge></div>}
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{visibleAgents.map((agent) => <AgentCard key={agent.id} agent={agent} favourite={favouriteIds.includes(agent.id)} reasons={reasons.get(agent.id)} onFavourite={() => { const saved = sourcingApi.toggleFavouriteAgent(agent.id); toast.success(saved ? 'Agent saved to favourites.' : 'Agent removed from favourites.'); }} onViewProfile={() => openProfile(agent.id)} primaryActionLabel={choosingForOrder ? 'Choose' : 'Hire'} onPrimaryAction={() => choosingForOrder ? chooseAgent(agent.id, agent.businessName ?? agent.name) : startHire(agent.id)} />)}</div>
    {filtered.length > AGENTS_PER_PAGE && <nav aria-label="Agent directory pagination" className="flex items-center justify-between border-t pt-5"><Button variant="outline" className="rounded-full" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={15} /> Previous</Button><span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span><Button variant="outline" className="rounded-full" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next <ChevronRight size={15} /></Button></nav>}
  </div></DashboardLayout>;
}
