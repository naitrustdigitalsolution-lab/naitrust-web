import { BadgeCheck, Building2, Mail, MapPin, Phone, Star } from 'lucide-react';
import type { CounterpartyProfile } from '../../../libs/store/types';
import { counterpartyRelationLabel } from '../../../libs/counterparties/counterparty-options';
import { CounterpartyAvatar } from '../dashboard/CounterpartyAvatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

interface CounterpartyProfileOverviewProps {
  counterparty: CounterpartyProfile;
  onToggleFavourite: () => void;
  favouriteUpdating: boolean;
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon size={15} /></span>
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-0.5 break-words text-sm font-medium">{value || 'Not added'}</p></div>
    </div>
  );
}

export function CounterpartyProfileOverview({
  counterparty,
  onToggleFavourite,
  favouriteUpdating,
}: CounterpartyProfileOverviewProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="bg-[#c4e9fdb3] px-5 py-6 text-[#071b31] sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <CounterpartyAvatar name={counterparty.name} className="h-14 w-14 bg-white text-base text-[#087ff5] shadow-sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold sm:text-2xl">{counterparty.name}</h1>
                {(counterparty.identityVerified || counterparty.businessVerified) && <BadgeCheck size={18} className="shrink-0 text-emerald-700" />}
              </div>
              <p className="mt-1 text-sm text-[#35546f]">{counterparty.businessName ?? 'Individual contact'}</p>
              <Badge className="mt-3 rounded-full border-[#071b31]/10 bg-white/70 text-[#071b31] hover:bg-white/70">{counterpartyRelationLabel(counterparty.relation)}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-white bg-white/75 text-[#071b31] hover:bg-white" onClick={onToggleFavourite} disabled={favouriteUpdating}>
            <Star size={15} className={counterparty.isFavourite ? 'fill-amber-400 text-amber-400' : ''} />
            {counterparty.isFavourite ? 'Favourite' : 'Add to favourites'}
          </Button>
        </div>
      </div>

      <div className="px-5 py-3 sm:px-7">
        <DetailRow icon={Mail} label="Email" value={counterparty.email} />
        <div className="border-t"><DetailRow icon={Phone} label="Phone" value={counterparty.phone} /></div>
        <div className="border-t"><DetailRow icon={MapPin} label="Address" value={counterparty.address} /></div>
        <div className="border-t"><DetailRow icon={Building2} label="Business notes" value={counterparty.notes} /></div>
      </div>
    </Card>
  );
}

