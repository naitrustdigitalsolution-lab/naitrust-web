import { AlertTriangle, ArrowRight, BadgeCheck, ClipboardList, Inbox, PackageCheck, PackageSearch, Search, ShieldCheck, ShoppingCart, Store, UserCheck, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { marketplaceApi, marketSuppliers } from '../../../libs/marketplace/marketplace.api';
import type { DealInvitation, SafeDealSummary, WalletAccount } from '../../../libs/store/types';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import { getAppImage } from '../../../libs/images/image-manifest';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { SecureAccountModal } from '../security/SecureAccountModal';
import { DashboardLayout } from './DashboardLayout';

interface CustomerDashboardHomeProps {
  firstName: string;
  identityVerified: boolean;
  wallet: WalletAccount | undefined;
  walletLoading: boolean;
  deals: SafeDealSummary[] | undefined;
  dealsLoading: boolean;
  dealsError: boolean;
  invitations: DealInvitation[] | undefined;
  onOpenDeal: (deal: SafeDealSummary) => void;
}

export function CustomerDashboardHome({
  firstName,
  identityVerified,
  wallet,
  walletLoading,
  deals,
}: CustomerDashboardHomeProps) {
  const navigate = useNavigate();
  const cart = marketplaceApi.getCart();
  const quotes = marketplaceApi.listQuotes();
  const orders = marketplaceApi.listOrders();
  const commerceRoomIds = new Set(orders.map((order) => order.roomId).filter(Boolean));
  const orderRooms = deals?.filter((deal) => commerceRoomIds.has(deal.id));
  const pendingReleaseDeal = orderRooms?.find((deal) => deal.status === 'buyer_review');
  const activeOrder = orders.find((order) => !['released', 'cancelled'].includes(order.status));
  const heroImage = getAppImage('dashboard', 'Products, supplier checks and wholesale orders managed from one sourcing dashboard');

  return (
    <DashboardLayout title="Home">
      <SecureAccountModal />
      <div className="mx-auto flex w-full max-w-9xl flex-col gap-5 sm:gap-7">
        <section className="relative overflow-hidden rounded-3xl bg-[#04162f] text-white shadow-[0_20px_60px_rgba(4,22,47,.2)]">
          <img src={heroImage.src} alt={heroImage.alt} className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04162f] via-[#04162f]/95 to-[#04162f]/35" />
          <div className="relative max-w-3xl p-5 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/65"><span>Good day, {firstName}</span>{identityVerified && <Badge className="border-emerald-300/20 bg-emerald-400/15 text-emerald-200"><BadgeCheck size={12} /> Verified account</Badge>}</div>
            <h1 className="mt-4 text-3xl font-bold tracking-[-.04em] sm:text-5xl">Find products. Know the complete cost. Track delivery.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">Source from verified suppliers in China or Nigeria, approve the complete cost, and follow every order from supplier checks to delivery.</p>
            <div className="mt-6 flex flex-wrap gap-2"><Button className="rounded-full bg-white text-[#071b31] hover:bg-white/90" onClick={() => navigate('/app/market')}><Search size={16} /> Explore market</Button><Button variant="outline" className="rounded-full border-white/20 bg-white/[.07] text-white hover:bg-white/15 hover:text-white" onClick={() => navigate('/app/orders')}>Track orders <ArrowRight size={15} /></Button></div>
          </div>
        </section>

        <section className="grid grid-cols-3 overflow-hidden rounded-2xl border bg-card shadow-sm">
          {[{ icon: Store, title: 'Choose a supplier', copy: 'Browse products in English.' }, { icon: ClipboardList, title: 'Approve the quote', copy: 'See the complete landed cost.' }, { icon: PackageCheck, title: 'Track the order', copy: 'Follow inspection to delivery.' }].map((step, index) => <div key={step.title} className="border-r p-3 last:border-r-0 sm:p-5"><div className="flex items-center gap-2"><span className="hidden text-xs font-bold text-primary sm:block">0{index + 1}</span><step.icon size={18} className="text-primary" /></div><p className="mt-3 text-xs font-semibold sm:text-sm">{step.title}</p><p className="mt-1 hidden text-xs text-muted-foreground sm:block">{step.copy}</p></div>)}
        </section>

        <section className="grid grid-cols-3 gap-3">
          <button type="button" onClick={() => navigate('/app/cart')} className="rounded-2xl border bg-card p-4 text-left shadow-sm"><ShoppingCart size={18} className="text-primary" /><strong className="mt-3 block text-xl">{cart?.items.length ?? 0}</strong><span className="text-xs text-muted-foreground">Cart items</span></button>
          <button type="button" onClick={() => navigate('/app/quotes')} className="rounded-2xl border bg-card p-4 text-left shadow-sm"><ClipboardList size={18} className="text-primary" /><strong className="mt-3 block text-xl">{quotes.filter((quote) => quote.status === 'ready').length}</strong><span className="text-xs text-muted-foreground">Ready quotes</span></button>
          <button type="button" onClick={() => navigate('/app/orders')} className="rounded-2xl border bg-card p-4 text-left shadow-sm"><PackageSearch size={18} className="text-primary" /><strong className="mt-3 block text-xl">{orders.filter((order) => !['released', 'cancelled'].includes(order.status)).length}</strong><span className="text-xs text-muted-foreground">Active orders</span></button>
        </section>

        {activeOrder && <button type="button" onClick={() => navigate(`/app/orders/${activeOrder.id}`)} className="flex w-full items-center gap-4 rounded-3xl border border-primary/20 bg-primary/[.04] p-4 text-left sm:p-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><PackageSearch size={20} /></span><span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">Order in progress · {activeOrder.reference}</span><span className="mt-1 block font-semibold">{marketSuppliers.find((supplier) => supplier.id === activeOrder.supplierId)?.name}</span><span className="mt-1 block text-xs capitalize text-muted-foreground">Current stage: {activeOrder.status.replace(/_/g, ' ')}</span></span><ArrowRight size={16} className="shrink-0" /></button>}

        <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="rounded-2xl p-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserCheck size={17} /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-bold">Need a sourcing agent?</h2><p className="mt-0.5 text-xs text-muted-foreground">Browse Naitrust-verified sourcing and product inspection professionals.</p></div><Button variant="outline" size="sm" className="shrink-0 rounded-full" onClick={() => navigate('/app/agents')}>Browse</Button></div></Card>
          <Card className="rounded-3xl p-5 sm:p-6"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><WalletCards size={18} /></span><Button variant="ghost" size="sm" onClick={() => navigate('/app/wallet')}>View money</Button></div><p className="mt-5 text-xs text-muted-foreground">Available for quotes, services and refunds</p>{walletLoading || !wallet ? <Skeleton className="mt-2 h-9 w-40" /> : <p className="mt-1 text-2xl font-bold">{formatMinorAmount(wallet.balance.availableMinor, wallet.balance.currency)}</p>}<p className="mt-3 text-xs leading-5 text-muted-foreground">See supplier payments, agent fees, shipping charges and refunds in one money record.</p></Card>
        </section>

        {pendingReleaseDeal && <button type="button" onClick={() => navigate(`/app/deals/${pendingReleaseDeal.id}`)} className="flex w-full items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[.08] px-4 py-3 text-left"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Review work or products before payment releases</span><span className="mt-0.5 block text-xs text-muted-foreground">Check {pendingReleaseDeal.title} against the accepted terms and evidence.</span></span><ArrowRight size={15} /></button>}

        <section><div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Recent Order Rooms</h2><p className="mt-1 text-sm text-muted-foreground">Supplier communication, checks and payment decisions for your marketplace orders.</p></div>{orders.length > 0 && <Button variant="ghost" size="sm" onClick={() => navigate('/app/orders')}>View all <ArrowRight size={14} /></Button>}</div>{orders.length > 0 ? <div className="divide-y overflow-hidden rounded-2xl border bg-card">{[...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3).map((order) => { const supplier = marketSuppliers.find((item) => item.id === order.supplierId); return <button key={order.id} type="button" onClick={() => navigate(`/app/orders/${order.id}`)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-muted/40"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><PackageSearch size={18} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{supplier?.name ?? 'Supplier order'}</strong><span className="mt-1 block truncate text-xs text-muted-foreground">{order.itemSummary ?? order.reference}</span></span><span className="text-right"><Badge variant="outline" className="capitalize">{order.status.replace(/_/g, ' ')}</Badge><span className="mt-1 block text-[10px] text-muted-foreground">{order.reference}</span></span><ArrowRight size={14} className="shrink-0 text-muted-foreground" /></button>; })}</div> : <Card className="rounded-2xl border-dashed p-8 text-center"><PackageSearch className="mx-auto text-muted-foreground" size={24} /><p className="mt-3 font-semibold">No orders yet</p><p className="mt-1 text-sm text-muted-foreground">Your supplier orders will appear here.</p><Button className="mt-4 rounded-full" onClick={() => navigate('/app/market')}>Explore market</Button></Card>}</section>
      </div>
    </DashboardLayout>
  );
}
