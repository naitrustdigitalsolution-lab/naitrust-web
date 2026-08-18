import { useMemo, useState } from 'react';
import { ChevronRight, Package, ShoppingCart, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { getProductImage } from '../../../libs/images/image-manifest';
import { marketProducts, marketSuppliers, marketplaceApi } from '../../../libs/marketplace/marketplace.api';
import type { CartItem, MarketCart, ProductListing, Supplier } from '../../../libs/marketplace/types';
import { formatNaira } from '../lib/money';
import { WorkspaceEmpty } from './WorkspaceEmpty';
import { WorkspaceHeader } from './WorkspaceHeader';

interface SupplierCartGroup {
  supplier: Supplier;
  rows: Array<{ item: CartItem; product: ProductListing }>;
}

function groupCart(cart: MarketCart): SupplierCartGroup[] {
  const grouped = new Map<string, SupplierCartGroup>();
  cart.items.forEach((item) => {
    const product = marketProducts.find((candidate) => candidate.id === item.productId);
    const supplier = product && marketSuppliers.find((candidate) => candidate.id === product.supplierId);
    if (!product || !supplier) return;
    const current = grouped.get(supplier.id) ?? { supplier, rows: [] };
    current.rows.push({ item, product });
    grouped.set(supplier.id, current);
  });
  return [...grouped.values()];
}

export function CartWorkspace() {
  const navigate = useNavigate();
  const [, refresh] = useState(0);
  const cart = marketplaceApi.getCart();
  const [address, setAddress] = useState(cart?.deliveryAddress ?? 'Lagos, Nigeria');
  const [requirements, setRequirements] = useState(cart?.requirements ?? '');
  const groups = useMemo(() => cart ? groupCart(cart) : [], [cart]);

  const saveItems = (items: CartItem[]) => {
    if (!cart) return;
    if (items.length === 0) marketplaceApi.clearCart();
    else marketplaceApi.saveCart({ ...cart, items, updatedAt: new Date().toISOString() });
    refresh((value) => value + 1);
  };

  const updateQuantity = (product: ProductListing, quantity: number) => {
    if (!cart) return;
    saveItems(cart.items.map((item) => item.productId === product.id
      ? { ...item, quantity: Math.max(product.minimumOrderQuantity, quantity) }
      : item));
  };

  const submit = async () => {
    if (!cart || !address.trim()) {
      toast.error('Add your delivery address first.');
      return;
    }
    const saved = marketplaceApi.saveCart({
      ...cart,
      deliveryAddress: address.trim(),
      requirements: requirements.trim(),
      updatedAt: new Date().toISOString(),
    });
    const quotes = await marketplaceApi.createQuoteBatch(saved);
    toast.success(`${quotes.length} supplier quote${quotes.length === 1 ? '' : 's'} created separately.`);
    navigate('/app/quotes');
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <WorkspaceHeader
        eyebrow="Wholesale cart"
        title="Review your supplier requests"
        description="Products are grouped by supplier. Each supplier receives a separate quote, so one order can move without waiting for another."
        icon={ShoppingCart}
      />
      {!cart || groups.length === 0 ? (
        <WorkspaceEmpty
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse wholesale products from China and Nigeria."
          actionLabel="Explore market"
          onAction={() => navigate('/app/market')}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            {groups.map(({ supplier, rows }) => (
              <Card key={supplier.id} className="overflow-hidden rounded-3xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/25 px-4 py-4 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Package size={18} /></span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground">{supplier.country === 'CN' ? 'China import' : 'Nigeria domestic'} · {rows.length} product{rows.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  {supplier.country === 'CN' && (
                    <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(`/app/agents?city=${encodeURIComponent(supplier.city)}&supplier=${supplier.id}`)}>
                      <UserCheck size={15} /> Find a local agent
                    </Button>
                  )}
                </div>
                <div className="divide-y px-4 sm:px-6">
                  {rows.map(({ item, product }) => {
                    const image = getProductImage(product.id);
                    return (
                      <article key={product.id} className="flex gap-3 py-4">
                        {image?.src ? (
                          <img src={image.src} alt={product.title} loading="lazy" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Package size={20} /></span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{product.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Estimated {formatNaira(product.estimatedNgnMinor)} per {product.unit}</p>
                          {item.customization && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">Customization: {item.customization}</p>}
                          <div className="mt-3 flex items-center gap-2">
                            <Input
                              aria-label={`Quantity for ${product.title}`}
                              type="number"
                              className="h-9 w-28"
                              min={product.minimumOrderQuantity}
                              value={item.quantity}
                              onChange={(event) => updateQuantity(product, Number(event.target.value))}
                            />
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => saveItems(cart.items.filter((candidate) => candidate.productId !== product.id))}>Remove</Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
          <Card className="h-fit rounded-3xl p-5 xl:sticky xl:top-24">
            <p className="font-semibold">Request {groups.length} supplier quote{groups.length === 1 ? '' : 's'}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Naitrust confirms product, service, and delivery costs for each supplier separately.</p>
            <Label htmlFor="delivery-address" className="mt-5 block">Delivery address</Label>
            <Input id="delivery-address" className="mt-2" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="City, state, Nigeria" />
            <Label htmlFor="requirements" className="mt-5 block">Shared requirements</Label>
            <Textarea id="requirements" className="mt-2 h-24 resize-none" value={requirements} onChange={(event) => setRequirements(event.target.value)} placeholder="Packaging, inspection or delivery notes" />
            <Button className="mt-5 h-11 w-full rounded-full" onClick={() => void submit()}>Send quote requests <ChevronRight size={15} /></Button>
          </Card>
        </div>
      )}
    </div>
  );
}
