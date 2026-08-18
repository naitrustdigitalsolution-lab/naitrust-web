import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, Check, ChevronLeft, ChevronRight, Factory, Globe2, Languages,
  ImageOff, MapPin, Search, ShieldCheck, ShoppingCart, SlidersHorizontal,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { marketplaceApi, marketProducts, marketSuppliers } from '../../libs/marketplace/marketplace.api';
import type { MarketCart, MarketCountry, ProductListing, Supplier } from '../../libs/marketplace/types';
import { useAuth } from '../../libs/auth-context';
import { getProductImage, getSupplierCover, getSupplierMedia, pageImages } from '../../libs/images/image-manifest';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { SEOHead } from '../utility/SEOHead';

function imageFor(product: ProductListing): string | null {
  return getProductImage(product.id)?.src ?? null;
}

const money = (minor: number, currency = 'NGN') => new Intl.NumberFormat('en-NG', {
  style: 'currency', currency, maximumFractionDigits: currency === 'NGN' ? 0 : 2,
}).format(minor / 100);

function MarketShell({ title, children }: { title: string; children: ReactNode }) {
  const { pathname } = useLocation();
  if (pathname.startsWith('/app')) return <DashboardLayout title={title}>{children}</DashboardLayout>;
  return (
    <>
      <SEOHead title={title} description="Discover verified Nigerian and Chinese suppliers, request a landed-cost quote, and track wholesale orders with Naitrust." />
      <main className="min-h-svh bg-[#f4f7fa] pb-16 pt-4 dark:bg-background sm:pt-6">
        <div className="mx-auto w-full max-w-440 px-3 sm:px-6 lg:px-8">{children}</div>
      </main>
    </>
  );
}

