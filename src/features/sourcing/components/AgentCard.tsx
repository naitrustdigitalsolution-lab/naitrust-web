import { BadgeCheck, Clock3, Heart, MapPin, Navigation, Star } from 'lucide-react';
import type { AgentProfile } from '../domain/types';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { getAgentRepresentativeImage } from '../../../libs/images/image-manifest';

const money = (minor: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(minor / 100);

export function AgentCard({ agent, favourite, reasons, onFavourite, onViewProfile, onPrimaryAction, primaryActionLabel = 'Hire' }: {
  agent: AgentProfile;
  favourite: boolean;
  reasons?: string[];
  onFavourite: () => void;
  onViewProfile: () => void;
  onPrimaryAction: () => void;
  primaryActionLabel?: 'Hire' | 'Choose';
}) {
  const representativePhoto = getAgentRepresentativeImage(agent.id);
  const displayName = agent.profileType === 'company' ? agent.businessName ?? agent.name : agent.name;
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2);
  return (
    <Card className="flex h-full flex-col rounded-2xl p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 shrink-0 border shadow-sm"><AvatarImage src={representativePhoto.src} alt={agent.name} className="object-cover" /><AvatarFallback>{initials}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"><BadgeCheck size={12} /> Vetted</div><h2 className="truncate text-sm font-bold">{displayName}</h2><p className="truncate text-[11px] text-muted-foreground">{agent.profileType === 'company' ? `Rep: ${agent.name}` : 'Independent sourcing professional'}</p></div>
        <div className="flex items-center gap-2"><Badge variant={agent.available ? 'success' : 'outline'} className="text-[10px]">{agent.available ? 'Available' : 'Unavailable · set by agent'}</Badge><button type="button" aria-label={favourite ? 'Remove agent from favourites' : 'Save agent to favourites'} onClick={onFavourite} className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${favourite ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/30' : 'text-muted-foreground hover:text-foreground'}`}><Heart size={16} className={favourite ? 'fill-current' : ''} /></button></div>
      </div>
      <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-muted-foreground">{agent.verificationSummary}</p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]"><span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> {agent.city}</span><span className="flex items-center gap-1"><Clock3 size={12} className="text-primary" /> {agent.yearsBasedInChina} years in China</span><span className="flex items-center gap-1"><Navigation size={12} className="text-primary" /> +{agent.secondaryCities.length} cities</span></div>
      <div className="mt-3 flex flex-wrap gap-1">{agent.expertise.slice(0, 2).map((item) => <span key={item} className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium">{item}</span>)}</div>
      {reasons?.length ? <p className="mt-3 line-clamp-1 text-[10px] font-medium text-primary">Match: {reasons.join(' · ')}</p> : null}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t pt-3 text-[11px]"><span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" /> {agent.rating || 'New'} · {agent.completedTasks} jobs</span><span className="font-semibold">From {money(agent.feeFromMinor)}</span></div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={onViewProfile}>View profile</Button>
          <Button size="sm" className="rounded-full" disabled={!agent.available} onClick={onPrimaryAction}>{agent.available ? primaryActionLabel : 'Unavailable'}</Button>
        </div>
      </div>
    </Card>
  );
}
