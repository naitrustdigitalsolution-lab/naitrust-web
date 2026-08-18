import { MapPin, Pause, Play, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin.api';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';

export function AgentOperationsSection() {
  const agents = adminApi.database().agents;
  return <div className="grid gap-4 md:grid-cols-2">{agents.map((agent) => <Card key={agent.id} className="rounded-3xl p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="font-bold">{agent.name}</h2><Badge variant={agent.available ? 'success' : 'outline'}>{agent.available ? 'Available' : 'Paused'}</Badge></div><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> {agent.city} · {agent.serviceRadiusKm} km</p></div><ShieldCheck size={19} className="text-emerald-600" /></div><div className="mt-4 flex flex-wrap gap-1">{agent.expertise.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div><div className="mt-4 flex items-center justify-between border-t pt-4 text-xs"><span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" /> {agent.rating || 'New'} · {agent.completedTasks} tasks</span><Button size="sm" variant="outline" className="rounded-full" onClick={() => { adminApi.setAgentStatus(agent.id, !agent.available); toast.success(agent.available ? 'Agent paused.' : 'Agent made available.'); }}>{agent.available ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Activate</>}</Button></div></Card>)}</div>;
}

export function LogisticsOperationsSection() {
  const providers = adminApi.database().logisticsProviders;
  return <div className="grid gap-4 md:grid-cols-2">{providers.map((provider) => <Card key={provider.id} className="rounded-3xl p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{provider.name}</h2><p className="mt-1 text-xs text-muted-foreground">{provider.routes.join(', ')}</p></div><Badge variant={provider.status === 'active' ? 'success' : 'outline'} className="capitalize">{provider.status}</Badge></div><div className="mt-4 flex flex-wrap gap-1">{provider.services.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div><p className="mt-4 text-xs leading-5 text-muted-foreground">{provider.verificationSummary}</p><div className="mt-4 flex gap-2 border-t pt-4">{provider.status === 'active' ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => { adminApi.setLogisticsStatus(provider.id, 'paused'); toast.success('Provider paused.'); }}><Pause size={13} /> Pause</Button> : <Button size="sm" className="rounded-full" onClick={() => { adminApi.setLogisticsStatus(provider.id, 'active'); toast.success('Provider activated.'); }}><Play size={13} /> Activate</Button>}<Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => { adminApi.setLogisticsStatus(provider.id, 'suspended'); toast.warning('Provider suspended.'); }}>Suspend</Button></div></Card>)}</div>;
}
