import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, FileCheck2, ShoppingBag } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { sourcingApi } from '../../features/sourcing/api/sourcing.api';
import { useOperationsRefresh } from '../../features/sourcing/hooks/use-operations-refresh';
import { marketplaceApi } from '../../libs/marketplace/marketplace.api';

const orderRoomPath = (relatedOrderId?: string, focusAgent = false) => {
  if (!relatedOrderId) return undefined;
  const order = marketplaceApi.listOrders().find((item) => item.id === relatedOrderId);
  if (!order) return undefined;
  const base = order.roomId ? `/app/deals/${order.roomId}` : `/app/orders/${order.id}`;
  return focusAgent && order.roomId ? `${base}?tab=chat&audience=agent` : base;
};

export function AgentAssignmentPage() {
  useOperationsRefresh();
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId?: string }>();
  const assignments = sourcingApi.listAssignments();

  // Old assignment-room links remain safe bookmarks, but the Order Room is now
  // the only workspace and audit trail for order-related agent activity.
  if (assignmentId) {
    const assignment = sourcingApi.getAssignment(assignmentId);
    const roomPath = orderRoomPath(assignment?.relatedOrderId, true);
    return <Navigate to={roomPath ?? '/app/agent-assignments'} replace />;
  }

  const linkedAssignments = assignments.filter((item) => orderRoomPath(item.relatedOrderId));
  const unlinkedAssignments = assignments.filter((item) => !orderRoomPath(item.relatedOrderId));

  return <DashboardLayout title="Orders with agent support"><div className="mx-auto w-full max-w-6xl space-y-5">
    <section className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Order support</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Orders with agent support</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Track supplier checks, negotiation, product evidence and agent recommendations inside each Order Room. One order, one complete audit trail.</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{linkedAssignments.length} {linkedAssignments.length === 1 ? 'order' : 'orders'}</Badge><Button size="sm" className="rounded-full" onClick={() => navigate('/app/agents')}>Find an agent</Button></div></section>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{linkedAssignments.map((item) => {
      const agent = sourcingApi.listAgents().find((candidate) => candidate.id === item.agentId);
      const displayName = agent?.profileType === 'company' ? agent.businessName ?? agent.name : agent?.name;
      const roomPath = orderRoomPath(item.relatedOrderId)!;
      return <button key={item.id} type="button" onClick={() => navigate(roomPath)} className="group rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"><div className="flex items-start justify-between gap-3"><Badge className="capitalize">{item.status.replace(/_/g, ' ')}</Badge><span className="text-[10px] text-muted-foreground">Review {new Date(item.deadline).toLocaleDateString()}</span></div><h2 className="mt-3 line-clamp-2 text-sm font-bold group-hover:text-primary">{item.title}</h2><p className="mt-1 truncate text-xs text-muted-foreground">Agent: {displayName}</p><div className="mt-3 rounded-xl bg-muted/40 p-3"><p className="truncate text-xs font-medium">{item.supplierName}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.supplierCity}, China · {item.productScopes.length} product {item.productScopes.length === 1 ? 'scope' : 'scopes'}</p></div><div className="mt-3 flex items-center justify-between gap-3 border-t pt-3"><span className="text-[10px] text-muted-foreground">{item.evidence.length} evidence · {item.messages.length} messages</span><span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Open Order Room <ArrowRight size={13} /></span></div></button>;
    })}{linkedAssignments.length === 0 && <Card className="col-span-full rounded-2xl border-dashed p-8 text-center sm:p-12"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileCheck2 size={21} /></span><h2 className="mt-4 font-bold">No orders have agent support yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Open an existing order and add a verified sourcing agent. Their work will stay inside that Order Room.</p><Button className="mt-5 rounded-full" onClick={() => navigate('/app/orders')}><ShoppingBag size={15} /> View orders</Button></Card>}</div>

    {unlinkedAssignments.length > 0 && <Card className="rounded-2xl border-dashed p-5"><p className="text-sm font-bold">{unlinkedAssignments.length} older {unlinkedAssignments.length === 1 ? 'assignment needs' : 'assignments need'} an order</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Standalone assignments no longer open a separate room. Attach future agent work to an order so messages, evidence and approvals have one source of truth.</p><Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={() => navigate('/app/orders')}>Choose an order</Button></Card>}
  </div></DashboardLayout>;
}
