import { useState } from 'react';
import { ImageOff, PackagePlus, Plus, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { catalogueAdminApi } from '../../api/catalogue-admin.api';

function SupplierForm({ onDone }: { onDone: () => void }) {
  const [country, setCountry] = useState<'CN' | 'NG'>('CN');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const submit = () => {
    if (![name, city, category, description].every((value) => value.trim())) return toast.error('Complete every supplier field.');
    catalogueAdminApi.createSupplier({ name, country, city, category, description });
    toast.success('Supplier added to the managed catalogue.');
    onDone();
  };
  return <><div className="grid gap-4 sm:grid-cols-2"><div><Label>Name</Label><Input className="mt-1.5" value={name} onChange={(event) => setName(event.target.value)} /></div><div><Label>Market</Label><Select value={country} onValueChange={(value) => setCountry(value as 'CN' | 'NG')}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CN">China</SelectItem><SelectItem value="NG">Nigeria</SelectItem></SelectContent></Select></div><div><Label>City</Label><Input className="mt-1.5" value={city} onChange={(event) => setCity(event.target.value)} /></div><div><Label>Category</Label><Input className="mt-1.5" value={category} onChange={(event) => setCategory(event.target.value)} /></div></div><div><Label>Description</Label><Textarea className="mt-1.5 h-24 resize-none" value={description} onChange={(event) => setDescription(event.target.value)} /></div><DialogFooter><Button className="w-full rounded-full" onClick={submit}>Create supplier</Button></DialogFooter></>;
}

function ProductForm({ onDone }: { onDone: () => void }) {
  const suppliers = catalogueAdminApi.list().suppliers;
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [moq, setMoq] = useState('1');
  const [unit, setUnit] = useState('unit');
  const [estimate, setEstimate] = useState('');
  const submit = () => {
    if (!supplierId || !title.trim() || !category.trim() || !description.trim() || !estimate) return toast.error('Complete every product field.');
    catalogueAdminApi.createProduct({ supplierId, title, category, description, minimumOrderQuantity: Number(moq), unit, estimatedNgnMinor: Math.round(Number(estimate) * 100) });
    toast.success('Draft product created. Add matching media before publishing.');
    onDone();
  };
  return <><div><Label>Supplier</Label><Select value={supplierId} onValueChange={setSupplierId}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{suppliers.map((supplier) => <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-4 sm:grid-cols-2"><div><Label>Product name</Label><Input className="mt-1.5" value={title} onChange={(event) => setTitle(event.target.value)} /></div><div><Label>Category</Label><Input className="mt-1.5" value={category} onChange={(event) => setCategory(event.target.value)} /></div><div><Label>Minimum order</Label><Input type="number" min="1" className="mt-1.5" value={moq} onChange={(event) => setMoq(event.target.value)} /></div><div><Label>Unit</Label><Input className="mt-1.5" value={unit} onChange={(event) => setUnit(event.target.value)} /></div><div className="sm:col-span-2"><Label>Estimated Naira price per unit</Label><Input type="number" min="0" className="mt-1.5" value={estimate} onChange={(event) => setEstimate(event.target.value)} /></div></div><div><Label>Description</Label><Textarea className="mt-1.5 h-24 resize-none" value={description} onChange={(event) => setDescription(event.target.value)} /></div><p className="rounded-xl bg-amber-500/10 p-3 text-xs leading-5 text-amber-800 dark:text-amber-200">New products stay hidden until a matching catalogue image and listing details are completed.</p><DialogFooter><Button className="w-full rounded-full" onClick={submit}>Create draft product</Button></DialogFooter></>;
}

function CatalogueSection({ kind }: { kind: 'suppliers' | 'products' }) {
  const [, refresh] = useState(0);
  const [open, setOpen] = useState(false);
  const data = catalogueAdminApi.list();
  const done = () => { setOpen(false); refresh((value) => value + 1); };
  if (kind === 'suppliers') return <><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{data.suppliers.length} managed suppliers across China and Nigeria.</p><Button className="rounded-full" onClick={() => setOpen(true)}><Plus size={15} /> Add supplier</Button></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.suppliers.map((supplier) => <Card key={supplier.id} className="rounded-2xl p-4"><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Store size={17} /></span><Badge variant={supplier.verified ? 'success' : 'secondary'}>{supplier.verified ? 'Active' : 'Paused'}</Badge></div><p className="mt-3 font-semibold">{supplier.name}</p><p className="mt-1 text-xs text-muted-foreground">{supplier.city}, {supplier.country === 'CN' ? 'China' : 'Nigeria'} · {supplier.category}</p><Button variant="outline" size="sm" className="mt-4 w-full rounded-full" onClick={() => { catalogueAdminApi.setSupplierAvailability(supplier.id, !supplier.verified); refresh((value) => value + 1); }}>{supplier.verified ? 'Pause listing' : 'Reactivate'}</Button></Card>)}</div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Add verified supplier</DialogTitle><DialogDescription>Create the managed catalogue record after operations has reviewed the supplier.</DialogDescription></DialogHeader><SupplierForm onDone={done} /></DialogContent></Dialog></>;

  return <><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{data.products.length} catalogue products. Image-incomplete drafts remain hidden.</p><Button className="rounded-full" onClick={() => setOpen(true)}><PackagePlus size={15} /> Add product</Button></div><div className="space-y-3">{data.products.map((product) => { const supplier = data.suppliers.find((candidate) => candidate.id === product.supplierId); return <Card key={product.id} className="flex flex-wrap items-center gap-4 rounded-2xl p-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><ImageOff size={18} /></span><div className="min-w-0 flex-1"><p className="font-semibold">{product.title}</p><p className="mt-1 text-xs text-muted-foreground">{supplier?.name} · MOQ {product.minimumOrderQuantity} {product.unit}</p></div><Badge variant={product.available ? 'success' : 'secondary'}>{product.available ? 'Published' : 'Draft'}</Badge><Button variant="outline" size="sm" className="rounded-full" onClick={() => { try { catalogueAdminApi.setProductAvailability(product.id, !product.available); refresh((value) => value + 1); } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to update product.'); } }}>{product.available ? 'Pause' : 'Publish'}</Button></Card>; })}</div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Add catalogue product</DialogTitle><DialogDescription>Create a production-shaped draft connected to one supplier.</DialogDescription></DialogHeader><ProductForm onDone={done} /></DialogContent></Dialog></>;
}

export function SupplierCatalogueSection() { return <CatalogueSection kind="suppliers" />; }
export function ProductCatalogueSection() { return <CatalogueSection kind="products" />; }
