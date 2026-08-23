import { ArrowLeft, ArrowRight, BadgeCheck, Factory, Globe2, ImageOff, Languages, MapPin, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { ProductListing, Supplier } from '../../../libs/marketplace/types';
import { getProductImage, getSupplierCover, getSupplierMedia } from '../../../libs/images/image-manifest';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

interface SupplierShowcaseProps {
  supplier: Supplier;
  products: ProductListing[];
  onBack: () => void;
  onOpenProduct: (productId: string) => void;
}

const formatNaira = (minor: number) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(minor / 100);

export function SupplierShowcase({ supplier, products, onBack, onOpenProduct }: SupplierShowcaseProps) {
  const cover = getSupplierCover(supplier.id, `${supplier.name} showroom and product range`);
  const gallery = supplier.media.slice(0, 4).map((media, index) => ({
    ...media,
    image: getSupplierMedia(supplier.id, index as 0 | 1 | 2 | 3, `${supplier.name}: ${media.title}`),
  })).filter((item) => item.image);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3 }} className="w-full">
      <Button variant="ghost" className="mb-3 -ml-2 rounded-full" onClick={onBack}><ArrowLeft size={16} /> Market</Button>

      <section className="relative overflow-hidden rounded-[2rem] bg-[#061a31] text-white shadow-[0_24px_70px_rgba(7,27,49,.2)]">
        {cover && <img src={cover.src} alt={cover.alt} className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[#031326] via-[#041a33]/95 to-[#041a33]/45" />
        <div className="relative grid min-h-[23rem] items-end gap-7 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-11">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge className="border-emerald-300/25 bg-emerald-400/15 text-emerald-100"><BadgeCheck size={12} /> Verified supplier</Badge>
              <Badge className="border-white/15 bg-white/10 text-white"><MapPin size={12} /> {supplier.city}, {supplier.country === 'CN' ? 'China' : 'Nigeria'}</Badge>
              <Badge className="border-white/15 bg-white/10 text-white">{supplier.category}</Badge>
            </div>
            <p className="mt-7 text-[10px] font-bold uppercase tracking-[.18em] text-sky-300">Supplier showcase</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-.045em] sm:text-5xl">{supplier.name}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">{supplier.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button className="rounded-full bg-white text-[#071b31] hover:bg-sky-50" onClick={() => products[0] && onOpenProduct(products[0].id)}>Browse products <ArrowRight size={15} /></Button>
              <Button variant="outline" className="rounded-full border-white/20 bg-white/[.08] text-white hover:bg-white/15 hover:text-white" onClick={() => document.querySelector('#supplier-profile')?.scrollIntoView({ behavior: 'smooth' })}>View supplier details</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/15 bg-black/20 backdrop-blur-md lg:grid-cols-1">
            {[{ label: 'Rating', value: supplier.rating.toFixed(1), icon: Star }, { label: 'Completed orders', value: supplier.completedOrders, icon: Factory }, { label: 'Response rate', value: `${supplier.responseRate}%`, icon: Globe2 }].map((item) => <div key={item.label} className="border-r border-white/10 p-4 last:border-0 lg:border-b lg:border-r-0 lg:p-5"><item.icon size={15} className="text-sky-300" /><strong className="mt-2 block text-lg sm:text-xl">{item.value}</strong><span className="mt-0.5 block text-[10px] text-white/55 sm:text-xs">{item.label}</span></div>)}
          </div>
        </div>
      </section>

      <Tabs id="supplier-profile" defaultValue="products" className="mt-6 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <TabsList className="h-11 rounded-full bg-muted p-1">
            <TabsTrigger value="products" className="rounded-full px-5">Products</TabsTrigger>
            <TabsTrigger value="showcase" className="rounded-full px-5">Inside the business</TabsTrigger>
            <TabsTrigger value="trust" className="rounded-full px-5">Trust Profile</TabsTrigger>
          </TabsList>
          <p className="text-xs text-muted-foreground">{products.length} products · MOQ shown per listing</p>
        </div>

        <TabsContent value="products" className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => {
              const image = getProductImage(product.id);
              return <motion.button key={product.id} type="button" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, delay: Math.min(index * .04, .2) }} onClick={() => onOpenProduct(product.id)} className="group overflow-hidden rounded-3xl border bg-card text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="aspect-[4/3] overflow-hidden bg-muted">{image ? <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageOff size={22} /></div>}</div><div className="p-4"><p className="line-clamp-2 text-sm font-bold sm:text-base">{product.title}</p><p className="mt-2 text-base font-bold sm:text-lg">{formatNaira(product.estimatedNgnMinor)}</p><div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-muted-foreground"><span>MOQ {product.minimumOrderQuantity} {product.unit}s</span>{product.translatedByNaitrust && <span className="flex items-center gap-1"><Languages size={11} /> English</span>}</div></div></motion.button>;
            })}
          </div>
        </TabsContent>

        <TabsContent value="showcase" className="mt-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {gallery.map((media, index) => <motion.figure key={media.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, delay: index * .05 }} className="overflow-hidden rounded-3xl border bg-card"><img src={media.image!.src} alt={media.image!.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" /><figcaption className="p-4"><p className="text-sm font-semibold">{media.title}</p>{media.caption && <p className="mt-1 text-xs leading-5 text-muted-foreground">{media.caption}</p>}</figcaption></motion.figure>)}
            </div>
            <Card className="h-fit rounded-3xl p-5"><Factory size={20} className="text-primary" /><h2 className="mt-4 font-bold">How this supplier operates</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Review the product range, production environment, quality checks and packing process before requesting a quote.</p><div className="mt-5 border-t pt-4"><p className="flex items-center gap-2 text-sm font-semibold"><Globe2 size={15} className="text-primary" /> Fulfilment</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Ships to {supplier.fulfilmentRegions.join(', ')}.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Languages: {supplier.languages.join(', ')}.</p></div></Card>
          </div>
        </TabsContent>

        <TabsContent value="trust" className="mt-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Card className="rounded-3xl p-6 sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><ShieldCheck size={22} /></div><h2 className="mt-5 text-xl font-bold">What Naitrust checked</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{supplier.verificationSummary}</p><div className="mt-6 flex flex-wrap gap-2"><Badge variant="outline">Business identity</Badge><Badge variant="outline">Operating location</Badge><Badge variant="outline">Representative</Badge>{supplier.country === 'CN' && <Badge variant="outline">Export contact</Badge>}</div></Card>
            <Card className="rounded-3xl p-6"><BadgeCheck size={21} className="text-emerald-600" /><h2 className="mt-4 font-bold">Marketplace record</h2><dl className="mt-5 space-y-4"><div><dt className="text-xs text-muted-foreground">Completed orders</dt><dd className="mt-1 text-2xl font-bold">{supplier.completedOrders}</dd></div><div><dt className="text-xs text-muted-foreground">Customer rating</dt><dd className="mt-1 text-2xl font-bold">{supplier.rating.toFixed(1)}</dd></div><div><dt className="text-xs text-muted-foreground">Response rate</dt><dd className="mt-1 text-2xl font-bold">{supplier.responseRate}%</dd></div></dl></Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
