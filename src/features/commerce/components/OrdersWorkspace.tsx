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
  const orders = marketplaceApi.listOrders();
  const [query, setQuery] = useState('');
  const [market, setMarket] = useState<'all' | 'international' | 'domestic'>('all');
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const supplier = marketSuppliers.find((candidate) => candidate.id === order.supplierId);
    const matchesMarket = market === 'all' || order.deliveryMode === market;
    const searchText = `${supplier?.name ?? ''} ${supplier?.city ?? ''} ${order.reference} ${order.itemSummary ?? ''}`.toLowerCase();
    return matchesMarket && searchText.includes(query.trim().toLowerCase());
  }), [market, orders, query]);
  const money = (amountMinor: number, currency: string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: currency === 'USD' ? 2 : 0 }).format(amountMinor / 100);

  return (
    <div className="w-full">
      <WorkspaceHeader
        eyebrow="Purchase orders"
        title="Track every supplier order"
        description="Each supplier stays separate in its own Order Room, with products, quotes, agent checks, payment decisions, documents and delivery progress connected from start to finish."
        icon={Package}
        image={getAppImage('orders', 'A wholesale order moving through supplier and delivery stages')}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4"><strong className="text-2xl">{orders.length}</strong><span className="mt-1 block text-xs text-muted-foreground">Supplier orders</span></div>
        <div className="rounded-2xl border bg-card p-4"><strong className="text-2xl">{orders.filter((order) => order.deliveryMode === 'international').length}</strong><span className="mt-1 block text-xs text-muted-foreground">China orders</span></div>
        <div className="rounded-2xl border bg-card p-4"><strong className="text-2xl">{orders.filter((order) => order.deliveryMode === 'domestic').length}</strong><span className="mt-1 block text-xs text-muted-foreground">Nigeria orders</span></div>
      </div>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-card p-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search supplier, product or order reference" /></div>
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1">
          {([['all', 'All orders'], ['international', 'China'], ['domestic', 'Nigeria']] as const).map(([value, label]) => <Button key={value} size="sm" variant={market === value ? 'default' : 'ghost'} className="shrink-0 rounded-lg" onClick={() => setMarket(value)}>{label}</Button>)}
        </div>
        <Button className="rounded-full" onClick={() => navigate('/app/market')}><Plus size={15} /> Start new order</Button>
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
            const quote = marketplaceApi.listQuotes().find((candidate) => candidate.id === order.quoteId);
            const currentStep = order.timeline.find((step) => !step.complete);
            const completedSteps = order.timeline.filter((step) => step.complete).length;
            const progress = Math.round((completedSteps / order.timeline.length) * 100);
            const itemCount = order.itemCount ?? quote?.cart.items.length ?? 1;
            return (
              <button key={order.id} type="button" onClick={() => navigate(`/app/orders/${order.id}`)} className="grid w-full gap-4 p-4 text-left transition hover:bg-muted/35 sm:p-5 lg:grid-cols-[minmax(250px,1.3fr)_minmax(180px,.8fr)_minmax(150px,.65fr)_130px_110px] lg:items-center lg:gap-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><Badge>{order.deliveryMode === 'international' ? 'China import' : 'Nigeria local'}</Badge><span className="text-[11px] text-muted-foreground">{order.reference}</span></div>
                  <h2 className="mt-2 truncate font-bold">{supplier?.name ?? 'Supplier order'}</h2>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{order.itemSummary ?? `${itemCount} product${itemCount === 1 ? '' : 's'}`}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={11} /> {supplier?.city}, {supplier?.country === 'CN' ? 'China' : 'Nigeria'}</p>
                </div>
                <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground lg:hidden">Current stage</p><p className="mt-1 text-sm font-semibold">{currentStep?.label ?? 'Order complete'}</p><p className="mt-1 text-xs text-muted-foreground">{order.deliveryMode === 'international' ? 'Supplier, agent and logistics' : 'Supplier and local delivery'}</p></div>
                <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground lg:hidden">Order value</p><p className="mt-1 text-sm font-bold tabular-nums">{money(order.paymentAmountMinor, order.paymentCurrency)}</p><p className="mt-1 text-xs text-muted-foreground">{itemCount} line item{itemCount === 1 ? '' : 's'}</p></div>
                <div>
                  <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">{completedSteps}/{order.timeline.length} stages</span><strong>{progress}%</strong></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>
                </div>
                <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-primary">Open room <ChevronRight size={14} /></span>
              </button>
            );
          })}
          {filteredOrders.length === 0 && <div className="px-5 py-12 text-center"><Globe2 className="mx-auto text-muted-foreground" size={24} /><p className="mt-3 text-sm font-semibold">No matching orders</p><p className="mt-1 text-xs text-muted-foreground">Try another search or market filter.</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
