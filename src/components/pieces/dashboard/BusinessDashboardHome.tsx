import { ArrowRight, BadgeCheck, Boxes, ClipboardList, PackageSearch, Search, Store, UserCheck, WalletCards, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { marketplaceApi, marketSuppliers } from '../../../libs/marketplace/marketplace.api';
import type { SafeDealSummary, WalletAccount } from '../../../libs/store/types';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import { getAppImage } from '../../../libs/images/image-manifest';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { BusinessVerificationModal } from '../business/BusinessVerificationModal';
import { SecureAccountModal } from '../security/SecureAccountModal';
import { DashboardLayout } from './DashboardLayout';

interface BusinessDashboardHomeProps {
  firstName: string;
  businessName: string;
  verified: boolean;
  businessLoading: boolean;
  wallet: WalletAccount | undefined;
  walletLoading: boolean;
  deals: SafeDealSummary[] | undefined;
  dealsLoading: boolean;
  dealsError: boolean;
  onOpenDeal: (deal: SafeDealSummary) => void;
}

const actions = [
  { label: 'Find a product', detail: 'Search the wholesale market', icon: Search, path: '/app/market' },
  { label: 'Source from a link', detail: 'Paste a China product link', icon: ClipboardList, path: '/app/source' },
  { label: 'Build a product', detail: 'Plan product, packaging and labels', icon: Workflow, path: '/app/production' },
  { label: 'Sell on Naitrust', detail: 'Manage your showcase and products', icon: Store, path: '/app/showcase' },
] as const;

export function BusinessDashboardHome({
  firstName,
  businessName,
  verified,
  businessLoading,
  wallet,
  walletLoading,
  deals,
  dealsLoading,
  dealsError,
  onOpenDeal,
}: BusinessDashboardHomeProps) {
  const navigate = useNavigate();
  const quotes = marketplaceApi.listQuotes();
  const orders = marketplaceApi.listOrders();
  const activeOrders = orders.filter((order) => !['released', 'cancelled'].includes(order.status));
  const activeOrder = activeOrders[0];
  const heroImage = getAppImage('businessCommerce', 'A Nigerian business team preparing wholesale products');

  return (
    <DashboardLayout title="Business home">
      <BusinessVerificationModal />
      <SecureAccountModal />
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="relative overflow-hidden rounded-3xl bg-[#04162f] text-white shadow-[0_18px_50px_rgba(4,22,47,.18)]">
          <img src={heroImage.src} alt={heroImage.alt} className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04162f] via-[#04162f]/95 to-[#04162f]/25" />
          <div className="relative max-w-3xl p-5 sm:p-7 lg:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/65"><span>Good day, {firstName}</span>{verified && <Badge className="border-emerald-300/20 bg-emerald-400/15 text-emerald-200"><BadgeCheck size={12} /> Verified business</Badge>}</div>
            {businessLoading ? <Skeleton className="mt-4 h-9 w-64 bg-white/15" /> : <h1 className="mt-3 text-2xl font-bold tracking-[-.035em] sm:text-4xl">Buy wholesale. Build your product. Sell locally.</h1>}
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{businessName} can source from China or Nigeria, coordinate checks and shipping, and manage its local catalogue from one account.</p>
            <div className="mt-5 flex flex-wrap gap-2"><Button className="rounded-full bg-white text-[#071b31] hover:bg-white/90" onClick={() => navigate('/app/market')}><Search size={16} /> Explore market</Button><Button variant="outline" className="rounded-full border-white/20 bg-white/[.07] text-white hover:bg-white/15 hover:text-white" onClick={() => navigate('/app/orders')}>View orders <ArrowRight size={15} /></Button></div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)]">
          <Card className="rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Current sourcing</p><h2 className="mt-2 text-xl font-bold">{activeOrder ? 'Your next order update' : 'Start your first wholesale order'}</h2></div><Badge variant="outline">{activeOrders.length} active</Badge></div>
            {activeOrder ? <button type="button" onClick={() => navigate(`/app/orders/${activeOrder.id}`)} className="mt-5 flex w-full items-center gap-4 rounded-2xl border bg-muted/20 p-4 text-left transition hover:border-primary/30"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><PackageSearch size={20} /></span><span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">{activeOrder.reference}</span><strong className="mt-1 block truncate">{marketSuppliers.find((supplier) => supplier.id === activeOrder.supplierId)?.name}</strong><span className="mt-1 block text-xs capitalize text-muted-foreground">{activeOrder.status.replace(/_/g, ' ')}</span></span><ArrowRight size={16} /></button> : <p className="mt-4 text-sm leading-6 text-muted-foreground">Browse a listed product or paste a supplier link. Naitrust will organize the request before a quote is confirmed.</p>}
            <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" className="rounded-full" onClick={() => navigate('/app/orders')}>All orders</Button><Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate('/app/agent-assignments')}><UserCheck size={14} /> Agent checks</Button><Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate('/app/shipments')}>Shipping</Button></div>
          </Card>

          <Card className="rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><WalletCards size={18} /></span><Button variant="ghost" size="sm" onClick={() => navigate('/app/wallet')}>Open wallet</Button></div>
            <p className="mt-5 text-xs text-muted-foreground">Available order funds and earnings</p>
            {walletLoading || !wallet ? <Skeleton className="mt-2 h-9 w-40" /> : <p className="mt-1 text-2xl font-bold">{formatMinorAmount(wallet.balance.availableMinor, wallet.balance.currency)}</p>}
            <div className="mt-5 grid grid-cols-2 gap-2 border-t pt-4 text-sm"><button type="button" onClick={() => navigate('/app/quotes')} className="rounded-xl bg-muted/45 p-3 text-left"><strong className="block text-lg">{quotes.filter((quote) => quote.status === 'ready').length}</strong><span className="text-xs text-muted-foreground">Ready quotes</span></button><button type="button" onClick={() => navigate('/app/products')} className="rounded-xl bg-muted/45 p-3 text-left"><Boxes size={17} className="mb-1 text-primary" /><span className="text-xs text-muted-foreground">Your products</span></button></div>
          </Card>
        </section>

        <section>
          <div className="mb-3"><h2 className="text-lg font-semibold">What do you want to do?</h2><p className="mt-1 text-sm text-muted-foreground">Go directly to the task you need.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{actions.map((action) => <button key={action.label} type="button" onClick={() => navigate(action.path)} className="group flex items-center gap-3 rounded-2xl border bg-card p-4 text-left transition hover:border-primary/35 hover:bg-primary/[.025]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><action.icon size={18} /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{action.label}</strong><span className="mt-1 block text-xs text-muted-foreground">{action.detail}</span></span><ArrowRight size={14} className="text-muted-foreground transition group-hover:translate-x-0.5" /></button>)}</div>
        </section>

        <Card className="rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Recent selling activity</h2><p className="mt-1 text-xs text-muted-foreground">Customer orders and services connected to your business.</p></div><Button variant="ghost" size="sm" onClick={() => navigate('/app/deals')}>View all</Button></div>
          {dealsLoading ? <Skeleton className="mt-4 h-16 w-full" /> : dealsError ? <p className="mt-4 text-sm text-muted-foreground">Selling activity is unavailable right now.</p> : !deals?.length ? <div className="mt-4 rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">No customer activity yet. Complete your showcase so buyers can enquire.</div> : <div className="mt-4 grid gap-2 sm:grid-cols-2">{deals.slice(0, 2).map((deal) => <button key={deal.id} type="button" onClick={() => onOpenDeal(deal)} className="rounded-2xl border p-4 text-left"><p className="truncate text-sm font-semibold">{deal.title}</p><p className="mt-1 text-xs text-muted-foreground">{deal.reference} · {deal.status.replace(/_/g, ' ')}</p></button>)}</div>}
        </Card>
      </div>
    </DashboardLayout>
  );
}
