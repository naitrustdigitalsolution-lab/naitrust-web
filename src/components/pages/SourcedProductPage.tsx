import { ArrowLeft, ExternalLink, MapPin, ShieldCheck, UserCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function SourcedProductPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const product = {
    id: params.get('id') ?? 'sourced-product',
    title: params.get('title') ?? 'Sourced product',
    source: params.get('source') ?? 'External marketplace',
    sourceUrl: params.get('sourceUrl') ?? '#',
    supplier: params.get('supplier') ?? 'Supplier shown on listing',
    city: params.get('city') ?? 'China',
    price: params.get('price') ?? 'Request price',
    moq: params.get('moq') ?? 'Confirm with supplier',
    image: params.get('image') ?? '',
    note: params.get('note') ?? 'Product information translated from the source listing.',
  };
  const agentParams = new URLSearchParams(params);
  agentParams.set('product', product.id);

  return <DashboardLayout title="Product details"><div className="mx-auto w-full max-w-5xl space-y-5">
    <Button variant="ghost" size="sm" onClick={() => navigate('/app/source')}><ArrowLeft size={15} /> Back to product search</Button>
    <Card className="overflow-hidden rounded-3xl p-0"><div className="grid lg:grid-cols-[1fr_1.05fr]">{product.image ? <img src={product.image} alt={product.title} className="h-full min-h-80 w-full object-cover" /> : <div className="min-h-80 bg-muted" />}<div className="p-5 sm:p-8"><div className="flex flex-wrap gap-2"><Badge>Found on {product.source}</Badge><Badge variant="outline">AI translated</Badge></div><h1 className="mt-5 text-2xl font-bold sm:text-3xl">{product.title}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{product.note}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Advertised price</p><strong className="mt-1 block text-lg">{product.price}</strong></div><div className="rounded-2xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Minimum order</p><strong className="mt-1 block text-lg">{product.moq}</strong></div></div><div className="mt-5 rounded-2xl border p-4"><p className="font-semibold">{product.supplier}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> {product.city}</p></div><div className="mt-5 rounded-2xl bg-amber-500/[.08] p-4 text-xs leading-5 text-muted-foreground"><ShieldCheck size={16} className="mb-2 text-amber-700" />This page represents the external listing inside Naitrust for review. The listing is not supplier verification.</div><div className="mt-5 grid gap-2 sm:grid-cols-2"><Button variant="outline" className="rounded-full" onClick={() => window.open(product.sourceUrl, '_blank', 'noopener,noreferrer')}><ExternalLink size={14} /> Visit original listing</Button><Button className="rounded-full" onClick={() => navigate(`/app/agents?${agentParams.toString()}`)}><UserCheck size={14} /> Verify with an agent</Button></div></div></div></Card>
  </div></DashboardLayout>;
}
