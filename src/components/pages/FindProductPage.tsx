import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ImagePlus, Link2, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { sourcingApi } from '../../features/sourcing/api/sourcing.api';
import { OperationsHeader } from '../../features/sourcing/components/OperationsHeader';
import { useOperationsRefresh } from '../../features/sourcing/hooks/use-operations-refresh';

const categories = ['Fashion & footwear', 'Electronics', 'Printing & packaging', 'Beauty & personal care', 'Furniture & interiors', 'Machinery & tools', 'General wholesale'];

export function FindProductPage() {
  useOperationsRefresh();
  const navigate = useNavigate();
  const requests = sourcingApi.listRequests();
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General wholesale');
  const [quantity, setQuantity] = useState(100);
  const [destination, setDestination] = useState('Lagos, Nigeria');
  const [loading, setLoading] = useState(false);
  const latest = requests[0];
  const isLink = useMemo(() => /^https?:\/\//i.test(source.trim()), [source]);

  const submit = async () => {
    if (!source.trim() && !description.trim()) { toast.error('Paste a link or describe the product you need.'); return; }
    if (!destination.trim()) { toast.error('Add the Nigerian delivery destination.'); return; }
    setLoading(true);
    try {
      const request = await sourcingApi.analyseInput({ source, description, category, quantity, destination });
      toast.success('Product brief created. Review the extracted information.');
      setSource(''); setDescription('');
      window.setTimeout(() => document.querySelector(`#${request.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Find a product">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <OperationsHeader eyebrow="Smart sourcing" title="Show us what you want to buy" description="Paste a public Chinese marketplace link or describe the product in English. Naitrust organizes the details, identifies what is missing, and prepares the supplier for verification." icon={Search} badge="AI-assisted" />
        <div className="grid gap-5 lg:grid-cols-[1fr_.72fr]">
          <Card className="rounded-3xl p-5 sm:p-7">
            <div className="flex gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{isLink ? <Link2 size={18} /> : <Sparkles size={18} />}</span><div><h2 className="font-bold">Product source</h2><p className="mt-1 text-xs text-muted-foreground">A link is helpful, but a written request works too.</p></div></div>
            <div className="mt-6 space-y-5">
              <div><Label htmlFor="source-link">Marketplace or supplier link</Label><div className="relative mt-2"><Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><Input id="source-link" className="h-11 pl-10" value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://detail.1688.com/..." /></div></div>
              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center"><span className="bg-card px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">or describe it</span></div></div>
              <div><Label htmlFor="product-description">What do you need?</Label><Textarea id="product-description" value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-28 resize-y" placeholder="Example: 600 casual sneakers with our black woven logo, sizes EU 36–46, packed in custom retail boxes." /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="source-quantity">Quantity</Label><Input id="source-quantity" className="mt-2" type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} /></div></div>
              <div><Label htmlFor="source-destination">Delivery destination</Label><Input id="source-destination" className="mt-2" value={destination} onChange={(event) => setDestination(event.target.value)} /></div>
              <button type="button" className="flex w-full items-center gap-3 rounded-2xl border border-dashed p-4 text-left text-muted-foreground transition hover:border-primary/50 hover:bg-primary/[.03]"><ImagePlus size={18} /><span><strong className="block text-sm text-foreground">Add product screenshots</strong><span className="text-xs">Mock upload support is represented in this frontend build.</span></span></button>
              <Button className="h-11 w-full rounded-full" disabled={loading} onClick={() => void submit()}>{loading ? 'Organizing product details…' : 'Create sourcing request'} <ArrowRight size={15} /></Button>
            </div>
          </Card>
          <aside className="space-y-4">
            <Card className="rounded-3xl p-5"><h2 className="font-bold">What happens next</h2><ol className="mt-4 space-y-3">{['AI extracts the product and supplier facts.', 'You confirm or complete missing details.', 'Naitrust checks the supplier information.', 'You can choose a nearby sourcing agent.'].map((item, index) => <li key={item} className="flex gap-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{index + 1}</span><span className="leading-6 text-muted-foreground">{item}</span></li>)}</ol></Card>
            {latest && <Card className="rounded-3xl border-primary/15 p-5"><div className="flex items-center justify-between"><Badge variant="outline" className="capitalize">{latest.status.replace(/_/g, ' ')}</Badge><span className="text-[10px] text-muted-foreground">Latest request</span></div><h2 className="mt-4 font-bold">{latest.title}</h2><p className="mt-1 text-xs text-muted-foreground">{latest.supplierCity}, China · {latest.quantity.toLocaleString()} units</p><Button variant="outline" className="mt-4 w-full rounded-full" onClick={() => navigate(`/app/agents?request=${latest.id}`)}>Find agents near supplier <ArrowRight size={14} /></Button></Card>}
          </aside>
        </div>
        <section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-lg font-bold">Your sourcing requests</h2><p className="text-xs text-muted-foreground">Each request keeps its supplier, agent, quote, and evidence separate.</p></div><Badge variant="secondary">{requests.length}</Badge></div><div className="grid gap-3 md:grid-cols-2">{requests.map((request) => <Card id={request.id} key={request.id} className="rounded-2xl p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{request.title}</h3><p className="mt-1 text-xs text-muted-foreground">{request.supplierCity}, China · {request.quantity.toLocaleString()} units</p></div><Badge variant={request.missingFields.length ? 'outline' : 'success'}>{request.missingFields.length ? `${request.missingFields.length} missing` : <><CheckCircle2 size={12} /> Ready</>}</Badge></div><div className="mt-4 flex flex-wrap gap-1.5">{request.extractedFields.map((field) => <Badge key={field.key} variant="secondary">{field.label}: {field.value}</Badge>)}</div><Button variant="ghost" className="mt-4 w-full rounded-full" onClick={() => navigate(`/app/agents?request=${request.id}`)}>Match sourcing agents <ArrowRight size={14} /></Button></Card>)}</div></section>
      </div>
    </DashboardLayout>
  );
}
