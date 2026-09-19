import { ArrowRight, BadgeCheck, Boxes, ClipboardList, PackageSearch, Plus, Search, Store, UserCheck, WalletCards, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { marketplaceApi, marketSuppliers } from '../../../libs/marketplace/marketplace.api';
import type { SafeDealSummary, WalletAccount } from '../../../libs/store/types';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import { getAppImage } from '../../../libs/images/image-manifest';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../ui/dropdown-menu';
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
  { label: 'Create Protected Deal', detail: 'Set terms and protect a payment', icon: ClipboardList, path: '/app/deals/new' },
  { label: 'Review payments', detail: 'Track approvals and settlement', icon: Workflow, path: '/app/deals' },
  { label: 'Manage beneficiaries', detail: 'Verify who your business pays', icon: UserCheck, path: '/app/beneficiaries' },
  { label: 'View money', detail: 'See funding, releases and refunds', icon: WalletCards, path: '/app/wallet' },
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
  const commerceRoomIds = new Set(orders.map((order) => order.roomId).filter(Boolean));
  const orderRooms = deals?.filter((deal) => commerceRoomIds.has(deal.id));
  const heroImage = getAppImage('businessCommerce', 'A Nigerian business team preparing wholesale products');

  return (
    <DashboardLayout title="Business home">
      <BusinessVerificationModal />
      <SecureAccountModal />
      <div className="w-full space-y-5">
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .35 }} className="relative min-h-[21rem] overflow-hidden rounded-[2rem] bg-[#04162f] text-white shadow-[0_18px_50px_rgba(4,22,47,.18)]">
          <img src={heroImage.src} alt={heroImage.alt} className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04162f] via-[#04162f]/95 to-[#04162f]/25" />
          <div className="relative grid min-h-[21rem] items-end gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,.7fr)] lg:p-10">
            <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/65"><span>Good day, {firstName}</span>{verified && <Badge className="border-emerald-300/20 bg-emerald-400/15 text-emerald-200"><BadgeCheck size={12} /> Verified business</Badge>}</div>
            {businessLoading ? <Skeleton className="mt-4 h-9 w-64 bg-white/15" /> : <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-[-.045em] sm:text-5xl">Control business payments from agreement to settlement.</h1>}
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{businessName} can protect vendor deposits, procurement, services and milestone payments with evidence-based approvals.</p>
            <div className="mt-5 flex flex-wrap gap-2"><Button className="rounded-full bg-white text-[#071b31] hover:bg-white/90" onClick={() => navigate('/app/deals/new')}><Search size={16} /> Create Protected Deal</Button></div>
            </div>
            <button type="button" onClick={() => navigate(activeOrder ? `/app/orders/${activeOrder.id}` : '/app/market')} className="rounded-3xl border border-white/15 bg-white/[.09] p-5 text-left backdrop-blur-md transition hover:bg-white/[.13]">
              <div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10"><PackageSearch size={19} /></span><Badge className="border-white/15 bg-white/10 text-white">{activeOrders.length} active</Badge></div>
              <p className="mt-5 text-xs text-white/55">{activeOrder ? 'Next order update' : 'Ready when you are'}</p>
              <p className="mt-1 truncate font-semibold">{activeOrder ? marketSuppliers.find((item) => item.id === activeOrder.supplierId)?.name : 'Start a wholesale order'}</p>
              <p className="mt-1 text-xs capitalize text-white/55">{activeOrder ? activeOrder.status.replace(/_/g, ' ') : 'Find a product or supplier'}</p>
            </button>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[{ label: 'Active orders', value: activeOrders.length, path: '/app/orders' }, { label: 'Ready quotes', value: quotes.filter((quote) => quote.status === 'ready').length, path: '/app/quotes' }, { label: 'Supplier products', value: 'Browse', path: '/app/market' }, { label: 'Your catalogue', value: 'Manage', path: '/app/products' }].map((item) => <button key={item.label} type="button" onClick={() => navigate(item.path)} className="rounded-2xl border bg-card p-4 text-left transition hover:border-primary/30 sm:p-5"><strong className="text-xl">{item.value}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.label}</span></button>)}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,.55fr)]">
          <Card className="rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Protected payment activity</p><h2 className="mt-2 text-xl font-bold">Track every counterparty and payment separately</h2><p className="mt-1 text-xs text-muted-foreground">Keep terms, evidence, approvals and settlement status together in each Deal Room.</p></div><Button variant="ghost" size="sm" onClick={() => navigate('/app/deals')}>View deals <ArrowRight size={14} /></Button></div>
            <div className="mt-5 divide-y rounded-2xl border">{activeOrders.length ? activeOrders.slice(0, 3).map((order) => <button key={order.id} type="button" onClick={() => navigate(`/app/orders/${order.id}`)} className="flex w-full items-center gap-4 p-4 text-left transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-muted/45"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><PackageSearch size={18} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{marketSuppliers.find((item) => item.id === order.supplierId)?.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{order.reference}</span></span><Badge variant="outline" className="capitalize">{order.status.replace(/_/g, ' ')}</Badge><ArrowRight size={14} className="text-muted-foreground" /></button>) : <div className="p-6 text-sm text-muted-foreground">No active supplier orders. Choose a verified sourcing agent to find suppliers, confirm product details and coordinate the next wholesale order.</div>}</div>
          </Card>

          <div className="grid gap-4">
            <Card className="rounded-3xl p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Quick tools</p><h2 className="mt-2 font-bold">Source beyond the catalogue</h2></div></div><div className="mt-4 grid gap-2">{actions.slice(1, 3).map((action) => <button key={action.label} type="button" onClick={() => navigate(action.path)} className="group flex items-center gap-3 rounded-2xl bg-muted/45 p-3 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-primary"><action.icon size={17} /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{action.label}</strong><span className="block text-xs text-muted-foreground">{action.detail}</span></span><ArrowRight size={14} /></button>)}</div></Card>
            <Card className="rounded-3xl p-5"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><WalletCards size={18} /></span><Button variant="ghost" size="sm" onClick={() => navigate('/app/wallet')}>View money</Button></div><p className="mt-4 text-xs text-muted-foreground">For supplier orders, customer earnings and refunds</p>{walletLoading || !wallet ? <Skeleton className="mt-2 h-9 w-40" /> : <p className="mt-1 text-2xl font-bold">{formatMinorAmount(wallet.balance.availableMinor, wallet.balance.currency)}</p>}<p className="mt-3 text-xs leading-5 text-muted-foreground">Track every quote payment, supplier settlement, service fee and withdrawal.</p></Card>
          </div>
        </section>

        <Card className="rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Recent supplier activity</h2><p className="mt-1 text-xs text-muted-foreground">Buyer orders and enquiries connected to your supplier account.</p></div><Button variant="ghost" size="sm" onClick={() => navigate('/app/orders')}>View all</Button></div>
          {dealsLoading ? <Skeleton className="mt-4 h-16 w-full" /> : dealsError ? <p className="mt-4 text-sm text-muted-foreground">Order activity is unavailable right now.</p> : !orderRooms?.length ? <div className="mt-4 rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">No supplier Order Rooms yet. Accept a quote to create one.</div> : <div className="mt-4 grid gap-2 sm:grid-cols-2">{orderRooms.slice(0, 2).map((deal) => <button key={deal.id} type="button" onClick={() => onOpenDeal(deal)} className="rounded-2xl border p-4 text-left"><p className="truncate text-sm font-semibold">{deal.title}</p><p className="mt-1 text-xs text-muted-foreground">{deal.reference} · {deal.status.replace(/_/g, ' ')}</p></button>)}</div>}
        </Card>

        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="icon" className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-40 h-14 w-14 rounded-full shadow-[0_16px_45px_rgba(24,119,242,.35)] sm:right-7" aria-label="Create or source"><Plus size={22} /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" sideOffset={10} className="w-72 rounded-2xl p-2 shadow-xl"><DropdownMenuLabel>Start something</DropdownMenuLabel><DropdownMenuSeparator />{actions.map((action) => <DropdownMenuItem key={action.path} onSelect={() => navigate(action.path)} className="gap-3 rounded-xl p-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><action.icon size={17} /></span><span><strong className="block text-sm">{action.label}</strong><span className="text-xs text-muted-foreground">{action.detail}</span></span></DropdownMenuItem>)}</DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DashboardLayout>
  );
}