function ProductVisual({ product, compact = false }: { product: ProductListing; compact?: boolean }) {
  const source = imageFor(product);
  return (
    <div className={`relative overflow-hidden bg-muted ${compact ? 'aspect-[4/3]' : 'aspect-[4/3] lg:aspect-auto lg:min-h-[34rem]'}`}>
      {source ? <img src={source} alt={product.title} loading={compact ? 'lazy' : 'eager'} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" /> : <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-muted-foreground"><ImageOff size={24} /><span className="text-xs font-medium">Image unavailable</span></div>}
      {source && <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />}
      <Badge className="absolute left-3 top-3 border-white/30 bg-white/90 text-[#071b31] shadow-sm hover:bg-white">
        {product.country === 'CN' ? '🇨🇳 China' : '🇳🇬 Nigeria'}
      </Badge>
      {product.translatedByNaitrust && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#071b31]/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur"><Languages size={11} /> English listing</span>}
    </div>
  );
}

function ProductCard({ product, supplier, onOpen }: { product: ProductListing; supplier: Supplier; onOpen: () => void }) {
  return (
    <Card className="group cursor-pointer gap-0 overflow-hidden rounded-3xl border-0 bg-card p-0 shadow-[0_10px_35px_rgba(7,27,49,.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(7,27,49,.14)]" onClick={onOpen}>
      <ProductVisual product={product} compact />
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"><BadgeCheck size={13} /> Verified supplier</div>
        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-5">{product.title}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">{supplier.name}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div><p className="text-[10px] text-muted-foreground">Estimated from</p><p className="text-lg font-bold">{money(product.estimatedNgnMinor)}</p></div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold">MOQ {product.minimumOrderQuantity}</span>
        </div>
        <p className="mt-3 border-t pt-3 text-[10px] leading-4 text-muted-foreground">Final product and delivery cost confirmed by quote.</p>
      </div>
    </Card>
  );
}

function SupplierCard({ supplier, onOpen }: { supplier: Supplier; onOpen: () => void }) {
  const cover = getSupplierCover(supplier.id, `${supplier.name} product showroom`);
  return (
    <button type="button" onClick={onOpen} className="group flex min-w-[18rem] max-w-[22rem] shrink-0 overflow-hidden rounded-3xl border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:min-w-0 sm:max-w-none">
      <div className="w-28 shrink-0 overflow-hidden bg-muted">{cover ? <img src={cover.src} alt={cover.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ImageOff size={20} /></div>}</div>
      <div className="min-w-0 p-4"><div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700"><BadgeCheck size={12} /> VERIFIED</div><p className="mt-2 line-clamp-2 text-sm font-bold">{supplier.name}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={11} /> {supplier.city} · {supplier.country}</p><p className="mt-3 flex items-center gap-1 text-[11px] font-semibold"><Star size={11} className="fill-amber-400 text-amber-400" /> {supplier.rating} · {supplier.completedOrders} orders</p></div>
    </button>
  );
}

type MarketFiltersProps = {
  query: string;
  setQuery: (value: string) => void;
  country: 'all' | MarketCountry;
  setCountry: (value: 'all' | MarketCountry) => void;
  category: string;
  setCategory: (value: string) => void;
  minimumOrder: string;
  setMinimumOrder: (value: string) => void;
  maximumPrice: string;
  setMaximumPrice: (value: string) => void;
  minimumRating: string;
  setMinimumRating: (value: string) => void;
  categories: string[];
  activeFilters: number;
  clearFilters: () => void;
  openSuppliers: () => void;
};

function MarketFilters({
  query, setQuery, country, setCountry, category, setCategory, minimumOrder, setMinimumOrder,
  maximumPrice, setMaximumPrice, minimumRating, setMinimumRating, categories, activeFilters,
  clearFilters, openSuppliers,
}: MarketFiltersProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">Browse market</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground"><ShoppingCart size={14} /> Products</button>
          <button type="button" onClick={openSuppliers} className="flex items-center justify-center gap-1.5 rounded-xl border bg-background px-3 py-2.5 text-xs font-semibold transition hover:bg-muted"><Factory size={14} /> Suppliers</button>
        </div>
      </div>

      <div>
        <Label className="text-xs">Search</Label>
        <div className="relative mt-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} /><Input aria-label="Search products or suppliers" value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 rounded-xl pl-9 text-sm" placeholder="Product or supplier" /></div>
      </div>

      <div>
        <Label className="text-xs">Source market</Label>
        <Select value={country} onValueChange={(value) => setCountry(value as 'all' | MarketCountry)}><SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">China and Nigeria</SelectItem><SelectItem value="CN">🇨🇳 China</SelectItem><SelectItem value="NG">🇳🇬 Nigeria</SelectItem></SelectContent></Select>
      </div>

      <div>
        <Label className="text-xs">Category</Label>
        <Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
      </div>

      <div>
        <Label className="text-xs">Maximum minimum order</Label>
        <Select value={minimumOrder} onValueChange={setMinimumOrder}><SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Any order size</SelectItem><SelectItem value="100">Up to 100 units</SelectItem><SelectItem value="500">Up to 500 units</SelectItem><SelectItem value="1000">Up to 1,000 units</SelectItem></SelectContent></Select>
      </div>

      <div>
        <Label className="text-xs">Estimated unit price</Label>
        <Select value={maximumPrice} onValueChange={setMaximumPrice}><SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Any unit price</SelectItem><SelectItem value="100000">Up to ₦1,000</SelectItem><SelectItem value="500000">Up to ₦5,000</SelectItem><SelectItem value="2000000">Up to ₦20,000</SelectItem></SelectContent></Select>
      </div>

      <div>
        <Label className="text-xs">Supplier rating</Label>
        <Select value={minimumRating} onValueChange={setMinimumRating}><SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">Any verified supplier</SelectItem><SelectItem value="4.5">4.5 and above</SelectItem><SelectItem value="4.8">4.8 and above</SelectItem></SelectContent></Select>
      </div>

      {activeFilters > 0 && <Button variant="ghost" className="w-full rounded-xl text-xs" onClick={clearFilters}>Clear {activeFilters} {activeFilters === 1 ? 'filter' : 'filters'}</Button>}
    </div>
  );
}

export function MarketPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { productId, supplierId } = useParams<{ productId?: string; supplierId?: string }>();
  const { user } = useAuth();
  const inApp = pathname.startsWith('/app');
  const base = inApp ? '/app/market' : '/market';
  const isSupplierDirectory = pathname === `${base}/suppliers`;
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState<'all' | MarketCountry>('all');
  const [category, setCategory] = useState('all');
  const [minimumOrder, setMinimumOrder] = useState('all');
  const [maximumPrice, setMaximumPrice] = useState('all');
  const [minimumRating, setMinimumRating] = useState('0');
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState('');
  const [addedProduct, setAddedProduct] = useState<ProductListing | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const product = marketProducts.find((item) => item.id === productId);
  const supplier = marketSuppliers.find((item) => item.id === supplierId || item.id === product?.supplierId);

  useEffect(() => {
    if (!product) return;
    const cartItem = marketplaceApi.getCart()?.items.find((item) => item.productId === product.id);
    setQuantity(cartItem?.quantity ?? product.minimumOrderQuantity);
    setCustomization(cartItem?.customization ?? '');
  }, [product]);

  const categories = [...new Set(marketProducts.map((item) => item.category))];
  const filtered = useMemo(() => marketProducts.filter((item) => {
    const owner = marketSuppliers.find((candidate) => candidate.id === item.supplierId);
    const haystack = `${item.title} ${item.description} ${item.category} ${owner?.name ?? ''}`.toLowerCase();
    return item.available
      && (!query.trim() || haystack.includes(query.trim().toLowerCase()))
      && (country === 'all' || item.country === country)
      && (category === 'all' || item.category === category)
      && (minimumOrder === 'all' || item.minimumOrderQuantity <= Number(minimumOrder))
      && (maximumPrice === 'all' || item.estimatedNgnMinor <= Number(maximumPrice))
      && (owner?.rating ?? 0) >= Number(minimumRating) && Boolean(owner?.verified);
  }), [category, country, maximumPrice, minimumOrder, minimumRating, query]);
  const filteredSuppliers = useMemo(() => marketSuppliers.filter((item) => {
    const supplierProducts = marketProducts.filter((productItem) => productItem.supplierId === item.id);
    const haystack = `${item.name} ${item.description} ${item.city} ${supplierProducts.map((productItem) => `${productItem.title} ${productItem.category}`).join(' ')}`.toLowerCase();
    return (!query.trim() || haystack.includes(query.trim().toLowerCase()))
      && (country === 'all' || item.country === country)
      && item.verified;
  }), [country, query]);

  const activeFilters = [query.trim(), country !== 'all', category !== 'all', minimumOrder !== 'all', maximumPrice !== 'all', minimumRating !== '0'].filter(Boolean).length;
  const clearFilters = () => {
    setQuery('');
    setCountry('all');
    setCategory('all');
    setMinimumOrder('all');
    setMaximumPrice('all');
    setMinimumRating('0');
  };
  const filterProps: MarketFiltersProps = {
    query, setQuery, country, setCountry, category, setCategory, minimumOrder, setMinimumOrder,
    maximumPrice, setMaximumPrice, minimumRating, setMinimumRating, categories, activeFilters,
    clearFilters, openSuppliers: () => navigate(`${base}/suppliers`),
  };

  const requireAccount = (destination: string) => user ? navigate(destination) : navigate(`/login?returnTo=${encodeURIComponent(destination)}`);
  const addToCart = (chosen: ProductListing) => {
    if (!user) { requireAccount(`/app/market/products/${chosen.id}`); return; }
    const current = marketplaceApi.getCart();
    const existing = current?.items.find((item) => item.productId === chosen.id);
    const customizationRequest = customization.trim();
    const items = existing ? current!.items.map((item) => item.productId === chosen.id ? { ...item, quantity, customization: customizationRequest || undefined } : item) : [...(current?.items ?? []), { productId: chosen.id, quantity: Math.max(quantity, chosen.minimumOrderQuantity), selections: {}, customization: customizationRequest || undefined }];
    const supplierIds = new Set(items.map((item) => marketProducts.find((productItem) => productItem.id === item.productId)?.supplierId).filter(Boolean));
    const cart: MarketCart = { supplierId: supplierIds.size === 1 ? chosen.supplierId : undefined, items, updatedAt: new Date().toISOString() };
    marketplaceApi.saveCart(cart);
    setAddedProduct(chosen);
    window.setTimeout(() => setAddedProduct((currentAdded) => currentAdded?.id === chosen.id ? null : currentAdded), 2600);
  };

  if (isSupplierDirectory) return (
    <MarketShell title="Verified Suppliers"><div className="w-full">
      <Button variant="ghost" className="mb-3 -ml-2 rounded-full" onClick={() => navigate(base)}><ChevronLeft size={16} /> Products</Button>
      <section className="rounded-[2rem] bg-[#061a31] px-5 py-7 text-white sm:px-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-sky-300">Supplier directory</p>
        <div className="mt-2 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><h1 className="text-3xl font-bold tracking-[-.04em] sm:text-4xl">Find a verified business</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Explore supplier showcases, products and Trust Profiles before starting an enquiry.</p></div>
          <div className="relative w-full md:max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 rounded-2xl border-white/10 bg-white pl-11 text-[#071b31]" placeholder="Search suppliers or products" /></div>
        </div>
      </section>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><button type="button" onClick={() => setCountry('all')} className={`rounded-full border px-4 py-2 text-xs font-semibold ${country === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}>All suppliers</button><button type="button" onClick={() => setCountry('CN')} className={`rounded-full border px-4 py-2 text-xs font-semibold ${country === 'CN' ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}>🇨🇳 China</button><button type="button" onClick={() => setCountry('NG')} className={`rounded-full border px-4 py-2 text-xs font-semibold ${country === 'NG' ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}>🇳🇬 Nigeria</button></div><span className="text-xs text-muted-foreground">{filteredSuppliers.length} verified suppliers</span></div>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filteredSuppliers.map((item) => <SupplierCard key={item.id} supplier={item} onOpen={() => navigate(`${base}/suppliers/${item.id}`)} />)}</section>
      {filteredSuppliers.length === 0 && <div className="mt-5 rounded-3xl border border-dashed py-14 text-center"><Search className="mx-auto text-muted-foreground" /><p className="mt-3 font-semibold">No suppliers match your search</p><Button variant="ghost" className="mt-2 rounded-full" onClick={() => { setQuery(''); setCountry('all'); }}>Clear search</Button></div>}
    </div></MarketShell>
  );

  if (product && supplier) return (
    <MarketShell title={product.title}><div className="w-full">
      <AnimatePresence>
        {addedProduct && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: .96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: .97 }}
            transition={{ duration: .22, ease: 'easeOut' }}
            className="fixed right-3 top-16 z-50 flex max-w-[calc(100vw-1.5rem)] items-center gap-3 rounded-2xl border bg-background p-3 shadow-[0_18px_55px_rgba(7,27,49,.2)] sm:right-5 sm:top-18 sm:min-w-80"
            role="status"
          >
            <motion.span initial={{ scale: .4, rotate: -18 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 20 }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><Check size={19} /></motion.span>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Added to your cart</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{addedProduct.title}</p></div>
            <Button variant="ghost" size="sm" className="shrink-0 rounded-full" onClick={() => navigate('/app/cart')}>View cart</Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Button variant="ghost" className="mb-3 -ml-2 rounded-full" onClick={() => navigate(base)}><ChevronLeft size={16} /> Market</Button>
      <div className="grid overflow-hidden rounded-[2rem] border bg-card shadow-[0_18px_60px_rgba(7,27,49,.1)] lg:grid-cols-[1.08fr_.92fr]"><ProductVisual product={product} /><div className="p-5 sm:p-8 lg:p-10"><div className="flex flex-wrap gap-2"><Badge variant="success"><BadgeCheck size={12} /> Verified supplier</Badge>{product.translatedByNaitrust && <Badge variant="outline"><Languages size={12} /> Translated by Naitrust</Badge>}</div><h1 className="mt-5 text-3xl font-bold tracking-[-.04em] sm:text-4xl">{product.title}</h1><button type="button" className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary" onClick={() => navigate(`${base}/suppliers/${supplier.id}`)}>{supplier.name}<ChevronRight size={15} /></button><p className="mt-5 text-sm leading-6 text-muted-foreground">{product.description}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-primary/[.06] p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Estimated unit price</p><p className="mt-1 text-2xl font-bold">{money(product.estimatedNgnMinor)}</p></div><div className="rounded-2xl bg-muted/50 p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Minimum order</p><p className="mt-1 text-2xl font-bold">{product.minimumOrderQuantity}</p><p className="text-xs text-muted-foreground">{product.unit}s</p></div></div>{product.sourceCurrency === 'CNY' && <p className="mt-3 text-xs text-muted-foreground">Source price {money(product.sourcePriceMinor, 'CNY')} · final landed cost confirmed after destination and quantity review.</p>}<dl className="mt-6 grid grid-cols-2 gap-2">{Object.entries(product.specifications).map(([key, value]) => <div key={key} className="rounded-xl border p-3"><dt className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{key.replace('_', ' ')}</dt><dd className="mt-1 text-xs font-medium sm:text-sm">{value}</dd></div>)}</dl><div className="mt-6"><Label htmlFor="market-quantity">Quantity ({product.unit}s)</Label><Input id="market-quantity" className="mt-2 h-11" type="number" min={product.minimumOrderQuantity} value={quantity} onChange={(event) => setQuantity(Math.max(product.minimumOrderQuantity, Number(event.target.value)))} /></div><div className="mt-5"><Label htmlFor="market-customization">Describe your customization <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="market-customization" value={customization} onChange={(event) => setCustomization(event.target.value)} className="mt-2 min-h-24 resize-y" placeholder="Example: Add our logo in black, use size XL, and pack 50 pieces per carton." /><p className="mt-2 text-[11px] leading-5 text-muted-foreground">Write your request in English. It will be included when the supplier prepares your quote.</p></div><Button className={`mt-5 h-12 w-full rounded-full transition ${addedProduct?.id === product.id ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`} onClick={() => addToCart(product)}>{addedProduct?.id === product.id ? <><Check size={16} /> Added to cart</> : <><ShoppingCart size={16} /> Add to cart</>}</Button></div></div>
    </div></MarketShell>
  );

  if (supplier) {
    const products = marketProducts.filter((item) => item.supplierId === supplier.id);
    const supplierCover = getSupplierCover(supplier.id, `${supplier.name} product range`);
    const gallery = supplier.media.map((media, index) => ({
      ...media,
      image: index < 4 ? getSupplierMedia(supplier.id, index as 0 | 1 | 2 | 3, `${supplier.name}: ${media.title}`) : null,
    })).filter((media) => media.image !== null);
    return (
      <MarketShell title={`${supplier.name} Showcase`}><div className="w-full">
        <Button variant="ghost" className="mb-3 -ml-2 rounded-full" onClick={() => navigate(base)}><ChevronLeft size={16} /> Market</Button>
        <section className="relative overflow-hidden rounded-[2rem] bg-[#061a31] text-white shadow-xl"><div className="absolute inset-0">{supplierCover && <img src={supplierCover.src} alt="" className="h-full w-full object-cover opacity-25 blur-[1px]" />}<div className="absolute inset-0 bg-gradient-to-r from-[#04162f] via-[#04162f]/95 to-[#04162f]/45" /></div><div className="relative grid gap-6 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="flex flex-wrap gap-2"><Badge className="border-white/15 bg-white/10 text-white">{supplier.country === 'CN' ? '🇨🇳' : '🇳🇬'} {supplier.city}</Badge><Badge className="border-emerald-300/20 bg-emerald-400/15 text-emerald-200"><BadgeCheck size={12} /> Verified supplier</Badge></div><h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-[-.04em] sm:text-5xl">{supplier.name}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">{supplier.description}</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/75"><span className="flex items-center gap-1.5"><Star size={14} className="fill-amber-400 text-amber-400" /> {supplier.rating} rating</span><span>{supplier.completedOrders} completed orders</span><span>{supplier.responseRate}% response rate</span></div></div><Button className="rounded-full bg-white text-[#071b31] hover:bg-white/90" onClick={() => products[0] && navigate(`${base}/products/${products[0].id}`)}>View products <ArrowRight size={15} /></Button></div></section>
        <Tabs defaultValue="showcase" className="mt-5"><TabsList className="grid h-11 w-full max-w-sm grid-cols-2 rounded-full bg-muted p-1"><TabsTrigger value="showcase" className="rounded-full">Showcase</TabsTrigger><TabsTrigger value="trust" className="rounded-full">Trust Profile</TabsTrigger></TabsList><TabsContent value="showcase" className="mt-6"><div className="grid gap-6 lg:grid-cols-[1fr_.34fr]"><div><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Products from this supplier</h2><span className="text-xs text-muted-foreground">{products.length} available</span></div><div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">{products.map((item) => <ProductCard key={item.id} product={item} supplier={supplier} onOpen={() => navigate(`${base}/products/${item.id}`)} />)}</div></div><aside className="space-y-4">{gallery.length > 0 && <Card className="rounded-3xl p-5"><Factory size={20} className="text-primary" /><h2 className="mt-4 font-bold">Supplier operations</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">See this supplier's range, production, quality review and fulfilment.</p><div className="mt-4 grid grid-cols-2 gap-2">{gallery.map((media) => <figure key={media.id} className="overflow-hidden rounded-xl bg-muted"><img src={media.image!.src} alt={media.image!.alt} loading="lazy" className="aspect-square w-full object-cover" /><figcaption className="p-2 text-[10px] font-semibold">{media.title}</figcaption></figure>)}</div></Card>}<Card className="rounded-3xl p-5"><Globe2 size={20} className="text-primary" /><h2 className="mt-4 font-bold">Fulfilment</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Ships to {supplier.fulfilmentRegions.join(', ')}. Communication is available in {supplier.languages.join(' and ')}.</p></Card></aside></div></TabsContent><TabsContent value="trust" className="mt-6"><div className="grid gap-4 sm:grid-cols-3"><Metric label="Completed orders" value={String(supplier.completedOrders)} /><Metric label="Customer rating" value={supplier.rating.toFixed(1)} /><Metric label="Response rate" value={`${supplier.responseRate}%`} /></div><Card className="mt-4 rounded-3xl p-6"><p className="flex items-center gap-2 font-semibold"><ShieldCheck size={18} className="text-emerald-600" /> What Naitrust checked</p><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{supplier.verificationSummary}</p><div className="mt-5 flex flex-wrap gap-2"><Badge variant="outline">Business identity</Badge><Badge variant="outline">Operating location</Badge><Badge variant="outline">Representative</Badge>{supplier.country === 'CN' && <Badge variant="outline">Export contact</Badge>}</div></Card></TabsContent></Tabs>
      </div></MarketShell>
    );
  }

  return (
    <MarketShell title="Naitrust Market"><div className="w-full">
      <section className="relative min-h-[25rem] overflow-hidden rounded-[2rem] bg-[#061a31] text-white shadow-[0_24px_70px_rgba(7,27,49,.18)] sm:min-h-[30rem]">
        <img src={pageImages.marketHero.src} alt={pageImages.marketHero.alt} className="absolute inset-0 h-full w-full object-cover object-center opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04162f] via-[#04162f]/90 to-[#04162f]/25" />
        <div className="relative flex min-h-[25rem] max-w-3xl flex-col justify-center px-5 py-10 sm:min-h-[30rem] sm:px-9 lg:px-12">
          <h1 className="text-3xl font-bold leading-[1.04] tracking-[-.045em] sm:text-5xl lg:text-[3.4rem]">Buy wholesale from China or Nigeria.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">Find ready stock or request custom production from verified suppliers. Naitrust confirms the full cost and coordinates delivery.</p>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => { setCountry('CN'); document.querySelector('#market-products')?.scrollIntoView({ behavior: 'smooth' }); }} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#071b31] transition hover:bg-sky-50">🇨🇳 Source from China</button>
            <button type="button" onClick={() => { setCountry('NG'); document.querySelector('#market-products')?.scrollIntoView({ behavior: 'smooth' }); }} className="rounded-full border border-white/20 bg-white/[.07] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15">🇳🇬 Buy from Nigeria</button>
            <button type="button" onClick={() => navigate(`${base}/suppliers`)} className="px-2 py-2 text-xs font-semibold text-sky-300">Browse suppliers</button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] text-white/55"><span>Popular:</span>{categories.slice(0, 4).map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className="rounded-full border border-white/10 px-2.5 py-1 font-semibold text-white/75 hover:bg-white/10">{item}</button>)}</div>
        </div>
      </section>

      <section id="market-products" className="mt-8 scroll-mt-20">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Wholesale marketplace</p><h2 className="mt-1 text-xl font-bold sm:text-2xl">Products ready to source</h2><p className="mt-1 text-xs text-muted-foreground">Bulk stock and custom production from verified suppliers.</p></div>
          <div className="flex shrink-0 items-center gap-2"><span className="hidden text-xs text-muted-foreground sm:inline">{filtered.length} results</span><Button variant="outline" size="sm" className="rounded-full lg:hidden" onClick={() => setMobileFiltersOpen(true)}><SlidersHorizontal size={14} /> Filters{activeFilters > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{activeFilters}</span>}</Button></div>
        </div>

        <div className="relative mt-4 lg:hidden"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 rounded-2xl bg-card pl-10" placeholder="Search products or suppliers" /></div>

        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="sticky top-20 hidden rounded-2xl border bg-card p-4 lg:block"><MarketFilters {...filterProps} /></aside>
          <div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">{filtered.map((item) => <ProductCard key={item.id} product={item} supplier={marketSuppliers.find((candidate) => candidate.id === item.supplierId)!} onOpen={() => navigate(`${base}/products/${item.id}`)} />)}</div>
            {filtered.length === 0 && <div className="rounded-3xl border border-dashed py-14 text-center"><Search className="mx-auto text-muted-foreground" /><p className="mt-3 font-semibold">No products match these filters</p><Button variant="ghost" className="mt-2 rounded-full" onClick={clearFilters}>Clear filters</Button></div>}
          </div>
        </div>

        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="bottom" className="max-h-[88svh] rounded-t-[1.75rem]">
            <SheetHeader className="border-b"><SheetTitle>Search and filter</SheetTitle><SheetDescription>Find wholesale products or browse verified suppliers.</SheetDescription></SheetHeader>
            <div className="overflow-y-auto px-4 pb-5"><MarketFilters {...filterProps} /></div>
            <SheetFooter className="border-t bg-background"><SheetClose asChild><Button className="h-11 w-full rounded-full">Show {filtered.length} products</Button></SheetClose></SheetFooter>
          </SheetContent>
        </Sheet>
      </section>
    </div></MarketShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border bg-card p-5"><p className="text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}
