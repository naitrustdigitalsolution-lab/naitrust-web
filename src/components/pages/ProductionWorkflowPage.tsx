import { useMemo, useState } from 'react';
import { ArrowRight, Boxes, CalendarDays, CheckCircle2, Factory, Link2, PackageCheck, Plus, Search, Sparkles, Truck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { marketSuppliers } from '../../libs/marketplace/marketplace.api';
import { productionNetworkApi } from '../../libs/marketplace/production-network.api';
import type { ProductionStage, ProductionWorkflow } from '../../libs/marketplace/types';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

const stageIcons: Record<ProductionStage['kind'], typeof Boxes> = {
  product: Factory,
  packaging: Boxes,
  labels: PackageCheck,
  inspection: UserCheck,
  shipping: Truck,
};

const statusLabel: Record<ProductionStage['status'], string> = {
  needs_supplier: 'Needs supplier',
  supplier_selected: 'Supplier selected',
  quoted: 'Quoted',
  in_progress: 'In progress',
  complete: 'Complete',
};

export function ProductionWorkflowPage() {
  const [workflows, setWorkflows] = useState(() => productionNetworkApi.listWorkflows());
  const [selectedId, setSelectedId] = useState(() => productionNetworkApi.listWorkflows()[0]?.id ?? '');
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('Private-label footwear collection');
  const [brief, setBrief] = useState('Produce casual sneakers in black and white with our logo on the tongue and insole. Use mixed EU sizes 38 to 45.');
  const [quantity, setQuantity] = useState('600');
  const [targetDate, setTargetDate] = useState('');
  const [destination, setDestination] = useState('Lagos, Nigeria');
  const selected = workflows.find((workflow) => workflow.id === selectedId) ?? workflows[0];
  const chinaSuppliers = useMemo(() => marketSuppliers.filter((supplier) => supplier.country === 'CN'), []);

  const refresh = (preferredId?: string) => {
    const next = productionNetworkApi.listWorkflows();
    setWorkflows(next);
    if (preferredId) setSelectedId(preferredId);
  };

  const createWorkflow = () => {
    if (!name.trim() || !brief.trim() || Number(quantity) <= 0) {
      toast.error('Add a workflow name, product brief, and quantity.');
      return;
    }
    const workflow = productionNetworkApi.createWorkflow({ name: name.trim(), productBrief: brief.trim(), quantity: Number(quantity), targetDate: targetDate || undefined, destination: destination.trim() || 'Nigeria' });
    refresh(workflow.id);
    setCreateOpen(false);
    toast.success('Production workflow created.');
  };

  const updateStage = (workflowId: string, stageId: string, patch: Partial<ProductionStage>) => {
    productionNetworkApi.updateStage(workflowId, stageId, patch);
    refresh(workflowId);
  };

  const requestAgent = (workflowId: string, stageId: string) => {
    productionNetworkApi.requestAgent(workflowId, stageId);
    refresh(workflowId);
    toast.success('An agent sourcing request has been added for this stage.');
  };

  return (
    <DashboardLayout title="Production workflow">
      <div className="w-full">
        <section className="relative overflow-hidden rounded-3xl bg-[#061a31] p-5 text-white shadow-[0_20px_60px_rgba(4,22,47,.18)] sm:p-8">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-300">Build your brand</p><h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-[-.04em] sm:text-5xl">One product can move through several suppliers.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">Coordinate the main product, cartons, labels, inspection, and shipping as one production workflow. If a supplier is missing, ask a verified agent to source one.</p></div>
            <Button className="rounded-full bg-white text-[#071b31] hover:bg-white/90" onClick={() => setCreateOpen(true)}><Plus size={16} /> Start a workflow</Button>
          </div>
        </section>

        {workflows.length === 0 ? (
          <Card className="mt-5 grid min-h-80 place-items-center rounded-3xl border-dashed p-8 text-center"><div><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Link2 size={22} /></span><h2 className="mt-4 text-lg font-bold">No production workflows yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Start with the product you want to make. Packaging, labels, inspection, and shipping will be added as connected stages.</p><Button className="mt-5 rounded-full" onClick={() => setCreateOpen(true)}>Create workflow</Button></div></Card>
        ) : (
          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="space-y-2 lg:sticky lg:top-20">
              {workflows.map((workflow) => <button key={workflow.id} type="button" onClick={() => setSelectedId(workflow.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === workflow.id ? 'border-primary bg-primary/[.05] ring-1 ring-primary/15' : 'bg-card hover:border-primary/30'}`}><div className="flex items-center justify-between gap-2"><p className="line-clamp-2 text-sm font-semibold">{workflow.name}</p><ArrowRight size={14} className="shrink-0 text-muted-foreground" /></div><p className="mt-2 text-xs text-muted-foreground">{workflow.quantity.toLocaleString()} units · {workflow.stages.length} stages</p></button>)}
              <Button variant="outline" className="w-full rounded-full" onClick={() => setCreateOpen(true)}><Plus size={14} /> New workflow</Button>
            </aside>

            {selected && <div className="min-w-0"><Card className="rounded-3xl p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><Badge className="capitalize">{selected.status}</Badge><h2 className="mt-3 text-2xl font-bold">{selected.name}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{selected.productBrief}</p></div><div className="grid grid-cols-2 gap-2 text-xs"><span className="rounded-xl bg-muted px-3 py-2"><strong className="block text-base">{selected.quantity.toLocaleString()}</strong>Quantity</span><span className="rounded-xl bg-muted px-3 py-2"><strong className="block text-base">{selected.stages.filter((stage) => stage.status === 'complete').length}/{selected.stages.length}</strong>Complete</span></div></div><div className="mt-5 flex flex-wrap gap-3 border-t pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Truck size={13} /> {selected.destination}</span>{selected.targetDate && <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Target {new Date(selected.targetDate).toLocaleDateString()}</span>}</div></Card>

              <div className="mt-4 space-y-3">{selected.stages.map((stage, index) => { const Icon = stageIcons[stage.kind]; const supplier = marketSuppliers.find((item) => item.id === stage.supplierId); return <Card key={stage.id} className="rounded-2xl p-4 sm:p-5"><div className="flex gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stage.status === 'complete' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>{stage.status === 'complete' ? <CheckCircle2 size={18} /> : <Icon size={18} />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">Stage {index + 1}</p><h3 className="mt-1 font-semibold">{stage.title}</h3></div><Badge variant="outline">{statusLabel[stage.status]}</Badge></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{stage.requirement}</p><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><Select value={stage.supplierId ?? 'none'} onValueChange={(value) => updateStage(selected.id, stage.id, value === 'none' ? { supplierId: undefined, status: 'needs_supplier' } : { supplierId: value, agentTaskId: undefined, status: 'supplier_selected' })}><SelectTrigger className="h-10 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No supplier selected</SelectItem>{chinaSuppliers.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>{stage.agentTaskId ? <Button variant="outline" className="rounded-xl text-xs" disabled><Sparkles size={14} /> Agent sourcing requested</Button> : <Button variant="outline" className="rounded-xl text-xs" onClick={() => requestAgent(selected.id, stage.id)}><Search size={14} /> Ask an agent to source</Button>}</div>{supplier && <p className="mt-2 text-[11px] text-emerald-700">Selected: {supplier.name}, {supplier.city}</p>}</div></div></Card>; })}</div>
            </div>}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Start a production workflow</DialogTitle><DialogDescription>Describe the finished product in English. You can connect suppliers for packaging, labels, inspection, and shipping next.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="workflow-name">Workflow name</Label><Input id="workflow-name" className="mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Branded footwear collection" /></div><div><Label htmlFor="workflow-brief">What do you want to produce?</Label><Textarea id="workflow-brief" className="mt-2 min-h-32 resize-y" value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Describe the material, sizes, colours, branding, quality, and packaging you need." /><p className="mt-2 text-xs text-muted-foreground">Write naturally in English. Naitrust can translate the confirmed brief for Chinese suppliers.</p></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="workflow-quantity">Quantity</Label><Input id="workflow-quantity" className="mt-2" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div><div><Label htmlFor="workflow-date">Target date</Label><Input id="workflow-date" className="mt-2" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></div></div><div><Label htmlFor="workflow-destination">Final delivery destination</Label><Input id="workflow-destination" className="mt-2" value={destination} onChange={(event) => setDestination(event.target.value)} /></div></div><DialogFooter><Button className="w-full rounded-full" onClick={createWorkflow}>Create production workflow</Button></DialogFooter></DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
