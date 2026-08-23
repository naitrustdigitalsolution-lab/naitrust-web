import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BadgeCheck, Check, Clock3, Eye, ImagePlus, MapPin, PackagePlus, Pencil,
  Plus, Store, Truck, Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMyBusiness } from '../../hooks/useMyBusiness';
import { useAuth } from '../../libs/auth-context';
import { getAppImage, getProductImage } from '../../libs/images/image-manifest';
import { marketplaceStorageKey } from '../../libs/marketplace/account-scope';
import showcaseFixture from '../../mocks/marketplace/business-showcase.json';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

type SellerProduct = {
  id: string;
  title: string;
  description: string;
  priceMinor: number;
  minimumOrder: number;
  unit: string;
  leadTime: string;
  status: 'published' | 'draft';
  imageProductId?: string;
};

type ShowcaseService = { title: string; detail: string };
type ShowcaseMedia = { id: string; title: string; caption: string; imageProductId: string };
type ShowcaseSeed = {
  tagline: string;
  summary: string;
  markets: string[];
  fulfilment: string;
  responseTime: string;
  services: ShowcaseService[];
  products: SellerProduct[];
  media: ShowcaseMedia[];
};

const fixture = showcaseFixture as { default: ShowcaseSeed; accounts: Record<string, ShowcaseSeed> };
const productKey = () => marketplaceStorageKey('seller-products');
const money = (minor: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(minor / 100);

function readProducts(seed: SellerProduct[]): SellerProduct[] {
  try {
    const saved = JSON.parse(localStorage.getItem(productKey()) ?? '') as Array<SellerProduct & { price?: string; minimumOrder?: number | string }>;
    return saved.map((product) => ({
      ...product,
      description: product.description ?? 'Specifications and fulfilment details available on request.',
      priceMinor: product.priceMinor ?? Math.round(Number(product.price ?? 0) * 100),
      minimumOrder: Number(product.minimumOrder ?? 1),
      unit: product.unit ?? 'unit',
      leadTime: product.leadTime ?? 'Confirmed by quote',
    }));
  } catch {
    localStorage.setItem(productKey(), JSON.stringify(seed));
    return seed;
  }
}

function ProductVisual({ product }: { product: SellerProduct }) {
  const mapped = product.imageProductId ? getProductImage(product.imageProductId) : null;
  if (!mapped?.src) return <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-sky-500/15 to-primary/10 text-primary"><PackagePlus size={28} /></div>;
  return <img src={mapped.src} alt={product.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />;
}

function ProductCard({ product }: { product: SellerProduct }) {
  return <Card className="overflow-hidden rounded-2xl p-0"><ProductVisual product={product} /><div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold leading-5">{product.title}</h3><Badge variant={product.status === 'published' ? 'success' : 'outline'} className="text-[9px]">{product.status}</Badge></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.description}</p><div className="mt-3 flex items-end justify-between gap-3 border-t pt-3"><div><p className="text-sm font-bold">From {money(product.priceMinor)}</p><p className="text-[10px] text-muted-foreground">MOQ {product.minimumOrder} {product.unit}{product.minimumOrder === 1 ? '' : 's'}</p></div><span className="text-right text-[10px] text-muted-foreground">{product.leadTime}</span></div></div></Card>;
}

function ShowcaseOverview({ seed, products, businessName, description, location, verified, onManageProducts }: {
  seed: ShowcaseSeed;
  products: SellerProduct[];
  businessName: string;
  description?: string;
  location: string;
  verified: boolean;
  onManageProducts: () => void;
}) {
  const cover = getAppImage('businessCommerce', 'A Nigerian business team preparing wholesale products for customers');
  return <div className="space-y-6">
    <section className="relative min-h-72 overflow-hidden rounded-[2rem] bg-[#08233f] text-white">
      <img src={cover.src} alt={cover.alt} className="absolute inset-0 h-full w-full object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#061a31] via-[#061a31]/85 to-transparent" />
      <div className="relative flex min-h-72 max-w-3xl flex-col justify-end p-6 sm:p-8">
        <div className="flex flex-wrap gap-2"><Badge className="border-white/15 bg-white/10 text-white">Published showcase</Badge>{verified && <Badge className="border-emerald-300/20 bg-emerald-400/15 text-emerald-100"><BadgeCheck size={12} /> Verified business</Badge>}</div>
        <h1 className="mt-4 text-3xl font-bold tracking-[-.04em] sm:text-4xl">{businessName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{seed.tagline}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-white/65"><MapPin size={13} /> {location}</p>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-3">
      <Card className="rounded-2xl p-4"><Store size={17} className="text-primary" /><p className="mt-3 text-xs text-muted-foreground">Products listed</p><p className="mt-1 text-2xl font-bold">{products.length}</p></Card>
      <Card className="rounded-2xl p-4"><Truck size={17} className="text-primary" /><p className="mt-3 text-xs text-muted-foreground">Fulfilment</p><p className="mt-1 text-sm font-semibold leading-5">{seed.fulfilment}</p></Card>
      <Card className="rounded-2xl p-4"><Clock3 size={17} className="text-primary" /><p className="mt-3 text-xs text-muted-foreground">Response time</p><p className="mt-1 text-sm font-semibold">{seed.responseTime}</p></Card>
    </section>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="space-y-7">
        <section><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Catalogue</p><h2 className="mt-1 text-xl font-bold">Products customers can enquire about</h2></div><Button variant="outline" size="sm" className="rounded-full" onClick={onManageProducts}>Manage products</Button></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
        <section><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Media and previous work</p><h2 className="mt-1 text-xl font-bold">Show buyers what you can deliver</h2><div className="mt-4 grid gap-4 sm:grid-cols-3">{seed.media.map((item) => { const mapped = getProductImage(item.imageProductId); return <article key={item.id} className="overflow-hidden rounded-2xl border bg-card">{mapped?.src ? <img src={mapped.src} alt={item.title} loading="lazy" className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-muted" />}<div className="p-3"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.caption}</p></div></article>; })}</div></section>
      </div>

      <aside className="space-y-4">
        <Card className="rounded-2xl p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">About the business</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{description || seed.summary}</p><div className="mt-4 flex flex-wrap gap-2">{seed.markets.map((market) => <span key={market} className="rounded-full bg-primary/[.07] px-2.5 py-1 text-[11px] font-medium">{market}</span>)}</div><Button variant="outline" className="mt-5 w-full rounded-full" onClick={() => toast.info('Business profile editing is available in Settings.')}><Pencil size={14} /> Edit profile</Button></Card>
        <Card className="rounded-2xl p-5"><h2 className="font-bold">Services</h2><div className="mt-4 space-y-4">{seed.services.map((service) => <div key={service.title} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><Check size={13} /></span><div><p className="text-sm font-semibold">{service.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{service.detail}</p></div></div>)}</div></Card>
        <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => toast.info('Media uploads are ready for the production API.')} className="rounded-2xl border bg-card p-4 text-left transition hover:border-primary/30"><ImagePlus size={17} className="text-primary" /><span className="mt-3 block text-xs font-semibold">Add photos</span></button><button type="button" onClick={() => toast.info('Video uploads are ready for the production API.')} className="rounded-2xl border bg-card p-4 text-left transition hover:border-primary/30"><Video size={17} className="text-primary" /><span className="mt-3 block text-xs font-semibold">Add video</span></button></div>
      </aside>
    </div>
  </div>;
}

export function BusinessCommercePage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: business } = useMyBusiness();
  const isProducts = pathname.endsWith('/products');
  const seed = useMemo(() => fixture.accounts[user?.id ?? ''] ?? fixture.default, [user?.id]);
  const [products, setProducts] = useState(() => readProducts(seed.products));
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('1');

  const saveProduct = () => {
    if (!title.trim() || Number(price) <= 0) { toast.error('Add a product name and estimated price.'); return; }
    const next: SellerProduct[] = [{ id: `seller_product_${Date.now()}`, title: title.trim(), description: description.trim() || 'Specifications available when the buyer requests a quote.', priceMinor: Math.round(Number(price) * 100), minimumOrder: Math.max(1, Number(minimumOrder)), unit: 'unit', leadTime: 'Confirmed by quote', status: 'published' }, ...products];
    localStorage.setItem(productKey(), JSON.stringify(next));
    setProducts(next);
    setTitle(''); setDescription(''); setPrice(''); setMinimumOrder('1'); setAddOpen(false);
    toast.success('Product published to your showcase.');
  };

  return <DashboardLayout title={isProducts ? 'Products' : 'Showcase'}><div className="w-full">
    {isProducts ? <>
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Your catalogue</p><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Products</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Publish clear wholesale products with price guidance, minimum quantities and fulfilment timing.</p></div><div className="flex gap-2"><Button variant="outline" className="rounded-full" onClick={() => navigate('/app/showcase')}><Eye size={15} /> View showcase</Button><Button className="rounded-full" onClick={() => setAddOpen(true)}><Plus size={15} /> Add product</Button></div></header>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</section>
    </> : <ShowcaseOverview seed={seed} products={products} businessName={business?.name ?? 'Your business'} description={business?.description} location={[business?.city, business?.state, business?.country ?? 'Nigeria'].filter(Boolean).join(', ')} verified={Boolean(business?.verified)} onManageProducts={() => navigate('/app/products')} />}

    <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Add a product</DialogTitle><DialogDescription>Add concise catalogue information. The final customer price is confirmed through a quote.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="seller-product-title">Product name</Label><Input id="seller-product-title" className="mt-1.5" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Custom staff uniforms" /></div><div><Label htmlFor="seller-product-detail">Short description</Label><Textarea id="seller-product-detail" className="mt-1.5 h-20 resize-none" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Specification, variants and fulfilment time" /></div><div className="grid grid-cols-2 gap-3"><div><Label htmlFor="seller-product-price">Estimated unit price</Label><Input id="seller-product-price" type="number" className="mt-1.5" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" /></div><div><Label htmlFor="seller-product-moq">Minimum order</Label><Input id="seller-product-moq" type="number" min="1" className="mt-1.5" value={minimumOrder} onChange={(event) => setMinimumOrder(event.target.value)} /></div></div></div><DialogFooter><Button className="w-full rounded-full" onClick={saveProduct}>Publish product</Button></DialogFooter></DialogContent></Dialog>
  </div></DashboardLayout>;
}
