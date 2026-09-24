import { useMemo, useState } from 'react';
import { ChevronRight, Globe2, MapPin, Package, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { getAppImage } from '../../../libs/images/image-manifest';
import { marketSuppliers, marketplaceApi } from '../../../libs/marketplace/marketplace.api';
import { WorkspaceEmpty } from './WorkspaceEmpty';
import { WorkspaceHeader } from './WorkspaceHeader';

export function OrdersWorkspace() {
  const navigate = useNavigate();
  // The current launch corridor is China to Nigeria. Domestic Nigeria supplier
  // orders stay out of this workspace until that market is enabled again.
  const orders = marketplaceApi.listOrders().filter((order) => order.deliveryMode === 'international');
  // Every order has a sourcing agent by default; there is no self-sourced path.
  const [query, setQuery] = useState('');
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const supplier = marketSuppliers.find((candidate) => candidate.id === order.supplierId);
    const searchText = `${supplier?.name ?? ''} ${supplier?.city ?? ''} ${order.reference} ${order.itemSummary ?? ''}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  }), [orders, query]);
  const money = (amountMinor: number, currency: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: currency === 'USD' ? 2 : 0 }).format(amountMinor / 100);

  return (
    <div className="w-full">
      <WorkspaceHeader
        eyebrow="Purchase orders"
        title="Track every supplier order"
        description="Track every China supplier in a separate Order Room, including products, quotes, sourcing agent checks, payment decisions, documents and delivery progress to Nigeria."
        icon={Package}
        image={getAppImage('orders', 'A wholesale order moving through supplier and delivery stages')}
      />
      <div className="mb-5 rounded-2xl border bg-card p-4 sm:max-w-xs"><strong className="text-2xl">{orders.length}</strong><span className="mt-1 block text-xs text-muted-foreground">Supplier orders</span></div>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-card p-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search supplier, product or order reference" /></div>
        <Button className="rounded-full" onClick={() => navigate('/app/orders/new')}><Plus size={15} /> Start new order</Button>
      </div>
      {orders.length === 0 ? (
        <WorkspaceEmpty icon={Package} title="No orders yet" description="Accepted supplier quotes appear here as separate orders." actionLabel="View quotes" onAction={() => navigate('/app/quotes')} />
      ) : (
        <div className="overflow-hidden rounded-3xl border bg-card">
          <div className="hidden grid-cols-[minmax(250px,1.3fr)_minmax(180px,.8fr)_minmax(150px,.65fr)_130px_110px] gap-5 border-b bg-muted/35 px-5 py-3 text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground lg:grid">
            <span>Supplier and products</span><span>Current stage</span><span>Order value</span><span>Progress</span><span />
          </div>
          <div className="divide-y">
          {filteredOrders.map((order) => {
            const supplier = marketSuppliers.find((candidate) => candidate.id === order.supplierId);
            const quote = order.quoteId ? marketplaceApi.listQuotes().find((candidate) => candidate.id === order.quoteId) : undefined;
            const timeline = order.timeline ?? [];
            const currentStep = timeline.find((step) => !step.complete);
            const completedSteps = timeline.filter((step) => step.complete).length;
            const progress = timeline.length ? Math.round((completedSteps / timeline.length) * 100) : 0;
            const itemCount = order.itemCount ?? quote?.cart.items.length ?? 1;
            const awaitingAgent = !order.supplierId;
            return (
              <button key={order.id} type="button" onClick={() => navigate(`/app/orders/${order.id}`)} className="grid w-full gap-4 p-4 text-left transition hover:bg-muted/35 sm:p-5 lg:grid-cols-[minmax(250px,1.3fr)_minmax(180px,.8fr)_minmax(150px,.65fr)_130px_110px] lg:items-center lg:gap-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><Badge>China import</Badge><span className="text-[11px] text-muted-foreground">{order.reference}</span></div>
                  <h2 className="mt-2 truncate font-bold">{supplier?.name ?? 'Supplier order'}</h2>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{order.itemSummary ?? `${itemCount} product${itemCount === 1 ? '' : 's'}`}</p>
                  {supplier && <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={11} /> {supplier.city}, China</p>}
                </div>
                <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground lg:hidden">Current stage</p><p className="mt-1 text-sm font-semibold">{awaitingAgent ? 'Awaiting a sourcing agent' : currentStep?.label ?? 'Order complete'}</p><p className="mt-1 text-xs text-muted-foreground">Supplier, agent and logistics</p></div>
                <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground lg:hidden">Order value</p><p className="mt-1 text-sm font-bold tabular-nums">{awaitingAgent ? 'Not priced yet' : money(order.paymentAmountMinor ?? 0, order.paymentCurrency ?? 'NGN')}</p><p className="mt-1 text-xs text-muted-foreground">{itemCount} line item{itemCount === 1 ? '' : 's'}</p></div>
                <div>
                  <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">{awaitingAgent ? '—' : `${completedSteps}/${timeline.length} stages`}</span><strong>{awaitingAgent ? '' : `${progress}%`}</strong></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>
                </div>
                <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-primary">Open room <ChevronRight size={14} /></span>
              </button>
            );
          })}
          {filteredOrders.length === 0 && <div className="px-5 py-12 text-center"><Globe2 className="mx-auto text-muted-foreground" size={24} /><p className="mt-3 text-sm font-semibold">No matching orders</p><p className="mt-1 text-xs text-muted-foreground">Try another search.</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
