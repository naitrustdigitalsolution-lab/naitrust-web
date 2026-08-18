import { BadgeCheck, Heart, MapPin, Star } from 'lucide-react';
import type { AgentProfile } from '../domain/types';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

const money = (minor: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(minor / 100);

export function AgentCard({ agent, favourite, reasons, onFavourite, onHire }: {
  agent: AgentProfile;
  favourite: boolean;
  reasons?: string[];
  onFavourite: () => void;
  onHire: () => void;
}) {
  return (
    <Card className="flex h-full flex-col rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">{agent.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
        <button type="button" aria-label={favourite ? 'Remove agent from favourites' : 'Save agent to favourites'} onClick={onFavourite} className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${favourite ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/30' : 'text-muted-foreground hover:text-foreground'}`}><Heart size={16} className={favourite ? 'fill-current' : ''} /></button>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><BadgeCheck size={14} /> Vetted by Naitrust</div>
      <h2 className="mt-2 text-lg font-bold">{agent.name}</h2>
      <p className="mt-1 text-xs font-medium text-foreground/75">{agent.profileType === 'company' ? agent.businessName : 'Nigerian sourcing professional'} · {agent.yearsBasedInChina} years in China</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> {agent.city} · {agent.serviceRadiusKm} km service area</p>
      <div className="mt-4 flex flex-wrap gap-1.5">{agent.expertise.slice(0, 3).map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div>
      {reasons && <div className="mt-4 rounded-2xl bg-primary/[.045] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-primary">Why this match</p><ul className="mt-2 space-y-1 text-xs text-muted-foreground">{reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul></div>}
      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3 border-t pt-4 text-xs"><span className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {agent.rating || 'New'} · {agent.completedTasks} tasks</span><span className="text-right font-semibold">{money(agent.feeFromMinor)}–{money(agent.feeToMinor)}</span></div>
        <Button className="mt-4 w-full rounded-full" disabled={!agent.available} onClick={onHire}>{agent.available ? 'Hire for this supplier' : 'Currently unavailable'}</Button>
      </div>
    </Card>
  );
}
