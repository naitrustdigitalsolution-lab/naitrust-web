import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, MapPinned, Search, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { sourcingApi } from '../../features/sourcing/api/sourcing.api';
import { AgentCard } from '../../features/sourcing/components/AgentCard';
import { OperationsHeader } from '../../features/sourcing/components/OperationsHeader';
import type { AgentProfile } from '../../features/sourcing/domain/types';
import { useOperationsRefresh } from '../../features/sourcing/hooks/use-operations-refresh';

export function AgentDirectoryPage() {
  const operationsVersion = useOperationsRefresh();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestId = params.get('request');
  const request = useMemo(() => {
    void operationsVersion;
    return requestId ? sourcingApi.getRequest(requestId) : undefined;
  }, [operationsVersion, requestId]);
  const [query, setQuery] = useState('');
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [selected, setSelected] = useState<AgentProfile | null>(null);
  const [title, setTitle] = useState(request ? `Review ${request.title}` : 'Supplier sourcing and inspection');
  const [scope, setScope] = useState(request ? `Confirm the supplier, review ${request.quantity} units, bargain where appropriate, inspect the agreed specifications, and upload evidence.` : 'Confirm the supplier, inspect the products, and upload evidence.');
  const [deadline, setDeadline] = useState('2026-09-15');
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
    return request ? sourcingApi.recommendAgents({ city: request.supplierCity ?? 'Guangzhou', category: request.category }) : [];
  }, [operationsVersion, request]);
  const reasons = useMemo(() => new Map(recommendations.map((item) => [item.agent.id, item.reasons])), [recommendations]);
  const filtered = useMemo(() => agents.filter((agent) => {
    const haystack = `${agent.name} ${agent.city} ${agent.expertise.join(' ')} ${agent.services.join(' ')}`.toLowerCase();
    return (!query.trim() || haystack.includes(query.toLowerCase())) && (!favouritesOnly || favouriteIds.includes(agent.id));
  }).sort((left, right) => (reasons.has(right.id) ? 1 : 0) - (reasons.has(left.id) ? 1 : 0)), [agents, favouriteIds, favouritesOnly, query, reasons]);

  const hire = () => {
    if (!selected) return;
    const assignment = sourcingApi.hireAgent({ agentId: selected.id, sourcingRequestId: request?.id, supplierName: request?.supplierName ?? 'Supplier to be confirmed', supplierCity: request?.supplierCity ?? selected.city, title, scope, deadline, productNames: [request?.title ?? title] });
    toast.success(`${selected.name} has been invited.`);
    setSelected(null);
    navigate(`/app/agent-assignments/${assignment.id}`);
  };

  return <DashboardLayout title="Sourcing agents"><div className="mx-auto w-full max-w-6xl space-y-5">
    <OperationsHeader eyebrow="Nigerian agents in China" title={request ? `Agents near ${request.supplierCity}` : 'Find trusted help near your supplier'} description={request ? `Nigerian-led agents operating near ${request.supplierCity}. Compare expertise, evidence services, availability, and pricing before you choose.` : 'Search vetted Nigerian professionals and sourcing companies based in active China trade locations.'} icon={MapPinned} badge={request ? 'Recommended for this request' : 'Buyer chooses'} />
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search city, service or expertise" /></div><Button variant={favouritesOnly ? 'default' : 'outline'} className="rounded-full" onClick={() => setFavouritesOnly((value) => !value)}><Heart size={14} className={favouritesOnly ? 'fill-current' : ''} /> Favourites</Button><Badge variant="outline"><SlidersHorizontal size={12} /> {filtered.length} agents</Badge></div>
    {request && <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-primary/[.045] p-4 text-xs"><strong>{request.title}</strong><span className="text-muted-foreground">{request.quantity.toLocaleString()} units</span><span className="text-muted-foreground">{request.supplierCity}, China</span><Badge variant="secondary">{request.category}</Badge></div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((agent) => <AgentCard key={agent.id} agent={agent} favourite={favouriteIds.includes(agent.id)} reasons={reasons.get(agent.id)} onFavourite={() => { const saved = sourcingApi.toggleFavouriteAgent(agent.id); toast.success(saved ? 'Agent saved to favourites.' : 'Agent removed from favourites.'); }} onHire={() => setSelected(agent)} />)}</div>
    <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Hire {selected?.name}</DialogTitle><DialogDescription>One assignment covers this supplier. Each product keeps its own inspection requirements and evidence.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="agent-task-title">Assignment title</Label><Input id="agent-task-title" className="mt-2" value={title} onChange={(event) => setTitle(event.target.value)} /></div><div><Label htmlFor="agent-task-scope">Scope and required evidence</Label><Textarea id="agent-task-scope" className="mt-2 min-h-28" value={scope} onChange={(event) => setScope(event.target.value)} /></div><div><Label htmlFor="agent-task-deadline">Deadline</Label><Input id="agent-task-deadline" className="mt-2" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></div><div className="rounded-2xl bg-muted/55 p-4 text-xs leading-5 text-muted-foreground">Estimated service range: {selected ? `${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(selected.feeFromMinor / 100)}–${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(selected.feeToMinor / 100)}` : ''}. The final fee is confirmed before payment. The agent cannot control supplier funds.</div></div><DialogFooter><Button className="w-full rounded-full" onClick={hire}>Create agent assignment</Button></DialogFooter></DialogContent></Dialog>
  </div></DashboardLayout>;
}
